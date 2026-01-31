#!/usr/bin/env python3
"""
Backend API Testing for Deleted Messages Recovery Feature
Testing the new functionality: وضع مكان لكي يطلب العضو استعادة الرسائل المهمة
"""

import requests
import sys
import json
from datetime import datetime
import time

class DeletedMessagesRecoveryTester:
    def __init__(self, base_url="https://signup-db-connect-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test credentials from review request
        self.test_email = "test123@example.com"
        self.test_password = "test123456"
        
        # Admin credentials for testing admin endpoints
        self.admin_email = "admin@transfers.com"
        self.admin_password = "admin123"

    def log_result(self, test_name, success, details="", error=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
            if details:
                print(f"   Details: {details}")
        else:
            print(f"❌ {test_name} - FAILED")
            if error:
                print(f"   Error: {error}")
            if details:
                print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method, endpoint, data=None, expected_status=None, use_admin_token=False):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        token_to_use = self.admin_token if use_admin_token else self.token
        if token_to_use:
            headers['Authorization'] = f'Bearer {token_to_use}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            print(f"🔍 {method} {endpoint} -> Status: {response.status_code}")
            
            if expected_status and response.status_code != expected_status:
                return False, f"Expected {expected_status}, got {response.status_code}", {}
            
            try:
                return True, "", response.json() if response.content else {}
            except:
                return True, "", {"raw_response": response.text}
                
        except Exception as e:
            return False, str(e), {}

    def test_user_login(self):
        """Test user login to get authentication token"""
        print(f"\n🔐 Testing user login with {self.test_email}...")
        
        success, error, response = self.make_request(
            'POST', 
            'auth/user-login',
            {
                "email": self.test_email,
                "password": self.test_password,
                "userType": "rider"
            },
            200
        )
        
        if success and response.get('success') and response.get('token'):
            self.token = response['token']
            self.user_id = response['user']['userId']
            self.log_result("User Login", True, f"Logged in as {self.user_id}")
            return True
        else:
            self.log_result("User Login", False, error=error or "Login failed")
            return False

    def test_admin_login(self):
        """Test admin login to get admin authentication token"""
        print(f"\n🔐 Testing admin login with {self.admin_email}...")
        
        success, error, response = self.make_request(
            'POST', 
            'auth/login',
            {
                "email": self.admin_email,
                "password": self.admin_password
            },
            200
        )
        
        if success and response.get('token'):
            self.admin_token = response['token']
            self.log_result("Admin Login", True, f"Logged in as admin")
            return True
        else:
            self.log_result("Admin Login", False, error=error or "Admin login failed")
            return False

    def test_create_and_delete_message(self):
        """Create a test conversation, send a message, and delete it to populate trash"""
        print(f"\n💬 Creating test message and deleting it...")
        
        # First, search for another user to chat with
        success, error, response = self.make_request('GET', 'auth/search-users?q=admin')
        
        if not success or not response.get('users'):
            self.log_result("Create Test Message - Find User", False, error="No users found to chat with")
            return None, None
            
        other_user = response['users'][0]
        other_user_id = other_user.get('userId') or other_user.get('id')
        
        # Create conversation
        success, error, response = self.make_request(
            'POST',
            'chat/conversations',
            {
                "type": "private",
                "participants": [self.user_id, other_user_id],
                "createdBy": self.user_id
            },
            200
        )
        
        if not success or not response.get('id'):
            self.log_result("Create Test Conversation", False, error=error)
            return None, None
            
        conv_id = response['id']
        
        # Send a test message
        success, error, response = self.make_request(
            'POST',
            'chat/messages',
            {
                "conversationId": conv_id,
                "senderId": self.user_id,
                "senderName": "Test User",
                "content": f"Important test message for recovery - {datetime.now().isoformat()}",
                "type": "text"
            },
            200
        )
        
        if not success or not response.get('id'):
            self.log_result("Send Test Message", False, error=error)
            return None, None
            
        message_id = response['id']
        
        # Delete the message to move it to trash
        success, error, response = self.make_request(
            'DELETE', 
            f'chat/messages/{message_id}?deleted_by={self.user_id}',
            expected_status=200
        )
        
        if success and response.get('success'):
            self.log_result("Delete Test Message", True, f"Deleted message {message_id}")
            return message_id, conv_id
        else:
            self.log_result("Delete Test Message", False, error=error or "Deletion failed")
            return None, None

    def test_get_my_deleted_messages(self):
        """Test GET /api/chat/my-deleted-messages/{userId} - جلب رسائل المستخدم المحذوفة"""
        print(f"\n📋 Testing GET /api/chat/my-deleted-messages/{self.user_id}...")
        
        success, error, response = self.make_request(
            'GET', 
            f'chat/my-deleted-messages/{self.user_id}',
            expected_status=200
        )
        
        if success:
            deleted_messages = response if isinstance(response, list) else []
            self.log_result(
                "GET My Deleted Messages", 
                True, 
                f"Found {len(deleted_messages)} deleted messages"
            )
            return deleted_messages
        else:
            self.log_result("GET My Deleted Messages", False, error=error)
            return []

    def test_request_restore_message(self, message_id, reason="This is an important message I need back"):
        """Test POST /api/chat/trash/request-restore - طلب استعادة رسالة"""
        print(f"\n🔄 Testing POST /api/chat/trash/request-restore...")
        
        success, error, response = self.make_request(
            'POST',
            'chat/trash/request-restore',
            {
                "messageId": message_id,
                "requestedBy": self.user_id,
                "reason": reason
            },
            200
        )
        
        if success and response.get('success'):
            self.log_result(
                "POST Request Restore Message", 
                True, 
                f"Restore request sent for message {message_id}"
            )
            return True
        else:
            self.log_result("POST Request Restore Message", False, error=error or "Request failed")
            return False

    def test_get_restore_requests_admin(self):
        """Test GET /api/chat/trash/requests - Admin get restore requests"""
        print(f"\n👨‍💼 Testing GET /api/chat/trash/requests (Admin)...")
        
        success, error, response = self.make_request(
            'GET', 
            'chat/trash/requests',
            expected_status=200,
            use_admin_token=True
        )
        
        if success:
            requests_list = response if isinstance(response, list) else []
            self.log_result(
                "GET Restore Requests (Admin)", 
                True, 
                f"Found {len(requests_list)} restore requests"
            )
            return requests_list
        else:
            self.log_result("GET Restore Requests (Admin)", False, error=error)
            return []

    def test_approve_restore_request(self, message_id):
        """Test POST /api/chat/trash/approve-restore/{message_id} - Admin approve restoration"""
        print(f"\n✅ Testing POST /api/chat/trash/approve-restore/{message_id}...")
        
        success, error, response = self.make_request(
            'POST',
            f'chat/trash/approve-restore/{message_id}',
            expected_status=200,
            use_admin_token=True
        )
        
        if success and response.get('success'):
            self.log_result(
                "POST Approve Restore Request", 
                True, 
                f"Approved restore request for message {message_id}"
            )
            return True
        else:
            self.log_result("POST Approve Restore Request", False, error=error or "Approval failed")
            return False

    def test_verify_message_restored(self, conversation_id, original_message_id):
        """Verify that the message has been restored to the conversation"""
        print(f"\n🔍 Verifying message restoration...")
        
        success, error, response = self.make_request('GET', f'chat/messages/{conversation_id}')
        
        if success:
            messages = response if isinstance(response, list) else []
            # Look for restored message (it might have a different ID but should be marked as restored)
            restored_found = any(
                msg.get('restored') == True or 
                msg.get('id') == original_message_id or
                'Important test message for recovery' in msg.get('content', '')
                for msg in messages
            )
            
            if restored_found:
                self.log_result("Verify Message Restored", True, "Restored message found in conversation")
                return True
            else:
                self.log_result("Verify Message Restored", False, "Restored message not found in conversation")
                return False
        else:
            self.log_result("Verify Message Restored", False, error=error)
            return False

    def test_reject_restore_request(self, message_id):
        """Test POST /api/chat/trash/reject-restore/{message_id} - Admin reject restoration"""
        print(f"\n❌ Testing POST /api/chat/trash/reject-restore/{message_id}...")
        
        success, error, response = self.make_request(
            'POST',
            f'chat/trash/reject-restore/{message_id}',
            expected_status=200,
            use_admin_token=True
        )
        
        if success and response.get('success'):
            self.log_result(
                "POST Reject Restore Request", 
                True, 
                f"Rejected restore request for message {message_id}"
            )
            return True
        else:
            self.log_result("POST Reject Restore Request", False, error=error or "Rejection failed")
            return False

    def test_get_deleted_messages_admin(self):
        """Test GET /api/chat/trash - Admin get all deleted messages"""
        print(f"\n👨‍💼 Testing GET /api/chat/trash (Admin)...")
        
        success, error, response = self.make_request(
            'GET', 
            'chat/trash',
            expected_status=200,
            use_admin_token=True
        )
        
        if success:
            deleted_messages = response if isinstance(response, list) else []
            self.log_result(
                "GET Deleted Messages (Admin)", 
                True, 
                f"Found {len(deleted_messages)} deleted messages in trash"
            )
            return deleted_messages
        else:
            self.log_result("GET Deleted Messages (Admin)", False, error=error)
            return []

    def test_permanent_delete_message(self, message_id):
        """Test DELETE /api/chat/trash/permanent/{message_id} - Admin permanent deletion"""
        print(f"\n💥 Testing DELETE /api/chat/trash/permanent/{message_id}...")
        
        success, error, response = self.make_request(
            'DELETE',
            f'chat/trash/permanent/{message_id}',
            expected_status=200,
            use_admin_token=True
        )
        
        if success and response.get('success'):
            self.log_result(
                "DELETE Permanent Delete Message", 
                True, 
                f"Permanently deleted message {message_id}"
            )
            return True
        else:
            self.log_result("DELETE Permanent Delete Message", False, error=error or "Permanent deletion failed")
            return False

    def test_cleanup_expired_messages(self):
        """Test DELETE /api/chat/trash/cleanup - Cleanup expired messages"""
        print(f"\n🧹 Testing DELETE /api/chat/trash/cleanup...")
        
        success, error, response = self.make_request(
            'DELETE',
            'chat/trash/cleanup',
            expected_status=200,
            use_admin_token=True
        )
        
        if success and response.get('success'):
            deleted_count = response.get('deleted_count', 0)
            self.log_result(
                "DELETE Cleanup Expired Messages", 
                True, 
                f"Cleaned up {deleted_count} expired messages"
            )
            return True
        else:
            self.log_result("DELETE Cleanup Expired Messages", False, error=error or "Cleanup failed")
            return False

    def run_comprehensive_deleted_messages_tests(self):
        """Run comprehensive deleted messages recovery tests"""
        print("=" * 80)
        print("🧪 DELETED MESSAGES RECOVERY FUNCTIONALITY TESTING")
        print("=" * 80)
        print(f"Testing API: {self.base_url}")
        print(f"Test User: {self.test_email}")
        print("=" * 80)

        # Step 1: Login as user
        if not self.test_user_login():
            print("❌ Cannot proceed without user authentication")
            return False

        # Step 2: Login as admin
        if not self.test_admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False

        # Step 3: Create and delete a test message
        deleted_message_id, conversation_id = self.test_create_and_delete_message()
        if not deleted_message_id:
            print("❌ Cannot proceed without deleted message")
            return False

        # Step 4: Test getting user's deleted messages
        deleted_messages = self.test_get_my_deleted_messages()
        
        # Step 5: Test requesting restore for the deleted message
        if deleted_message_id:
            self.test_request_restore_message(deleted_message_id)

        # Step 6: Test admin getting restore requests
        restore_requests = self.test_get_restore_requests_admin()

        # Step 7: Test admin getting all deleted messages
        all_deleted = self.test_get_deleted_messages_admin()

        # Step 8: Test admin approving restore request
        if deleted_message_id:
            self.test_approve_restore_request(deleted_message_id)

        # Step 9: Verify message was restored
        if conversation_id and deleted_message_id:
            self.test_verify_message_restored(conversation_id, deleted_message_id)

        # Step 10: Create another message for rejection test
        print(f"\n📝 Creating another message for rejection test...")
        deleted_message_id_2, conversation_id_2 = self.test_create_and_delete_message()
        
        if deleted_message_id_2:
            # Request restore
            self.test_request_restore_message(deleted_message_id_2, "Another important message")
            
            # Test admin rejecting restore request
            self.test_reject_restore_request(deleted_message_id_2)

        # Step 11: Create another message for permanent deletion test
        print(f"\n📝 Creating another message for permanent deletion test...")
        deleted_message_id_3, conversation_id_3 = self.test_create_and_delete_message()
        
        if deleted_message_id_3:
            # Test permanent deletion
            self.test_permanent_delete_message(deleted_message_id_3)

        # Step 12: Test cleanup expired messages
        self.test_cleanup_expired_messages()

        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['error']}")
        
        print("=" * 80)

def main():
    """Main test execution"""
    tester = DeletedMessagesRecoveryTester()
    
    try:
        success = tester.run_comprehensive_deleted_messages_tests()
        tester.print_summary()
        
        # Return appropriate exit code
        if tester.tests_passed == tester.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️ Some tests failed!")
            return 1
            
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())