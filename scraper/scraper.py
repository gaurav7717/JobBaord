import requests
from selenium import webdriver
from bs4 import BeautifulSoup
import time
import json
import logging
import pymongo
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "job_board")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "job_listings")
KEYWORD = os.getenv("KEYWORD", "software engineer")

def get_mongo_collection():
    """Establishes a connection to MongoDB and returns the job collection."""
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        return collection
    except pymongo.errors.ConnectionFailure as e:
        logging.error(f"Failed to connect to MongoDB: {e}")
        return None

def scrape_naukri_jobs(url, max_pages=5):
    """Scrapes job listings from Naukri.com, saves to MongoDB and JSON."""

    driver = webdriver.Chrome()
    all_job_data = []
    job_collection = get_mongo_collection()

    if job_collection is None: # the change is here.
        return

    for page_num in range(1, max_pages + 1):
        page_url = f"{url}&pageNo={page_num}" if page_num > 1 else url
        logging.info(f"Scraping page {page_num}: {page_url}")

        try:
            driver.get(page_url)
            time.sleep(8)

            soup = BeautifulSoup(driver.page_source, 'html5lib')
            results = soup.find(class_='styles_jlc__main__VdwtF')

            if results:
                job_wrappers = results.find_all('div', class_='srp-jobtuple-wrapper')

                for wrapper in job_wrappers:
                    job_elem = wrapper.find('div', class_='cust-job-tuple')

                    if job_elem:
                        title_element = job_elem.find('a', class_='title')
                        company_element = job_elem.find('a', class_='comp-name')
                        location_element = job_elem.find('span', class_='locWdth')
                        experience_element = job_elem.find('span', class_='expwdth')
                        salary_element = job_elem.find('span', class_='')
                        url_element = title_element['href'] if title_element else None

                        title = title_element.text.strip() if title_element else None
                        company = company_element.text.strip() if company_element else None
                        location = location_element.text.strip() if location_element else None
                        experience = experience_element.text.strip() if experience_element else None
                        salary = salary_element.text.strip() if salary_element else None

                        job_data = {
                            'job_title': title,
                            'company': company,
                            'location': location,
                            'experience': experience,
                            'salary': salary,
                            'URL': url_element,
                            'keyword': KEYWORD
                        }
                        all_job_data.append(job_data)
            else:
                logging.warning(f"Job listings container not found on page {page_num}.")

        except Exception as e:
            logging.error(f"Error scraping page {page_num}: {e}")

    driver.quit()

    try:
        if all_job_data:
            job_collection.insert_many(all_job_data)
            logging.info(f"Inserted {len(all_job_data)} job listings into MongoDB.")
        else:
            logging.info("No jobs to insert into MongoDB.")
    except pymongo.errors.PyMongoError as e:
        logging.error(f"Error inserting into MongoDB: {e}")

    try:
        with open('job_listings.json', 'w', encoding='utf-8') as f:
            json.dump(all_job_data, f, ensure_ascii=False, indent=4)
        logging.info(f"Job listings saved to job_listings.json")
    except Exception as e:
        logging.error(f"Error saving to JSON: {e}")

if __name__ == "__main__":
    base_url = 'https://www.naukri.com/software-engineer-jobs?k=software%20engineer'
    scrape_naukri_jobs(base_url)