import csv
import re
import sys
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# --- Parsing functions (no changes) ---
def parse_price(price_str):
    if not isinstance(price_str, str) or price_str == "N/A": return "N/A"
    try:
        price_str = price_str.lower().replace("rp", "").replace(",", ".").strip()
        if "miliar" in price_str: value = float(re.sub(r'[^0-9\.]', '', price_str)) * 1_000_000_000
        elif "juta" in price_str: value = float(re.sub(r'[^0-9\.]', '', price_str)) * 1_000_000
        else: value = float(re.sub(r'[^0-9]', '', price_str))
        return int(value)
    except (ValueError, TypeError): return "N/A"

def parse_area(area_str):
    if not isinstance(area_str, str) or area_str == "N/A": return "N/A"
    match = re.search(r'[0-9\.]+', area_str)
    if match:
        try: return float(match.group(0))
        except (ValueError, TypeError): return "N/A"
    return "N/A"

# --- Main scraping function (updated) ---
def scrape_page(base_url, page_number):
    """
    Scrapes all property details from a specific URL and page number.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Construct the URL from the base URL and page number
        url = f"{base_url.rstrip('/')}/?page={page_number}"
        print(f"  - Navigating to: {url}...")

        try:
            page.goto(url, wait_until="networkidle", timeout=90000)
            for i in range(5):
                page.mouse.wheel(0, 1500)
                time.sleep(1)

            listings = page.locator('div.featured-card-component, div[data-test-id="card-regular"]')
            listing_count = listings.count()
            
            if listing_count == 0:
                print(f"  - No listings found on page {page_number}.")
                page.screenshot(path=f"scraper_debug_page_{page_number}.png")
                return []
            
            print(f"  - Found {listing_count} listings. Scraping data...")
            scraped_data = []

            for i in range(listing_count):
                listing = listings.nth(i)
                price_raw, location_raw, lt_raw, lb_raw = ("N/A",) * 4
                bedrooms, bathrooms, garage = ("N/A",) * 3
                listing_url, image_url = "N/A", "N/A"

                price_el = listing.locator('div.card-featured__middle-section__price strong, div[data-test-id="card-price"]').first
                if price_el.count(): price_raw = price_el.inner_text().strip()

                location_el = listing.locator('a[title] + span, p[data-test-id="card-location"]').first
                if location_el.count(): location_raw = location_el.inner_text().strip()

                attribute_list_container = listing.locator('div.ui-molecules-list__divider-none--horizontal').first
                if attribute_list_container.count():
                    attribute_items = attribute_list_container.locator('div.relative.ui-molecules-list__item')
                    for j in range(attribute_items.count()):
                        item = attribute_items.nth(j)
                        icon_href_el = item.locator('svg use').first
                        if icon_href_el.count():
                            icon_href = icon_href_el.get_attribute('xlink:href') or ""
                            value_el = item.locator('span.attribute-text').first
                            value = value_el.inner_text().strip() if value_el.count() else "N/A"
                            if 'bed' in icon_href: bedrooms = value
                            elif 'bath' in icon_href: bathrooms = value
                            elif 'car' in icon_href: garage = value
                else:
                    bed_el = listing.locator('p:has-text("KT")').first
                    if bed_el.count(): bedrooms = re.sub(r'\s*KT.*', '', bed_el.inner_text()).strip()
                    bath_el = listing.locator('p:has-text("KM")').first
                    if bath_el.count(): bathrooms = re.sub(r'\s*KM.*', '', bath_el.inner_text()).strip()
                    garage_el = listing.locator('p:has-text("GRS")').first
                    if garage_el.count(): garage = re.sub(r'\s*GRS.*', '', garage_el.inner_text()).strip()

                land_area_el = listing.locator("div.attribute-info:has-text('LT') span, p:has-text('LT')").first
                if land_area_el.count(): lt_raw = land_area_el.inner_text().strip()

                building_area_el = listing.locator("div.attribute-info:has-text('LB') span, p:has-text('LB')").first
                if building_area_el.count(): lb_raw = building_area_el.inner_text().strip()
                
                link_el = listing.locator('a[href^="/properti/"]').first
                if link_el.count():
                    href = link_el.get_attribute('href')
                    if href:
                        listing_url = "https://www.rumah123.com" + href
                
                img_el = listing.locator('img').first
                if img_el.count():
                    src = img_el.get_attribute('src')
                    if src:
                        image_url = src

                scraped_data.append({
                    "price": parse_price(price_raw), 
                    "location": location_raw, 
                    "bedrooms": bedrooms,
                    "toilet": bathrooms, 
                    "garage": garage, 
                    "LT": parse_area(lt_raw), 
                    "LB": parse_area(lb_raw),
                    "listing_url": listing_url, 
                    "image_url": image_url,
                    "source": "rumah123" # --- NEW COLUMN ADDED ---
                })
            
            return scraped_data

        except PlaywrightTimeoutError:
            print(f"❌ Timeout Error on page {page_number}. Saving a screenshot.")
            page.screenshot(path=f"scraper_debug_page_{page_number}.png")
            return []
        finally:
            browser.close()

def save_to_csv(data, filename):
    if not data:
        print("No data to save.")
        return
    # --- MODIFIED: Added 'source' fieldname ---
    fieldnames = ['price', 'location', 'bedrooms', 'toilet', 'garage', 'LT', 'LB', 'listing_url', 'image_url', 'source']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f"\n✅ Success! Data has been saved to '{filename}'")

if __name__ == "__main__":
    # --- MODIFIED: Accept 2 arguments ---
    if len(sys.argv) != 3: # script name, base_url, page_number
        print("❌ Error: Please provide a base_url and a page_number.")
        print("Usage: python rumah123scraper.py <base_url> <page_number>")
        sys.exit(1)
        
    try:
        base_url = sys.argv[1]
        page_to_scrape = int(sys.argv[2])
    except ValueError:
        print("❌ Error: Page number must be an integer.")
        sys.exit(1)

    property_data = scrape_page(base_url, page_to_scrape)
    
    if property_data:
        # Save to a dynamic filename in the 'output' folder
        output_filename = f"output/properties_page_{page_to_scrape}.csv"
        save_to_csv(property_data, output_filename)