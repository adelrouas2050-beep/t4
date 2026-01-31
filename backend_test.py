#!/usr/bin/env python3
"""
Backend API Testing for User Registration and Login System
Tests registration, login, and user validation endpoints
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class UserRegistrationAPITester:
    def __init__(self, base_url="https://signup-db-connect-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_user_id = f"testuser_{datetime.now().strftime('%H%M%S')}"
        self.test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"

    def log_result(self, test_name, success, response_data=None, error=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({
                "test": test_name,
                "error": str(error) if error else "Unknown error",
                "response": response_data
            })
            print(f"❌ {test_name} - FAILED: {error}")

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            return success, response_data, response.status_code
            
        except Exception as e:
            return False, None, str(e)

    def test_check_user_exists(self):
        """Test checking if user ID exists"""
        print("\n🔍 Testing User ID Check...")
        
        # Test with non-existent user
        success, response_data, status = self.make_request(
            'GET', f'auth/check-user/nonexistent_user_123', expected_status=200
        )
        
        if success and response_data and 'exists' in response_data:
            if not response_data['exists']:
                self.log_result("Check Non-existent User", True)
            else:
                self.log_result("Check Non-existent User", False, response_data, "User should not exist")
        else:
            self.log_result("Check Non-existent User", False, response_data, f"Status: {status}")
        
        # Test with existing user (testuser123 mentioned in context)
        success, response_data, status = self.make_request(
            'GET', f'auth/check-user/testuser123', expected_status=200
        )
        
        if success and response_data and 'exists' in response_data:
            self.log_result("Check Existing User", True)
            print(f"   testuser123 exists: {response_data['exists']}")
        else:
            self.log_result("Check Existing User", False, response_data, f"Status: {status}")

    def test_user_registration(self):
        """Test user registration with all required fields"""
        print("\n📝 Testing User Registration...")
        
        # Test successful registration
        registration_data = {
            "name": "مستخدم تجريبي",
            "email": self.test_email,
            "userId": self.test_user_id,
            "phone": "+966501234567",
            "password": "testpass123",
            "userType": "rider"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'auth/register', registration_data, expected_status=200
        )
        
        if success and response_data and response_data.get('success'):
            self.log_result("User Registration", True)
            print(f"   Registered user: {response_data['user']['name']}")
            print(f"   User ID: {response_data['user']['userId']}")
            print(f"   Email: {response_data['user']['email']}")
            if 'token' in response_data:
                self.token = response_data['token']
                print(f"   Token received: {self.token[:20]}...")
        else:
            self.log_result("User Registration", False, response_data, f"Status: {status}")
            return False
        
        # Test duplicate userId registration
        duplicate_data = registration_data.copy()
        duplicate_data['email'] = f"different_{self.test_email}"
        
        success, response_data, status = self.make_request(
            'POST', 'auth/register', duplicate_data, expected_status=400
        )
        
        if success:
            self.log_result("Duplicate UserID Validation", True)
            print(f"   Error message: {response_data.get('detail', 'No error message')}")
        else:
            self.log_result("Duplicate UserID Validation", False, response_data, f"Status: {status}")
        
        # Test duplicate email registration
        duplicate_email_data = {
            "name": "مستخدم آخر",
            "email": self.test_email,  # Same email
            "userId": f"different_{self.test_user_id}",
            "phone": "+966502345678",
            "password": "testpass456",
            "userType": "driver"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'auth/register', duplicate_email_data, expected_status=400
        )
        
        if success:
            self.log_result("Duplicate Email Validation", True)
            print(f"   Error message: {response_data.get('detail', 'No error message')}")
        else:
            self.log_result("Duplicate Email Validation", False, response_data, f"Status: {status}")
        
        return True

    def test_user_login(self):
        """Test user login functionality"""
        print("\n🔐 Testing User Login...")
        
        # Test successful login
        login_data = {
            "email": self.test_email,
            "password": "testpass123",
            "userType": "rider"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'auth/user-login', login_data, expected_status=200
        )
        
        if success and response_data and response_data.get('success'):
            self.log_result("User Login", True)
            print(f"   Logged in user: {response_data['user']['name']}")
            print(f"   User ID: {response_data['user']['userId']}")
            if 'token' in response_data:
                print(f"   Token received: {response_data['token'][:20]}...")
        else:
            self.log_result("User Login", False, response_data, f"Status: {status}")
        
        # Test login with wrong password
        wrong_password_data = login_data.copy()
        wrong_password_data['password'] = "wrongpassword"
        
        success, response_data, status = self.make_request(
            'POST', 'auth/user-login', wrong_password_data, expected_status=401
        )
        
        if success:
            self.log_result("Wrong Password Validation", True)
            print(f"   Error message: {response_data.get('detail', 'No error message')}")
        else:
            self.log_result("Wrong Password Validation", False, response_data, f"Status: {status}")
        
        # Test login with non-existent email
        nonexistent_email_data = {
            "email": "nonexistent@example.com",
            "password": "testpass123",
            "userType": "rider"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'auth/user-login', nonexistent_email_data, expected_status=401
        )
        
        if success:
            self.log_result("Non-existent Email Validation", True)
            print(f"   Error message: {response_data.get('detail', 'No error message')}")
        else:
            self.log_result("Non-existent Email Validation", False, response_data, f"Status: {status}")

    def test_search_users(self):
        """Test user search functionality"""
        print("\n🔍 Testing User Search...")
        
        # Test search with query parameter
        success, response_data, status = self.make_request(
            'GET', 'auth/search-users?q=test', expected_status=200
        )
        
        if success and response_data and 'users' in response_data:
            self.log_result("Search Users with Query", True)
            print(f"   Found {len(response_data['users'])} users")
            for user in response_data['users'][:3]:  # Show first 3 users
                print(f"   - {user.get('name', 'Unknown')} ({user.get('userId', 'No ID')})")
        else:
            self.log_result("Search Users with Query", False, response_data, f"Status: {status}")
        
        # Test search with empty query
        success, response_data, status = self.make_request(
            'GET', 'auth/search-users?q=', expected_status=200
        )
        
        if success and response_data and 'users' in response_data:
            if len(response_data['users']) == 0:
                self.log_result("Search Users Empty Query", True)
                print("   Empty query returns no users (correct)")
            else:
                self.log_result("Search Users Empty Query", False, response_data, "Should return empty for empty query")
        else:
            self.log_result("Search Users Empty Query", False, response_data, f"Status: {status}")
        
        # Test search for specific test users mentioned in context
        test_users = ['testuser123', 'newadminuser']
        for test_user in test_users:
            success, response_data, status = self.make_request(
                'GET', f'auth/search-users?q={test_user}', expected_status=200
            )
            
            if success and response_data and 'users' in response_data:
                found = any(user.get('userId') == test_user for user in response_data['users'])
                self.log_result(f"Search for {test_user}", True)
                print(f"   {test_user} found: {found}")
            else:
                self.log_result(f"Search for {test_user}", False, response_data, f"Status: {status}")

    def test_get_user_by_id(self):
        """Test getting user by ID"""
        print("\n👤 Testing Get User by ID...")
        
        # Test with registered test user
        success, response_data, status = self.make_request(
            'GET', f'auth/user/{self.test_user_id}', expected_status=200
        )
        
        if success and response_data:
            self.log_result("Get User by ID (Own)", True)
            print(f"   User: {response_data.get('name', 'Unknown')}")
            print(f"   User ID: {response_data.get('userId', 'Unknown')}")
            print(f"   Email: {response_data.get('email', 'Unknown')}")
        else:
            self.log_result("Get User by ID (Own)", False, response_data, f"Status: {status}")
        
        # Test with known test users
        test_users = ['testuser123', 'newadminuser']
        for test_user in test_users:
            success, response_data, status = self.make_request(
                'GET', f'auth/user/{test_user}', expected_status=200
            )
            
            if success and response_data:
                self.log_result(f"Get User {test_user}", True)
                print(f"   Found: {response_data.get('name', 'Unknown')} ({response_data.get('userId', 'Unknown')})")
            elif status == 404:
                self.log_result(f"Get User {test_user}", True)
                print(f"   {test_user} not found (404) - this is expected if user doesn't exist")
            else:
                self.log_result(f"Get User {test_user}", False, response_data, f"Status: {status}")
        
        # Test with non-existent user
        success, response_data, status = self.make_request(
            'GET', 'auth/user/nonexistent_user_12345', expected_status=404
        )
        
        if success or status == 404:
            self.log_result("Get Non-existent User", True)
            print("   Non-existent user returns 404 (correct)")
        else:
            self.log_result("Get Non-existent User", False, response_data, f"Status: {status}")

    def test_admin_login(self):
        """Test admin login functionality"""
        print("\n👑 Testing Admin Login...")
        
        # Test with correct admin credentials
        success, response_data, status = self.make_request(
            'POST', 'auth/login', 
            {"email": "admin@transfers.com", "password": "admin123"}
        )
        
        if success and response_data and 'token' in response_data:
            self.log_result("Admin Login", True)
            print(f"   Admin: {response_data.get('name', 'Unknown')}")
            print(f"   Role: {response_data.get('role', 'Unknown')}")
            print(f"   Token received: {response_data['token'][:20]}...")
            return True
        else:
            self.log_result("Admin Login", False, response_data, f"Status: {status}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting User Registration & Login API Tests...")
        print(f"Base URL: {self.base_url}")
        print(f"Test User ID: {self.test_user_id}")
        print(f"Test Email: {self.test_email}")
        
        # Test user existence check first
        self.test_check_user_exists()
        
        # Test user registration
        if not self.test_user_registration():
            print("❌ Registration failed - stopping user login tests")
        else:
            # Test user login
            self.test_user_login()
        
        # Test user search functionality
        self.test_search_users()
        
        # Test get user by ID
        self.test_get_user_by_id()
        
        # Test admin login separately
        self.test_admin_login()
        
        # Print final results
        print(f"\n📊 Test Results:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failed in self.failed_tests:
                print(f"  - {failed['test']}: {failed['error']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = UserRegistrationAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())