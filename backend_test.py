#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Arabic Database Application
Tests all endpoints: users, chat, drivers, rides, orders, restaurants, stats
"""

import requests
import sys
import json
from datetime import datetime
import uuid
import time

class ComprehensiveAPITester:
    def __init__(self, base_url="https://signup-db-connect-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_user_id = f"testuser_{datetime.now().strftime('%H%M%S')}"
        self.test_user_id2 = f"testuser2_{datetime.now().strftime('%H%M%S')}"
        self.test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_email2 = f"test2_{datetime.now().strftime('%H%M%S')}@example.com"
        
        # Store created IDs for cleanup and reference
        self.created_ids = {
            'driver_id': None,
            'restaurant_id': None,
            'ride_id': None,
            'order_id': None,
            'conversation_id': None,
            'message_id': None
        }

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

    def make_request(self, method, endpoint, data=None, expected_status=200, use_admin_token=False):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use appropriate token
        token = self.admin_token if use_admin_token else self.user_token
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=15)
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            return success, response_data, response.status_code
            
        except Exception as e:
            return False, None, str(e)

    def test_admin_login(self):
        """Test admin login to get admin token"""
        print("\n👑 Testing Admin Login...")
        
        success, response_data, status = self.make_request(
            'POST', 'auth/login', 
            {"email": "admin@transfers.com", "password": "admin123"}
        )
        
        if success and response_data and 'token' in response_data:
            self.admin_token = response_data['token']
            self.log_result("Admin Login", True)
            print(f"   Admin: {response_data.get('name', 'Unknown')}")
            print(f"   Role: {response_data.get('role', 'Unknown')}")
            return True
        else:
            self.log_result("Admin Login", False, response_data, f"Status: {status}")
            return False

    def test_user_registration(self):
        """Test user registration"""
        print("\n📝 Testing User Registration...")
        
        # Register first test user
        registration_data = {
            "name": "مستخدم تجريبي أول",
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
            self.user_token = response_data.get('token')
            self.log_result("User Registration (User 1)", True)
            print(f"   Registered: {response_data['user']['name']}")
        else:
            self.log_result("User Registration (User 1)", False, response_data, f"Status: {status}")
            return False
        
        # Register second test user for chat testing
        registration_data2 = {
            "name": "مستخدم تجريبي ثاني",
            "email": self.test_email2,
            "userId": self.test_user_id2,
            "phone": "+966502345678",
            "password": "testpass456",
            "userType": "driver"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'auth/register', registration_data2, expected_status=200
        )
        
        if success and response_data and response_data.get('success'):
            self.log_result("User Registration (User 2)", True)
            print(f"   Registered: {response_data['user']['name']}")
            return True
        else:
            self.log_result("User Registration (User 2)", False, response_data, f"Status: {status}")
            return False

    def test_drivers_endpoint(self):
        """Test POST /api/drivers - إضافة سائق"""
        print("\n🚗 Testing Drivers Endpoint...")
        
        driver_data = {
            "name": "سائق تجريبي",
            "phone": "+966503456789",
            "vehicle": "Toyota Camry 2023",
            "plate": "أ ب ج 1234",
            "avatar": "https://example.com/avatar.jpg"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'drivers', driver_data, expected_status=200, use_admin_token=True
        )
        
        if success and response_data and 'id' in response_data:
            self.created_ids['driver_id'] = response_data['id']
            self.log_result("Create Driver", True)
            print(f"   Driver ID: {response_data['id']}")
            print(f"   Name: {response_data['name']}")
            print(f"   Vehicle: {response_data['vehicle']}")
        else:
            self.log_result("Create Driver", False, response_data, f"Status: {status}")

    def test_restaurants_endpoint(self):
        """Test POST /api/restaurants - إضافة مطعم"""
        print("\n🍽️ Testing Restaurants Endpoint...")
        
        restaurant_data = {
            "name": "مطعم تجريبي",
            "category": "عربي",
            "commission": 15.0,
            "image": "https://example.com/restaurant.jpg"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'restaurants', restaurant_data, expected_status=200, use_admin_token=True
        )
        
        if success and response_data and 'id' in response_data:
            self.created_ids['restaurant_id'] = response_data['id']
            self.log_result("Create Restaurant", True)
            print(f"   Restaurant ID: {response_data['id']}")
            print(f"   Name: {response_data['name']}")
            print(f"   Category: {response_data['category']}")
        else:
            self.log_result("Create Restaurant", False, response_data, f"Status: {status}")

    def test_rides_endpoint(self):
        """Test POST /api/rides - إنشاء رحلة"""
        print("\n🚕 Testing Rides Endpoint...")
        
        if not self.created_ids['driver_id']:
            print("   Skipping ride test - no driver created")
            return
        
        ride_data = {
            "user": self.test_user_id,
            "driver": self.created_ids['driver_id'],
            "from_location": "حي الملز، الرياض",
            "to_location": "مطار الملك خالد",
            "fare": 85.0
        }
        
        success, response_data, status = self.make_request(
            'POST', 'rides', ride_data, expected_status=200, use_admin_token=True
        )
        
        if success and response_data and 'id' in response_data:
            self.created_ids['ride_id'] = response_data['id']
            self.log_result("Create Ride", True)
            print(f"   Ride ID: {response_data['id']}")
            print(f"   From: {response_data.get('from', 'Unknown')}")
            print(f"   To: {response_data.get('to', 'Unknown')}")
        else:
            self.log_result("Create Ride", False, response_data, f"Status: {status}")

    def test_orders_endpoint(self):
        """Test POST /api/orders - إنشاء طلب"""
        print("\n📦 Testing Orders Endpoint...")
        
        if not self.created_ids['restaurant_id']:
            print("   Skipping order test - no restaurant created")
            return
        
        order_data = {
            "user": self.test_user_id,
            "restaurant": self.created_ids['restaurant_id'],
            "items": 3,
            "total": 125.50
        }
        
        success, response_data, status = self.make_request(
            'POST', 'orders', order_data, expected_status=200, use_admin_token=True
        )
        
        if success and response_data and 'id' in response_data:
            self.created_ids['order_id'] = response_data['id']
            self.log_result("Create Order", True)
            print(f"   Order ID: {response_data['id']}")
            print(f"   User: {response_data['user']}")
            print(f"   Total: {response_data['total']}")
        else:
            self.log_result("Create Order", False, response_data, f"Status: {status}")

    def test_chat_conversations_endpoint(self):
        """Test POST /api/chat/conversations - إنشاء محادثة"""
        print("\n💬 Testing Chat Conversations Endpoint...")
        
        conversation_data = {
            "type": "private",
            "participants": [self.test_user_id, self.test_user_id2],
            "createdBy": self.test_user_id
        }
        
        success, response_data, status = self.make_request(
            'POST', 'chat/conversations', conversation_data, expected_status=200
        )
        
        if success and response_data and 'id' in response_data:
            self.created_ids['conversation_id'] = response_data['id']
            self.log_result("Create Conversation", True)
            print(f"   Conversation ID: {response_data['id']}")
            print(f"   Participants: {response_data['participants']}")
        else:
            self.log_result("Create Conversation", False, response_data, f"Status: {status}")

    def test_chat_messages_endpoint(self):
        """Test POST /api/chat/messages - إرسال رسالة"""
        print("\n📨 Testing Chat Messages Endpoint...")
        
        if not self.created_ids['conversation_id']:
            print("   Skipping message test - no conversation created")
            return
        
        message_data = {
            "conversationId": self.created_ids['conversation_id'],
            "senderId": self.test_user_id,
            "senderName": "مستخدم تجريبي أول",
            "content": "مرحبا، هذه رسالة تجريبية",
            "type": "text"
        }
        
        success, response_data, status = self.make_request(
            'POST', 'chat/messages', message_data, expected_status=200
        )
        
        if success and response_data and 'id' in response_data:
            self.created_ids['message_id'] = response_data['id']
            self.log_result("Send Message", True)
            print(f"   Message ID: {response_data['id']}")
            print(f"   Content: {response_data['content']}")
        else:
            self.log_result("Send Message", False, response_data, f"Status: {status}")

    def test_get_conversations(self):
        """Test GET /api/chat/conversations/{userId} - جلب المحادثات"""
        print("\n📋 Testing Get Conversations...")
        
        success, response_data, status = self.make_request(
            'GET', f'chat/conversations/{self.test_user_id}', expected_status=200
        )
        
        if success and isinstance(response_data, list):
            self.log_result("Get User Conversations", True)
            print(f"   Found {len(response_data)} conversations")
            if response_data:
                print(f"   First conversation ID: {response_data[0].get('id', 'Unknown')}")
        else:
            self.log_result("Get User Conversations", False, response_data, f"Status: {status}")

    def test_get_messages(self):
        """Test GET /api/chat/messages/{convId} - جلب الرسائل"""
        print("\n📬 Testing Get Messages...")
        
        if not self.created_ids['conversation_id']:
            print("   Skipping get messages test - no conversation created")
            return
        
        success, response_data, status = self.make_request(
            'GET', f'chat/messages/{self.created_ids["conversation_id"]}', expected_status=200
        )
        
        if success and isinstance(response_data, list):
            self.log_result("Get Conversation Messages", True)
            print(f"   Found {len(response_data)} messages")
            if response_data:
                print(f"   First message: {response_data[0].get('content', 'Unknown')[:50]}...")
        else:
            self.log_result("Get Conversation Messages", False, response_data, f"Status: {status}")

    def test_stats_endpoint(self):
        """Test GET /api/stats - الإحصائيات تشمل المستخدمين المسجلين"""
        print("\n📊 Testing Stats Endpoint...")
        
        success, response_data, status = self.make_request(
            'GET', 'stats', expected_status=200, use_admin_token=True
        )
        
        if success and response_data:
            self.log_result("Get Statistics", True)
            print(f"   Total Users: {response_data.get('totalUsers', 0)}")
            print(f"   Total Drivers: {response_data.get('totalDrivers', 0)}")
            print(f"   Total Restaurants: {response_data.get('totalRestaurants', 0)}")
            print(f"   Total Rides: {response_data.get('totalRides', 0)}")
            print(f"   Total Orders: {response_data.get('totalOrders', 0)}")
            print(f"   Total Revenue: {response_data.get('totalRevenue', 0)}")
            
            # Verify that registered users are included in totalUsers count
            if response_data.get('totalUsers', 0) >= 2:  # At least our 2 test users
                print("   ✅ Registered users are included in statistics")
            else:
                print("   ⚠️ Registered users might not be included in statistics")
        else:
            self.log_result("Get Statistics", False, response_data, f"Status: {status}")

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Comprehensive Arabic Database API Tests...")
        print(f"Base URL: {self.base_url}")
        print(f"Test User 1 ID: {self.test_user_id}")
        print(f"Test User 2 ID: {self.test_user_id2}")
        
        # Step 1: Admin login (required for most operations)
        if not self.test_admin_login():
            print("❌ Admin login failed - stopping tests")
            return False
        
        # Step 2: User registration (required for chat and other user operations)
        if not self.test_user_registration():
            print("❌ User registration failed - stopping tests")
            return False
        
        # Step 3: Test all endpoints as requested
        print("\n" + "="*50)
        print("Testing All Requested Endpoints:")
        print("="*50)
        
        # Test drivers endpoint
        self.test_drivers_endpoint()
        
        # Test restaurants endpoint  
        self.test_restaurants_endpoint()
        
        # Test rides endpoint
        self.test_rides_endpoint()
        
        # Test orders endpoint
        self.test_orders_endpoint()
        
        # Test chat conversations endpoint
        self.test_chat_conversations_endpoint()
        
        # Test chat messages endpoint
        self.test_chat_messages_endpoint()
        
        # Test get conversations
        self.test_get_conversations()
        
        # Test get messages
        self.test_get_messages()
        
        # Test stats endpoint
        self.test_stats_endpoint()
        
        # Print final results
        print(f"\n📊 Final Test Results:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failed in self.failed_tests:
                print(f"  - {failed['test']}: {failed['error']}")
        
        print(f"\n🆔 Created Test Data IDs:")
        for key, value in self.created_ids.items():
            if value:
                print(f"  - {key}: {value}")
        
        return len(self.failed_tests) == 0

def main():
    tester = UserRegistrationAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())