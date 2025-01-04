import os
import requests
import pickle
import json
from bs4 import BeautifulSoup
import re
import time
import uuid

class AISISClient:
    def __init__(self):
        self.base_url = 'https://aisis.ateneo.edu'
        self.session = requests.Session()
        self.cookies_file = 'cookies.pkl'
        self.logged_in = False

        self._load_cookies()

    def _load_cookies(self):
        """Load cookies from file if available and set them in session."""
        if os.path.exists(self.cookies_file):
            with open(self.cookies_file, 'rb') as file:
                cookies = pickle.load(file)
                self.session.cookies.update(cookies)
            self.logged_in = self._is_session_valid()
            if self.logged_in:
                print("Loaded session from saved cookies.")
            else:
                print("Session expired, re-login required.")            

    def _is_session_valid(self):
        """Check if the session is still valid by making an authenticated request."""
        try:
            response = self.session.get(f"{self.base_url}/j_aisis/J_VMCS.do")
            return response.ok and "MY INDIVIDUAL PROGRAM OF STUDY" in response.text
        except requests.RequestException:
            return False

    def login(self, username, password):
        """Login and save cookies if not already logged in."""
        if self.logged_in:
            print("Already logged in.")
            return True

        login_url = f"{self.base_url}/j_aisis/login.do"
        form_data = {
            "userName": username,
            "password": password,
            "submit": "Sign in",
            "command": "login",
            "rnd": f"r{''.join(['%02x' % i for i in bytearray(os.urandom(10))])}"
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        try:
            response = self.session.post(login_url, data=form_data, headers=headers)
            if response.ok and "User Identified As" in response.text:
                self.logged_in = True
                self._save_cookies()
                print("Login successful and cookies saved.")
                return True
            else:
                print("Login failed.")
                return False
        except requests.RequestException as e:
            print(f"Login error: {e}")
            return False

    def _save_cookies(self):
        """Save session cookies to a file."""
        with open(self.cookies_file, 'wb') as file:
            pickle.dump(self.session.cookies, file)

    def warmup(self):
        url = f"{self.base_url}/j_aisis/J_VCSC.do"
        body = f"command=displayResults&applicablePeriod='2024-2'&deptCode='IE'&subjCode='ALL'"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://aisis.ateneo.edu",
            "Referer": "https://aisis.ateneo.edu/j_aisis/J_VCSC.do"
        }

        try:
            response = self.session.post(url, data=body)
            if not response.ok:
                raise Exception(f"Request failed: {response.status_code}")
            print("Good to go, starting script.")
        except requests.RequestException as e:
            print(f"Error warming up: {e}")
            return None
        
    def get_course_results(self, applicable_period, dept_code):
        """Retrieve course results for a given period and department, parse them, and save to JSON."""
        url = f"{self.base_url}/j_aisis/J_VCSC.do"
        body = f"command=displayResults&applicablePeriod={applicable_period}&deptCode={dept_code}&subjCode=ALL"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://aisis.ateneo.edu",
            "Referer": "https://aisis.ateneo.edu/j_aisis/J_VCSC.do"
        }
        try:
            # if it doesn't work, remove the headers, run it, then add it back, why? idk
            response = self.session.post(url, data=body, headers=headers)
            if not response.ok:
                raise Exception(f"Request failed: {response.status_code}")

            courses = self.parse_courses(response.text, dept_code)
            return courses
        except requests.RequestException as e:
            print(f"Error fetching course results: {e}")
            return None

    def parse_courses(self, html_content, dept_code):
        """
        Parse full HTML content and return an array of course objects.
        
        Args:
            html_content (str): Full HTML string
            
        Returns:
            list: Array of course information dictionaries
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        courses = []
        
        course_cells = soup.find_all('td', class_='text02')
        print(course_cells)
        for i in range(0, len(course_cells), 14):
            if i + 13 < len(course_cells):
                cells = course_cells[i:i+14]
                time_text = cells[4].text.strip()
                
                course = {
                    'id': str(uuid.uuid4()),
                    'deptCode': dept_code,
                    'catNo': re.sub(r'\s+', ' ', cells[0].text.strip().replace('\n', ' ')),
                    'section': re.sub(r'\s+', ' ', cells[1].text.strip().replace('\n', ' ')),
                    'courseTitle': re.sub(r'\s+', ' ', cells[2].text.strip().replace('\n', ' ')),
                    'units': re.sub(r'\s+', ' ', cells[3].text.strip().replace('\n', ' ')),
                    'time': re.sub(r'\(FULLY ONSITE\)|\(FULLY ONLINE\)|~', '', re.sub(r'\s+', ' ', time_text.replace('\n', ' '))).strip(),
                    'room': "TBA" if "TBA" in cells[5].text else re.sub(r'\s+', ' ', cells[5].text.strip().replace('\n', ' ')),
                    'instructor': re.sub(r'\s+', ' ', cells[6].text.strip().replace('\n', ' ')),
                    'remarks': re.sub(r'\s+', ' ', cells[11].text.strip().replace('\n', ' '))
                }
                if course['catNo'] and not course['catNo'].isspace():
                    courses.append(course)
        
        return courses
def main():
    client = AISISClient()
    
    # Get credentials and period from environment variables
    username = os.environ.get('AISIS_USERNAME')
    password = os.environ.get('AISIS_PASSWORD')
    applicable_period = os.environ.get('APPLICABLE_PERIOD', '2024-2')  # Default fallback
    
    if not username or not password:
        print("Error: AISIS credentials not found in environment variables")
        return
    
    print(f"Running scraper for period: {applicable_period}")
    
    if not client.session.cookies:
        print("Session expired.")
    if not client.login(username, password):
        print("Login failed")
        return    
    
    dept_codes = [
        "IE", 
        "BIO", "CH", "CHN", "COM", "CEPP", "CPA", "ELM", "DS", 
        "EC", "ECE", "EN", "ES", "EU", "FIL", "FAA", "FA", "HSP", 
        "HI", "SOHUM", "DISCS", "SALT", "INTAC", "IS", "JSP", "KSP", 
        "LAS", "MAL", "MA", "ML", "NSTP (ADAST)", "NSTP (OSCI)", 
        "PH", "PE", "PS", "POS", "PSY", "QMIT", "SB", "SOCSCI", 
        "SA", "TH", "TMP"
    ]
    
    all_courses = []
    
    # Run warmup before starting
    client.warmup()

    for dept_code in dept_codes:
        try:
            courses = client.get_course_results(applicable_period, dept_code)
            if courses:  # Only extend if courses were successfully retrieved
                all_courses.extend(courses) 
            time.sleep(1)
        except Exception as e:
            print(f"Error retrieving courses for {dept_code}: {e}")

    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Save to data/courses.json
    output_path = os.path.join('data', 'courses.json')
    with open(output_path, "w") as json_file:
        json.dump(all_courses, json_file, indent=4)

    print(f"All courses have been written to {output_path}")

if __name__ == "__main__":
    main()
