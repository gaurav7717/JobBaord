import requests
from selenium import webdriver
from bs4 import BeautifulSoup
import time
import json
import logging
import pymongo
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "job_board")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "job_listings")

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

def scrape_naukri_jobs(url, keyword, max_pages=4):
    """Scrapes job listings from Naukri.com, saves to MongoDB and JSON."""
    driver = webdriver.Chrome()
    all_job_data = []
    job_collection = get_mongo_collection()

    if job_collection is None:
        return

    for page_num in range(1, max_pages + 1):
        page_url = f"{url}&pageNo={page_num}" if page_num > 1 and 'pageNo' not in url else f"{url}&pageNo={page_num}" if page_num > 1 else url
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

                    if not job_elem:
                        continue

                    # Extract basic job info
                    title_element = job_elem.find('a', class_='title')
                    company_element = job_elem.find('a', class_='comp-name')
                    location_element = job_elem.find('span', class_='locWdth')
                    experience_element = job_elem.find('span', class_='expwdth')
                    salary_element = job_elem.find('span', class_='')
                    url_element = title_element['href'] if title_element else None

                    # Extract skills
                    skills = []
                    skills_container = wrapper.find('ul', class_='tags-gt')
                    if skills_container:
                        skill_tags = skills_container.find_all('li', class_='dot-gt tag-li')
                        skills = [tag.text.strip() for tag in skill_tags]
                        logging.info(f"Found {len(skills)} skills for position: {title_element.text.strip() if title_element else 'Unknown'}")

                    job_data = {
                        'job_title': title_element.text.strip() if title_element else None,
                        'company': company_element.text.strip() if company_element else None,
                        'location': location_element.text.strip() if location_element else None,
                        'experience': experience_element.text.strip() if experience_element else None,
                        'salary': salary_element.text.strip() if salary_element else None,
                        'URL': url_element,
                        'keyword': keyword,
                        'skills': skills
                    }
                    all_job_data.append(job_data)
                    logging.debug(f"Job data: {json.dumps(job_data, indent=2)}")
            else:
                logging.warning(f"Job listings container not found on page {page_num}.")

        except Exception as e:
            logging.error(f"Error scraping page {page_num}: {e}")

    driver.quit()

    try:
        if all_job_data:
            job_collection.insert_many(all_job_data)
            logging.info(f"Inserted {len(all_job_data)} job listings for keyword '{keyword}' into MongoDB.")
        else:
            logging.info(f"No jobs to insert into MongoDB for keyword '{keyword}'.")
    except pymongo.errors.PyMongoError as e:
        logging.error(f"Error inserting into MongoDB: {e}")


if __name__ == "__main__":
    job_urls = [
        "https://www.naukri.com/data-science-jobs?k=data%20science",
        "https://www.naukri.com/software-developer-jobs?k=software%20developer&nignbevent_src=jobsearchDeskGNB",
        "https://www.naukri.com/qa-engineer-jobs?k=qa%20engineer&nignbevent_src=jobsearchDeskGNB",
        "https://www.naukri.com/cloud-engineer-jobs?k=cloud%20engineer&nignbevent_src=jobsearchDeskGNB",
        "https://www.naukri.com/testing-jobs?k=testing&nignbevent_src=jobsearchDeskGNB"
    ]

    for url in job_urls:
        parsed_url = urlparse(url)
        query_params = parse_qs(parsed_url.query)
        keyword_list = query_params.get('k')
        keyword = keyword_list[0] if keyword_list else "unknown"
        logging.info(f"Starting scraping for keyword: {keyword}")
        scrape_naukri_jobs(url, keyword)

    logging.info("Scraping completed for all URLs.")