#!/usr/bin/env python3
"""
Backend API Testing for Trash/Restore System
Testing the trash functionality: سلة المهملات للرسائل المحذوفة مع إمكانية الاستعادة خلال 30 يوم
"""

import requests
import sys
import json
from datetime import datetime
import time

class TrashRestoreTester:
    def __init__(self, base_url="https://signup-db-connect-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test credentials from review request
        self.admin_email = "admin@transfers.com"
        self.admin_password = "admin123"
        self.test_user_email = "test123@example.com"
        self.test_user_password = "test123456"

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
        
        token = self.admin_token if use_admin_token else self.user_token
        if token:
            headers['Authorization'] = f'Bearer {token}'

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

    def test_admin_login(self):
        """Test admin login to get authentication token"""
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
            self.log_result("Admin Login", False, error=error or "Login failed")
            return False

    def test_user_login(self):
        """Test user login to get authentication token"""
        print(f"\n🔐 Testing user login with {self.test_user_email}...")
        
        success, error, response = self.make_request(
            'POST', 
            'auth/user-login',
            {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "userType": "rider"
            },
            200
        )
        
        if success and response.get('success') and response.get('token'):
            self.user_token = response['token']
            self.user_id = response['user']['userId']
            self.log_result("User Login", True, f"Logged in as {self.user_id}")
            return True
        else:
            self.log_result("User Login", False, error=error or "Login failed")
            return False

    def test_create_test_data(self):
        """Create test conversation and messages for trash testing"""
        print(f"\n💬 Creating test data for trash testing...")
        
        # Create conversation
        success, error, response = self.make_request(
            'POST',
            'chat/conversations',
            {
                "type": "private",
                "participants": [self.user_id, "admin"],
                "createdBy": self.user_id
            },
            200
        )
        
        if not success or not response.get('id'):
            self.log_result("Create Test Conversation", False, error=error)
            return None, []
            
        conv_id = response['id']
        self.log_result("Create Test Conversation", True, f"Created conversation {conv_id}")
        
        # Send test messages
        message_ids = []
        for i in range(3):
            success, error, response = self.make_request(
                'POST',
                'chat/messages',
                {
                    "conversationId": conv_id,
                    "senderId": self.user_id,
                    "senderName": "Test User",
                    "content": f"Test message for trash system {i+1}",
                    "type": "text"
                },
                200
            )
            
            if success and response.get('id'):
                message_ids.append(response['id'])
                self.log_result(f"Send Test Message {i+1}", True, f"Message ID: {response['id']}")
            else:
                self.log_result(f"Send Test Message {i+1}", False, error=error)
        
        return conv_id, message_ids

    def test_delete_message_to_trash(self, message_id):
        """Test DELETE /api/chat/messages/{id} - Delete message and move to trash"""
        print(f"\n🗑️ Testing message deletion to trash...")
        
        success, error, response = self.make_request(
            'DELETE', 
            f'chat/messages/{message_id}?deleted_by={self.user_id}',
            expected_status=200
        )
        
        if success and response.get('success'):
            can_restore = response.get('canRestore', False)
            expires_in = response.get('expiresIn', '')
            self.log_result("Delete Message to Trash", True, f"Deleted message {message_id}, canRestore: {can_restore}, expiresIn: {expires_in}")
            return True
        else:
            self.log_result("Delete Message to Trash", False, error=error or "Deletion failed")
            return False

    def test_get_trash_messages_admin(self):
        """Test GET /api/chat/trash - Get deleted messages (admin only)"""
        print(f"\n📋 Testing get trash messages (admin)...")
        
        success, error, response = self.make_request(
            'GET', 
            'chat/trash',
            use_admin_token=True,
            expected_status=200
        )
        
        if success:
            messages = response if isinstance(response, list) else []
            self.log_result("Get Trash Messages (Admin)", True, f"Found {len(messages)} deleted messages")
            return messages
        else:
            self.log_result("Get Trash Messages (Admin)", False, error=error)
            return []

    def test_request_restore(self, message_id):
        """Test POST /api/chat/trash/request-restore - Request message restoration"""
        print(f"\n🔄 Testing request restore...")
        
        success, error, response = self.make_request(
            'POST',
            'chat/trash/request-restore',
            {
                "messageId": message_id,
                "requestedBy": self.user_id,
                "reason": "Accidentally deleted important message"
            },
            200
        )
        
        if success and response.get('success'):
            self.log_result("Request Restore", True, f"Requested restore for message {message_id}")
            return True
        else:
            self.log_result("Request Restore", False, error=error or "Request failed")
            return False

    def test_get_restore_requests_admin(self):
        """Test GET /api/chat/trash/requests - Get pending restore requests (admin)"""
        print(f"\n📋 Testing get restore requests (admin)...")
        
        success, error, response = self.make_request(
            'GET', 
            'chat/trash/requests',
            use_admin_token=True,
            expected_status=200
        )
        
        if success:
            requests_list = response if isinstance(response, list) else []
            self.log_result("Get Restore Requests (Admin)", True, f"Found {len(requests_list)} restore requests")
            return requests_list
        else:
            self.log_result("Get Restore Requests (Admin)", False, error=error)
            return []

    def test_approve_restore_admin(self, message_id):
        """Test POST /api/chat/trash/approve-restore/{id} - Admin approve restoration"""
        print(f"\n✅ Testing approve restore (admin)...")
        
        success, error, response = self.make_request(
            'POST',
            f'chat/trash/approve-restore/{message_id}',
            use_admin_token=True,
            expected_status=200
        )
        
        if success and response.get('success'):
            self.log_result("Approve Restore (Admin)", True, f"Approved restore for message {message_id}")
            return True
        else:
            self.log_result("Approve Restore (Admin)", False, error=error or "Approval failed")
            return False

    def test_reject_restore_admin(self, message_id):
        """Test POST /api/chat/trash/reject-restore/{id} - Admin reject restoration"""
        print(f"\n❌ Testing reject restore (admin)...")
        
        success, error, response = self.make_request(
            'POST',
            f'chat/trash/reject-restore/{message_id}',
            use_admin_token=True,
            expected_status=200
        )
        
        if success and response.get('success'):
            self.log_result("Reject Restore (Admin)", True, f"Rejected restore for message {message_id}")
            return True
        else:
            self.log_result("Reject Restore (Admin)", False, error=error or "Rejection failed")
            return False

    def test_permanent_delete_admin(self, message_id):
        """Test DELETE /api/chat/trash/permanent/{id} - Permanent deletion (admin)"""
        print(f"\n💥 Testing permanent delete (admin)...")
        
        success, error, response = self.make_request(
            'DELETE',
            f'chat/trash/permanent/{message_id}',
            use_admin_token=True,
            expected_status=200
        )
        
        if success and response.get('success'):
            self.log_result("Permanent Delete (Admin)", True, f"Permanently deleted message {message_id}")
            return True
        else:
            self.log_result("Permanent Delete (Admin)", False, error=error or "Permanent deletion failed")
            return False

    def test_cleanup_expired_messages(self):
        """Test DELETE /api/chat/trash/cleanup - Cleanup expired messages"""
        print(f"\n🧹 Testing cleanup expired messages...")
        
        success, error, response = self.make_request(
            'DELETE',
            'chat/trash/cleanup',
            use_admin_token=True,
            expected_status=200
        )
        
        if success and response.get('success'):
            deleted_count = response.get('deleted_count', 0)
            self.log_result("Cleanup Expired Messages", True, f"Cleaned up {deleted_count} expired messages")
            return True
        else:
            self.log_result("Cleanup Expired Messages", False, error=error or "Cleanup failed")
            return False

    def test_verify_message_restored(self, conversation_id, original_message_id):
        """Verify that message was restored to original conversation"""
        print(f"\n🔍 Verifying message restoration...")
        
        success, error, response = self.make_request('GET', f'chat/messages/{conversation_id}')
        
        if success:
            messages = response if isinstance(response, list) else []
            # Look for restored message (it might have a different ID but same content)
            restored = any(msg.get('restored') or msg.get('id') == original_message_id for msg in messages)
            
            if restored:
                self.log_result("Verify Message Restored", True, "Message found in conversation - restoration successful")
                return True
            else:
                self.log_result("Verify Message Restored", False, "Message not found in conversation")
                return False
        else:
            self.log_result("Verify Message Restored", False, error=error)
            return False

    def run_comprehensive_trash_tests(self):
        """Run comprehensive trash/restore system tests"""
        print("=" * 80)
        print("🗑️ TRASH/RESTORE SYSTEM TESTING")
        print("=" * 80)
        print(f"Testing API: {self.base_url}")
        print(f"Admin: {self.admin_email}")
        print(f"Test User: {self.test_user_email}")
        print("=" * 80)

        # Step 1: Login as admin and user
        if not self.test_admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False
            
        if not self.test_user_login():
            print("❌ Cannot proceed without user authentication")
            return False

        # Step 2: Create test data
        conversation_id, message_ids = self.test_create_test_data()
        if not conversation_id or len(message_ids) == 0:
            print("❌ Cannot proceed without test data")
            return False

        # Step 3: Test message deletion to trash
        test_message_id = message_ids[0]
        if not self.test_delete_message_to_trash(test_message_id):
            print("❌ Message deletion to trash failed")
            return False

        # Step 4: Test admin get trash messages
        trash_messages = self.test_get_trash_messages_admin()
        if len(trash_messages) == 0:
            print("⚠️ No messages found in trash")

        # Step 5: Test request restore
        if not self.test_request_restore(test_message_id):
            print("❌ Request restore failed")
            return False

        # Step 6: Test admin get restore requests
        restore_requests = self.test_get_restore_requests_admin()
        if len(restore_requests) == 0:
            print("⚠️ No restore requests found")

        # Step 7: Test admin approve restore
        if not self.test_approve_restore_admin(test_message_id):
            print("❌ Approve restore failed")
            return False

        # Step 8: Verify message was restored
        self.test_verify_message_restored(conversation_id, test_message_id)

        # Step 9: Test reject restore (with another message)
        if len(message_ids) > 1:
            second_message_id = message_ids[1]
            self.test_delete_message_to_trash(second_message_id)
            self.test_request_restore(second_message_id)
            self.test_reject_restore_admin(second_message_id)

        # Step 10: Test permanent delete
        if len(message_ids) > 2:
            third_message_id = message_ids[2]
            self.test_delete_message_to_trash(third_message_id)
            self.test_permanent_delete_admin(third_message_id)

        # Step 11: Test cleanup expired messages
        self.test_cleanup_expired_messages()

        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TRASH/RESTORE TEST SUMMARY")
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
    tester = TrashRestoreTester()
    
    try:
        success = tester.run_comprehensive_trash_tests()
        tester.print_summary()
        
        # Return appropriate exit code
        if tester.tests_passed == tester.tests_run:
            print("🎉 All trash/restore tests passed!")
            return 0
        else:
            print("⚠️ Some trash/restore tests failed!")
            return 1
            
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())