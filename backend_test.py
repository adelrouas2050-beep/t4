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

    def test_login(self):
        """Test JWT login functionality"""
        print("\n🔐 Testing Authentication...")
        
        # Test with correct credentials
        success, response_data, status = self.make_request(
            'POST', 'auth/login', 
            {"email": "admin@transfers.com", "password": "admin123"}
        )
        
        if success and response_data and 'token' in response_data:
            self.token = response_data['token']
            self.log_result("Admin Login", True)
            print(f"   Token received: {self.token[:20]}...")
            return True
        else:
            self.log_result("Admin Login", False, response_data, f"Status: {status}")
            return False

    def test_protected_route(self):
        """Test protected route without token"""
        print("\n🛡️ Testing Protected Routes...")
        
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response_data, status = self.make_request('GET', 'users', expected_status=401)
        
        # Restore token
        self.token = temp_token
        
        self.log_result("Protected Route (No Token)", success)

    def test_stats_api(self):
        """Test statistics API"""
        print("\n📊 Testing Statistics API...")
        
        success, response_data, status = self.make_request('GET', 'stats')
        
        if success and response_data:
            required_fields = ['totalUsers', 'totalDrivers', 'totalRestaurants', 'totalRides', 'totalOrders']
            has_all_fields = all(field in response_data for field in required_fields)
            
            if has_all_fields:
                self.log_result("Stats API", True)
                print(f"   Total Users: {response_data.get('totalUsers', 0)}")
                print(f"   Total Drivers: {response_data.get('totalDrivers', 0)}")
                print(f"   Total Revenue: {response_data.get('totalRevenue', 0)}")
            else:
                self.log_result("Stats API", False, response_data, "Missing required fields")
        else:
            self.log_result("Stats API", False, response_data, f"Status: {status}")

    def test_seed_database(self):
        """Test database seeding"""
        print("\n🌱 Testing Database Seeding...")
        
        success, response_data, status = self.make_request('POST', 'seed')
        
        if success:
            self.log_result("Database Seeding", True)
        else:
            self.log_result("Database Seeding", False, response_data, f"Status: {status}")

    def test_users_api(self):
        """Test Users CRUD operations"""
        print("\n👥 Testing Users API...")
        
        # Get users
        success, users_data, status = self.make_request('GET', 'users')
        self.log_result("Get Users", success, error=f"Status: {status}" if not success else None)
        
        if success and users_data and len(users_data) > 0:
            # Test user status update
            user_id = users_data[0]['id']
            success, response_data, status = self.make_request(
                'PUT', f'users/{user_id}', 
                {"status": "active"}
            )
            self.log_result("Update User Status", success, error=f"Status: {status}" if not success else None)

    def test_drivers_api(self):
        """Test Drivers CRUD operations"""
        print("\n🚗 Testing Drivers API...")
        
        # Get drivers
        success, drivers_data, status = self.make_request('GET', 'drivers')
        self.log_result("Get Drivers", success, error=f"Status: {status}" if not success else None)
        
        if success and drivers_data and len(drivers_data) > 0:
            # Test driver verification
            driver_id = drivers_data[0]['id']
            success, response_data, status = self.make_request('PUT', f'drivers/{driver_id}/verify')
            self.log_result("Verify Driver", success, error=f"Status: {status}" if not success else None)

    def test_restaurants_api(self):
        """Test Restaurants CRUD operations"""
        print("\n🍽️ Testing Restaurants API...")
        
        # Get restaurants
        success, restaurants_data, status = self.make_request('GET', 'restaurants')
        self.log_result("Get Restaurants", success, error=f"Status: {status}" if not success else None)
        
        if success and restaurants_data and len(restaurants_data) > 0:
            # Test restaurant status update
            restaurant_id = restaurants_data[0]['id']
            success, response_data, status = self.make_request(
                'PUT', f'restaurants/{restaurant_id}', 
                {"status": "open"}
            )
            self.log_result("Update Restaurant Status", success, error=f"Status: {status}" if not success else None)

    def test_rides_api(self):
        """Test Rides API"""
        print("\n🚕 Testing Rides API...")
        
        # Get rides
        success, rides_data, status = self.make_request('GET', 'rides')
        self.log_result("Get Rides", success, error=f"Status: {status}" if not success else None)

    def test_orders_api(self):
        """Test Orders API"""
        print("\n📦 Testing Orders API...")
        
        # Get orders
        success, orders_data, status = self.make_request('GET', 'orders')
        self.log_result("Get Orders", success, error=f"Status: {status}" if not success else None)

    def test_promotions_api(self):
        """Test Promotions CRUD operations"""
        print("\n🎫 Testing Promotions API...")
        
        # Get promotions
        success, promotions_data, status = self.make_request('GET', 'promotions')
        self.log_result("Get Promotions", success, error=f"Status: {status}" if not success else None)
        
        # Test creating a new promotion
        new_promo = {
            "code": f"TEST{datetime.now().strftime('%H%M%S')}",
            "discount": 25,
            "type": "percentage",
            "maxUses": 100,
            "expires": "2025-12-31",
            "service": "all"
        }
        
        success, response_data, status = self.make_request('POST', 'promotions', new_promo, expected_status=200)
        
        if success and response_data:
            promo_id = response_data.get('id')
            self.log_result("Create Promotion", True)
            
            # Test deleting the promotion
            if promo_id:
                success, response_data, status = self.make_request('DELETE', f'promotions/{promo_id}')
                self.log_result("Delete Promotion", success, error=f"Status: {status}" if not success else None)
        else:
            self.log_result("Create Promotion", False, response_data, f"Status: {status}")

    def test_weekly_monthly_stats(self):
        """Test weekly and monthly statistics"""
        print("\n📈 Testing Weekly/Monthly Stats...")
        
        # Test weekly stats
        success, response_data, status = self.make_request('GET', 'stats/weekly')
        self.log_result("Weekly Stats", success, error=f"Status: {status}" if not success else None)
        
        # Test monthly stats
        success, response_data, status = self.make_request('GET', 'stats/monthly')
        self.log_result("Monthly Stats", success, error=f"Status: {status}" if not success else None)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Transfers Admin API Tests...")
        print(f"Base URL: {self.base_url}")
        
        # Authentication is required for all other tests
        if not self.test_login():
            print("❌ Login failed - stopping all tests")
            return False
        
        # Test protected routes
        self.test_protected_route()
        
        # Test seeding first to ensure we have data
        self.test_seed_database()
        
        # Test all API endpoints
        self.test_stats_api()
        self.test_weekly_monthly_stats()
        self.test_users_api()
        self.test_drivers_api()
        self.test_restaurants_api()
        self.test_rides_api()
        self.test_orders_api()
        self.test_promotions_api()
        
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
    tester = TransfersAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())