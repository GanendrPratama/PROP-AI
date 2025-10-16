import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def find_max_page_number():
    """
    Finds and returns the maximum page number from the pagination control.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        url = "https://www.rumah123.com/jual/rumah/?page=1"
        print(f"Navigating to {url} to find the pagination control...")

        try:
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            print("Scrolling to the bottom of the page...")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)

            # --- CORRECTED SELECTOR IS HERE ---
            # It now targets the 'a' tag inside the second-to-last 'li' element.
            last_page_selector = "ul.ui-molecule-paginate li:nth-last-child(2) a"
            
            print(f"Looking for selector: '{last_page_selector}'")
            last_page_element = page.locator(last_page_selector).first
            
            if last_page_element.count():
                max_page = last_page_element.inner_text().strip()
                print(f"✅ Found maximum page number: {max_page}")
                return int(max_page)
            else:
                print("❌ Could not find the pagination element.")
                page.screenshot(path="max_page_debug.png")
                return None

        except PlaywrightTimeoutError:
            print("❌ Timeout Error while trying to load the page.")
            page.screenshot(path="max_page_debug.png")
            return None
        finally:
            browser.close()

if __name__ == "__main__":
    max_pages = find_max_page_number()
    if max_pages:
        print(f"\nThere are a total of {max_pages} pages available to scrape.")