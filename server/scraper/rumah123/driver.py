import sys
import time
import subprocess
import os
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# --- NEW: List of target URLs ---
URLS = {
    "1": ("dki-jakarta", "https://www.rumah123.com/jual/dki-jakarta/rumah/"),
    "2": ("bogor", "https://www.rumah123.com/jual/bogor/rumah/"),
    "3": ("depok", "https://www.rumah123.com/jual/depok/rumah/"),
    "4": ("tangerang", "https://www.rumah123.com/jual/tangerang/rumah/"),
    "5": ("tangerang-selatan", "https://www.rumah123.com/jual/tangerang-selatan/rumah/"),
    "6": ("bekasi", "https://www.rumah123.com/jual/bekasi/rumah/"),
}

# --- UPDATED: Accepts base_url ---
def find_max_page_number(browser, base_url):
    """Finds and returns the maximum page number from the pagination control."""
    page = browser.new_page()
    url = f"{base_url.rstrip('/')}/?page=1"
    print(f"Finding max page number from {url}...")
    try:
        page.goto(url, wait_until="networkidle", timeout=60000)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

        last_page_selector = "ul.ui-molecule-paginate li:nth-last-child(2) a"
        last_page_element = page.locator(last_page_selector).first
        
        if last_page_element.count():
            max_page = last_page_element.inner_text().strip()
            print(f"✅ Maximum page number found: {max_page}")
            return int(max_page)
        else:
            print("❌ Could not find the pagination element.")
            return None
    except PlaywrightTimeoutError:
        print("❌ Timeout Error while finding max page number.")
        return None
    finally:
        page.close()

# --- Main Driver ---
if __name__ == "__main__":
    
    # --- NEW: Region selection menu ---
    print("Please select a region to scrape:")
    for key, (name, url) in URLS.items():
        print(f"  {key}: {name} ({url})")
    
    choice = input("Enter choice (1-6): ").strip()
    
    if choice not in URLS:
        print("❌ Error: Invalid choice. Exiting.")
        sys.exit(1)
        
    region_name, chosen_base_url = URLS[choice]
    print(f"Selected region: {region_name}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Pass the chosen URL to find the max pages for that region
        max_pages = find_max_page_number(browser, chosen_base_url)
        browser.close()
        
    if max_pages is None:
        print("Could not determine the number of pages. Exiting.")
        sys.exit(1)

    print(f"\nWhich pages for '{region_name}' would you like to scrape in parallel?")
    print(" - Enter a range like '1-10'.")
    user_input = input("> ").strip().lower()

    pages_to_scrape = []
    if '-' in user_input:
        try:
            start, end = map(int, user_input.split('-'))
            if start < 1 or end > max_pages:
                print(f"Error: Page range must be between 1 and {max_pages}.")
                sys.exit(1)
            pages_to_scrape = range(start, end + 1)
        except ValueError:
            print("Invalid range. Exiting.")
            sys.exit(1)
    else:
        print("Invalid input. Please provide a range (e.g., '1-20'). Exiting.")
        sys.exit(1)

    # --- PARALLEL EXECUTION LOGIC ---
    print(f"\n🚀 Launching {len(pages_to_scrape)} scrapers for '{region_name}'...")
    
    # --- NEW: Create a region-specific output directory ---
    output_dir = os.path.join(os.getcwd(), "output", region_name)
    os.makedirs(output_dir, exist_ok=True)
    print(f"CSV files will be saved in: {output_dir}")
    
    processes = []
    for page_num in pages_to_scrape:
        print(f"  - Starting container for page {page_num}...")
        
        # --- MODIFIED: Pass base_url and page_num to the container ---
        command = [
            "docker", "run", "--rm",
            "-v", f"{output_dir}:/app/output",  # Mount the specific output directory
            "rumah123-scraper",                 # The name of your Docker image
            chosen_base_url,                    # Argument 1: Base URL
            str(page_num)                       # Argument 2: Page Number
        ]
        
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processes.append(proc)

    print("\nAll containers launched. Waiting for them to complete...")
    
    for proc in processes:
        stdout, stderr = proc.communicate() 
        if proc.returncode != 0:
            print(f"--- ERROR in a container ---")
            print(stderr.decode('utf-8'))
            print("----------------------------")

    print("✅ All scraping jobs finished.")
    print(f"Individual CSV files are located in the '{output_dir}' directory.")
    print("You may now merge them using merge_csv.py")