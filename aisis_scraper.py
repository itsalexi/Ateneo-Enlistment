import os
import requests
import pickle
import json
from bs4 import BeautifulSoup
import re
import time
import uuid
import sys
import traceback

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
            if not response.ok:
                print(f"DEBUG: Session validation failed - HTTP {response.status_code}")
                return False
            if "MY INDIVIDUAL PROGRAM OF STUDY" not in response.text:
                print("DEBUG: Session validation failed - 'MY INDIVIDUAL PROGRAM OF STUDY' not found in response")
                print(f"DEBUG: Response URL: {response.url}")
                print(f"DEBUG: Response preview (first 500 chars): {response.text[:500]}")
                return False
            return True
        except requests.RequestException as e:
            print(f"DEBUG: Session validation error: {e}")
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
            print(f"DEBUG: Login response status: {response.status_code}")
            print(f"DEBUG: Login response URL: {response.url}")
            
            if not response.ok:
                print(f"DEBUG: Login failed - HTTP {response.status_code}")
                print(f"DEBUG: Response preview (first 500 chars): {response.text[:500]}")
                return False
            
            if "User Identified As" not in response.text:
                print("DEBUG: Login failed - 'User Identified As' not found in response")
                print(f"DEBUG: Response preview (first 500 chars): {response.text[:500]}")
                # Check for common error messages
                if "Invalid" in response.text or "incorrect" in response.text.lower():
                    print("DEBUG: Possible invalid credentials")
                elif "login" in response.text.lower():
                    print("DEBUG: Response appears to be a login page (authentication may have failed)")
                return False
            
            self.logged_in = True
            self._save_cookies()
            print("Login successful and cookies saved.")
            return True
        except requests.RequestException as e:
            print(f"DEBUG: Login error: {e}")
            print(f"DEBUG: Error type: {type(e).__name__}")
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
            print(f"DEBUG: Warmup request to {url}")
            print(f"DEBUG: Warmup body: {body}")
            response = self.session.post(url, data=body)
            print(f"DEBUG: Warmup response status: {response.status_code}")
            print(f"DEBUG: Warmup response URL: {response.url}")
            
            if not response.ok:
                print(f"DEBUG: Warmup failed - HTTP {response.status_code}")
                print(f"DEBUG: Response preview (first 500 chars): {response.text[:500]}")
                return False
            
            # Check if we're still authenticated
            if "login" in response.url.lower() or "sign in" in response.text.lower():
                print("DEBUG: Warmup failed - redirected to login page (session expired)")
                return False
            
            print("Good to go, starting script.")
            return True
        except requests.RequestException as e:
            print(f"DEBUG: Warmup error: {e}")
            print(f"DEBUG: Error type: {type(e).__name__}")
            return False
        
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
            print(f"DEBUG: Fetching courses for dept_code={dept_code}, period={applicable_period}")
            response = self.session.post(url, data=body, headers=headers)
            print(f"DEBUG: Course results response status: {response.status_code}")
            print(f"DEBUG: Course results response URL: {response.url}")
            
            if not response.ok:
                print(f"DEBUG: Course results request failed - HTTP {response.status_code}")
                print(f"DEBUG: Response preview (first 500 chars): {response.text[:500]}")
                raise Exception(f"Request failed: {response.status_code}")

            # Check if we're still authenticated
            if "login" in response.url.lower() or "sign in" in response.text.lower():
                print(f"DEBUG: Course results failed - redirected to login page (session expired)")
                raise Exception("Session expired during course fetch")

            courses = self.parse_courses(response.text, dept_code)
            print(f"DEBUG: Parsed {len(courses)} courses for {dept_code}")
            return courses
        except requests.RequestException as e:
            print(f"DEBUG: Error fetching course results for {dept_code}: {e}")
            print(f"DEBUG: Error type: {type(e).__name__}")
            return None
        except Exception as e:
            print(f"DEBUG: Unexpected error fetching courses for {dept_code}: {e}")
            print(f"DEBUG: Error type: {type(e).__name__}")
            raise

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
        print(f"DEBUG: Found {len(course_cells)} course cells for {dept_code}")
        
        if len(course_cells) == 0:
            print(f"DEBUG: No course cells found for {dept_code}")
            print(f"DEBUG: HTML preview (first 1000 chars): {html_content[:1000]}")
            # Check if we got an error page
            if "error" in html_content.lower() or "not found" in html_content.lower():
                print(f"DEBUG: Possible error page detected for {dept_code}")
        
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
                    'time': re.sub(r'\(FULLY ONSITE\)|\(FULLY ONLINE\)|~|\(\)$', '', re.sub(r'\s+', ' ', time_text.replace('\n', ' '))).strip(),
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
        sys.exit(1)
    
    print(f"Running scraper for period: {applicable_period}")
    print(f"DEBUG: Username provided: {'Yes' if username else 'No'}")
    print(f"DEBUG: Password provided: {'Yes' if password else 'No'}")
    print(f"DEBUG: Cookies file exists: {os.path.exists(client.cookies_file)}")
    print(f"DEBUG: Current session cookies: {len(client.session.cookies)} cookies")
    
    if not client.session.cookies:
        print("DEBUG: No cookies in session")
    if not client.login(username, password):
        print("DEBUG: Login failed - exiting")
        sys.exit(1)
    
    print(f"DEBUG: After login - logged_in={client.logged_in}, cookies={len(client.session.cookies)}")
    
    dept_codes = [
        "**IE**", 
        "BIO", "CH", "CHN", "COM", "CEPP", "CPA", "ELM", "DS", 
        "EC", "ECE", "EN", "ES", "EU", "FIL", "FAA", "FA", "HSP", 
        "HI", "SOHUM", "DISCS", "SALT", "INTAC", "IS", "JSP", "KSP", 
        "LAS", "MAL", "MA", "ML", "NSTP (ADAST)", "NSTP (OSCI)", 
        "PH", "PE", "PS", "POS", "PSY", "QMIT", "SB", "SOCSCI", 
        "SA", "TH", "TMP"
    ]
    
    all_courses = []
    
    # Run warmup before starting
    warmup_response = client.warmup()
    if not warmup_response:
        print("Warmup failed, aborting scraper run.")
        sys.exit(1)

    for dept_code in dept_codes:
        attempt = 0
        max_attempts = 2
        while attempt < max_attempts:
            try:
                courses = client.get_course_results(applicable_period, dept_code)
                if courses is None:
                    print(f"DEBUG: get_course_results returned None for {dept_code}")
                    attempt += 1
                    if attempt >= max_attempts:
                        print(f"DEBUG: Failed to retrieve courses for {dept_code} after {max_attempts} attempts (returned None). Exiting.")
                        sys.exit(1)
                    continue
                elif len(courses) == 0:
                    print(f"DEBUG: Warning - No courses found for {dept_code} (empty list)")
                else:
                    all_courses.extend(courses)
                    print(f"DEBUG: Successfully retrieved {len(courses)} courses for {dept_code}")
                time.sleep(1)
                break  # Success, break out of retry loop
            except Exception as e:
                attempt += 1
                print(f"DEBUG: Error retrieving courses for {dept_code} (attempt {attempt}/{max_attempts}): {e}")
                print(f"DEBUG: Traceback:\n{traceback.format_exc()}")
                if attempt >= max_attempts:
                    print(f"DEBUG: Failed to retrieve courses for {dept_code} after {max_attempts} attempts. Exiting.")
                    sys.exit(1)
                time.sleep(2)  # Wait before retry

    # Create data directory if it doesn't exist
    os.makedirs(os.path.join('src', 'data'), exist_ok=True)
    
    print(f"DEBUG: Total courses collected: {len(all_courses)}")
    if len(all_courses) == 0:
        print("DEBUG: WARNING - No courses were collected! This may indicate a problem.")
        sys.exit(1)
    
    # Save to src/data/courses.json
    output_path = os.path.join('src', 'data', 'courses.json')
    with open(output_path, "w") as json_file:
        json.dump(all_courses, json_file, indent=4)

    print(f"All courses have been written to {output_path}")
    print(f"DEBUG: File size: {os.path.getsize(output_path)} bytes")

if __name__ == "__main__":
    main()
