#!/usr/bin/env python3
"""
Backend API Testing for Chat Deletion Functionality
Testing the reported issue: مسح السجل لا يعمل والحذف يكون محلي فقط وليس من قاعدة البيانات
"""

import requests
import sys
import json
from datetime import datetime
import time

class ChatDeletionTester:
    def __init__(self, base_url="https://signup-db-connect-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test credentials from review request
        self.test_email = "test123@example.com"
        self.test_password = "test123456"

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

    def make_request(self, method, endpoint, data=None, expected_status=None):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

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

    def test_create_test_conversation(self):
        """Create a test conversation for deletion testing"""
        print(f"\n💬 Creating test conversation...")
        
        # First, search for another user to chat with
        success, error, response = self.make_request('GET', 'auth/search-users?q=admin')
        
        if not success or not response.get('users'):
            self.log_result("Create Test Conversation - Find User", False, error="No users found to chat with")
            return None
            
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
        
        if success and response.get('id'):
            conv_id = response['id']
            self.log_result("Create Test Conversation", True, f"Created conversation {conv_id}")
            return conv_id
        else:
            self.log_result("Create Test Conversation", False, error=error)
            return None

    def test_send_test_messages(self, conversation_id, count=3):
        """Send test messages to the conversation"""
        print(f"\n📝 Sending {count} test messages...")
        
        message_ids = []
        for i in range(count):
            success, error, response = self.make_request(
                'POST',
                'chat/messages',
                {
                    "conversationId": conversation_id,
                    "senderId": self.user_id,
                    "senderName": "Test User",
                    "content": f"Test message {i+1} - {datetime.now().isoformat()}",
                    "type": "text"
                },
                200
            )
            
            if success and response.get('id'):
                message_ids.append(response['id'])
                self.log_result(f"Send Test Message {i+1}", True, f"Message ID: {response['id']}")
            else:
                self.log_result(f"Send Test Message {i+1}", False, error=error)
        
        return message_ids

    def test_get_messages_before_deletion(self, conversation_id):
        """Get messages before deletion to verify they exist"""
        print(f"\n📋 Getting messages before deletion...")
        
        success, error, response = self.make_request('GET', f'chat/messages/{conversation_id}')
        
        if success:
            messages = response if isinstance(response, list) else []
            self.log_result("Get Messages Before Deletion", True, f"Found {len(messages)} messages")
            return messages
        else:
            self.log_result("Get Messages Before Deletion", False, error=error)
            return []

    def test_delete_single_message(self, message_id):
        """Test DELETE /api/chat/messages/{id} - Delete single message"""
        print(f"\n🗑️ Testing single message deletion...")
        
        success, error, response = self.make_request('DELETE', f'chat/messages/{message_id}', expected_status=200)
        
        if success and response.get('success'):
            self.log_result("Delete Single Message", True, f"Deleted message {message_id}")
            return True
        else:
            self.log_result("Delete Single Message", False, error=error or "Deletion failed")
            return False

    def test_clear_conversation_history(self, conversation_id):
        """Test DELETE /api/chat/conversations/{id}/messages - Clear conversation history"""
        print(f"\n🧹 Testing conversation history clearing...")
        
        success, error, response = self.make_request(
            'DELETE', 
            f'chat/conversations/{conversation_id}/messages',
            expected_status=200
        )
        
        if success and response.get('success'):
            deleted_count = response.get('deleted_count', 0)
            self.log_result("Clear Conversation History", True, f"Cleared {deleted_count} messages")
            return True
        else:
            self.log_result("Clear Conversation History", False, error=error or "Clear failed")
            return False

    def test_verify_messages_deleted_from_db(self, conversation_id):
        """Verify messages are actually deleted from database"""
        print(f"\n🔍 Verifying messages deleted from database...")
        
        success, error, response = self.make_request('GET', f'chat/messages/{conversation_id}')
        
        if success:
            messages = response if isinstance(response, list) else []
            if len(messages) == 0:
                self.log_result("Verify Messages Deleted from DB", True, "No messages found - deletion successful")
                return True
            else:
                self.log_result("Verify Messages Deleted from DB", False, f"Still found {len(messages)} messages in DB")
                return False
        else:
            self.log_result("Verify Messages Deleted from DB", False, error=error)
            return False

    def test_delete_entire_conversation(self, conversation_id):
        """Test DELETE /api/chat/conversations/{id} - Delete entire conversation"""
        print(f"\n💥 Testing entire conversation deletion...")
        
        success, error, response = self.make_request(
            'DELETE', 
            f'chat/conversations/{conversation_id}',
            expected_status=200
        )
        
        if success and response.get('success'):
            self.log_result("Delete Entire Conversation", True, f"Deleted conversation {conversation_id}")
            return True
        else:
            self.log_result("Delete Entire Conversation", False, error=error or "Deletion failed")
            return False

    def test_verify_conversation_deleted_from_db(self, conversation_id):
        """Verify conversation is actually deleted from database"""
        print(f"\n🔍 Verifying conversation deleted from database...")
        
        # Try to get conversations for user
        success, error, response = self.make_request('GET', f'chat/conversations/{self.user_id}')
        
        if success:
            conversations = response if isinstance(response, list) else []
            # Check if our conversation still exists
            conv_exists = any(conv.get('id') == conversation_id for conv in conversations)
            
            if not conv_exists:
                self.log_result("Verify Conversation Deleted from DB", True, "Conversation not found - deletion successful")
                return True
            else:
                self.log_result("Verify Conversation Deleted from DB", False, "Conversation still exists in DB")
                return False
        else:
            self.log_result("Verify Conversation Deleted from DB", False, error=error)
            return False

    def run_comprehensive_deletion_tests(self):
        """Run comprehensive chat deletion tests"""
        print("=" * 80)
        print("🧪 CHAT DELETION FUNCTIONALITY TESTING")
        print("=" * 80)
        print(f"Testing API: {self.base_url}")
        print(f"Test User: {self.test_email}")
        print("=" * 80)

        # Step 1: Login
        if not self.test_user_login():
            print("❌ Cannot proceed without authentication")
            return False

        # Step 2: Create test conversation
        conversation_id = self.test_create_test_conversation()
        if not conversation_id:
            print("❌ Cannot proceed without test conversation")
            return False

        # Step 3: Send test messages
        message_ids = self.test_send_test_messages(conversation_id, 5)
        if len(message_ids) == 0:
            print("❌ Cannot proceed without test messages")
            return False

        # Step 4: Verify messages exist before deletion
        messages_before = self.test_get_messages_before_deletion(conversation_id)
        if len(messages_before) == 0:
            print("❌ No messages found to test deletion")
            return False

        # Step 5: Test single message deletion
        if len(message_ids) > 0:
            self.test_delete_single_message(message_ids[0])

        # Step 6: Test conversation history clearing
        self.test_clear_conversation_history(conversation_id)

        # Step 7: Verify messages are deleted from database
        self.test_verify_messages_deleted_from_db(conversation_id)

        # Step 8: Create new messages for conversation deletion test
        print(f"\n📝 Creating new messages for conversation deletion test...")
        new_message_ids = self.test_send_test_messages(conversation_id, 2)

        # Step 9: Test entire conversation deletion
        self.test_delete_entire_conversation(conversation_id)

        # Step 10: Verify conversation is deleted from database
        self.test_verify_conversation_deleted_from_db(conversation_id)

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
    tester = ChatDeletionTester()
    
    try:
        success = tester.run_comprehensive_deletion_tests()
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