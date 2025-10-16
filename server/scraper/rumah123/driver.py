import sys
import time
import subprocess
import os
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def find_max_page_number(browser):
    """Finds and returns the maximum page number from the pagination control."""
    page = browser.new_page()
    url = "https://www.rumah123.com/jual/rumah/?page=1"
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

# --- The Main Driver ---
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        max_pages = find_max_page_number(browser)
        browser.close()
        
    if max_pages is None:
        print("Could not determine the number of pages. Exiting.")
        sys.exit(1)

    print("\nWhich pages would you like to scrape in parallel?")
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
    print(f"\n🚀 Launching {len(pages_to_scrape)} scrapers in parallel Docker containers...")
    
    # Create the output directory if it doesn't exist
    output_dir = os.path.join(os.getcwd(), "output")
    os.makedirs(output_dir, exist_ok=True)
    
    processes = []
    for page_num in pages_to_scrape:
        print(f"  - Starting container for page {page_num}...")
        command = [
            "docker", "run", "--rm",
            "-v", f"{output_dir}:/app/output",  # Mount the output directory
            "rumah123-scraper",                # The name of your Docker image
            str(page_num)                      # The page number argument
        ]
        
        # subprocess.Popen runs the command in a new process without blocking
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        processes.append(proc)

    print("\nAll containers launched. Waiting for them to complete...")
    
    # Wait for all processes to finish and check for errors
    for proc in processes:
        stdout, stderr = proc.communicate() # This waits for the process to finish
        if proc.returncode != 0:
            print(f"--- ERROR in a container ---")
            print(stderr.decode('utf-8'))
            print("----------------------------")

    print("✅ All scraping jobs finished.")
    print("Individual CSV files are located in the 'output' directory.")
    print("You may now merge them into a single file.")