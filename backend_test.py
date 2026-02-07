#!/usr/bin/env python3
"""
Backend API Testing for Name Strings E-commerce Platform
Tests all major endpoints and functionality
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://catalog-qa-check.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "Test123!"
ADMIN_NAME = "Admin"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        })
    
    def make_request(self, method, endpoint, **kwargs):
        """Make HTTP request with error handling"""
        url = f"{BASE_URL}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token:
            headers = kwargs.get('headers', {})
            headers['Authorization'] = f'Bearer {self.auth_token}'
            kwargs['headers'] = headers
            
        try:
            response = self.session.request(method, url, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = self.make_request('GET', '/')
        
        if response and response.status_code == 200:
            data = response.json()
            if "message" in data:
                self.log_test("Root Endpoint", True, f"API is running: {data['message']}")
                return True
        
        self.log_test("Root Endpoint", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_get_products(self):
        """Test GET /products endpoint"""
        response = self.make_request('GET', '/products')
        
        if response and response.status_code == 200:
            data = response.json()
            if "products" in data and "total" in data:
                product_count = len(data["products"])
                self.log_test("Get Products", True, f"Retrieved {product_count} products, total: {data['total']}")
                return True
        
        self.log_test("Get Products", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_get_product_by_slug(self):
        """Test GET /products/{slug} endpoint"""
        slug = "chic-signature-necklace"
        response = self.make_request('GET', f'/products/{slug}')
        
        if response and response.status_code == 200:
            data = response.json()
            if "name" in data and "slug" in data:
                self.log_test("Get Product by Slug", True, f"Retrieved product: {data['name']}")
                return True
        elif response and response.status_code == 404:
            self.log_test("Get Product by Slug", False, f"Product '{slug}' not found - may need seeding")
            return False
        
        self.log_test("Get Product by Slug", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_get_categories(self):
        """Test GET /categories endpoint"""
        response = self.make_request('GET', '/categories')
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get Categories", True, f"Retrieved {len(data)} categories")
                return True
        
        self.log_test("Get Categories", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_get_settings(self):
        """Test GET /settings endpoint"""
        response = self.make_request('GET', '/settings')
        
        if response and response.status_code == 200:
            data = response.json()
            if "site_name" in data and "currency" in data:
                self.log_test("Get Settings", True, f"Site: {data['site_name']}, Currency: {data['currency']}")
                return True
        
        self.log_test("Get Settings", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_admin_setup(self):
        """Test POST /admin/setup endpoint"""
        payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "name": ADMIN_NAME,
            "role": "admin"
        }
        
        response = self.make_request('POST', '/admin/setup', json=payload)
        
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                self.auth_token = data["token"]
                self.log_test("Admin Setup", True, f"Admin created: {data['user']['email']}")
                return True
        elif response and response.status_code == 400:
            # Admin might already exist, this is expected
            error_detail = response.json().get("detail", "")
            if "already exists" in error_detail:
                self.log_test("Admin Setup", True, "Admin already exists (expected)")
                return True
        
        self.log_test("Admin Setup", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_admin_login(self):
        """Test POST /auth/login endpoint"""
        payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request('POST', '/auth/login', json=payload)
        
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                self.auth_token = data["token"]
                self.log_test("Admin Login", True, f"Logged in as: {data['user']['email']}")
                return True
        
        self.log_test("Admin Login", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_admin_dashboard(self):
        """Test GET /admin/dashboard endpoint (requires auth)"""
        if not self.auth_token:
            self.log_test("Admin Dashboard", False, "No auth token available")
            return False
            
        response = self.make_request('GET', '/admin/dashboard')
        
        if response and response.status_code == 200:
            data = response.json()
            if "stats" in data:
                stats = data["stats"]
                self.log_test("Admin Dashboard", True, 
                            f"Orders: {stats.get('total_orders', 0)}, "
                            f"Users: {stats.get('total_users', 0)}, "
                            f"Products: {stats.get('total_products', 0)}")
                return True
        elif response and response.status_code == 403:
            self.log_test("Admin Dashboard", False, "Access denied - auth token invalid")
            return False
        
        self.log_test("Admin Dashboard", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_admin_seed_data(self):
        """Test POST /admin/seed endpoint (requires auth)"""
        if not self.auth_token:
            self.log_test("Admin Seed Data", False, "No auth token available")
            return False
            
        response = self.make_request('POST', '/admin/seed')
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("success"):
                self.log_test("Admin Seed Data", True, data.get("message", "Data seeded successfully"))
                return True
        
        self.log_test("Admin Seed Data", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_create_order(self):
        """Test POST /orders endpoint"""
        # First get a real product ID
        products_response = self.make_request('GET', '/products')
        product_id = None
        
        if products_response and products_response.status_code == 200:
            products_data = products_response.json()
            if products_data.get("products") and len(products_data["products"]) > 0:
                product_id = products_data["products"][0]["id"]
        
        if not product_id:
            self.log_test("Create Order", False, "No products available to create order")
            return False
        
        payload = {
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 1,
                    "customization": {"name": "Test"}
                }
            ],
            "shipping_address": {
                "first_name": "Test",
                "last_name": "User",
                "email": "test@example.com",
                "phone": "9876543210",
                "address": "123 Test St",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "payment_method": "upi"
        }
        
        response = self.make_request('POST', '/orders', json=payload)
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "order_number" in data:
                self.log_test("Create Order", True, f"Order created: {data['order_number']}")
                return True
        elif response and response.status_code == 400:
            # Product might not exist
            self.log_test("Create Order", False, "Product not found - may need seeding first")
            return False
        
        self.log_test("Create Order", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def test_validate_coupon(self):
        """Test POST /coupons/validate endpoint"""
        # First create a coupon if we have admin access
        if self.auth_token:
            coupon_payload = {
                "code": "SAVE10",
                "discount_type": "percentage",
                "discount_value": 10,
                "min_order_amount": 1000
            }
            self.make_request('POST', '/admin/coupons', json=coupon_payload)
        
        payload = {
            "code": "SAVE10",
            "subtotal": 1499
        }
        
        response = self.make_request('POST', '/coupons/validate', params=payload)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("valid"):
                self.log_test("Validate Coupon", True, f"Coupon valid, discount: ₹{data.get('discount', 0)}")
                return True
        elif response and response.status_code == 404:
            self.log_test("Validate Coupon", False, "Coupon 'SAVE10' not found - may need to be created")
            return False
        
        self.log_test("Validate Coupon", False, f"Failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"🚀 Starting Name Strings API Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print("=" * 60)
        
        # Basic API tests
        self.test_root_endpoint()
        self.test_get_settings()
        self.test_get_categories()
        self.test_get_products()
        
        # Auth tests
        self.test_admin_setup()
        if not self.auth_token:
            self.test_admin_login()
        
        # Admin tests (require auth)
        if self.auth_token:
            self.test_admin_seed_data()
            self.test_admin_dashboard()
        
        # Test product by slug after seeding
        self.test_get_product_by_slug()
        
        # Order and coupon tests
        self.test_create_order()
        self.test_validate_coupon()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n🎯 Success Rate: {(passed/total)*100:.1f}%")
        
        return passed, total

def main():
    """Main test execution"""
    tester = APITester()
    passed, total = tester.run_all_tests()
    
    # Exit with appropriate code
    if passed == total:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} tests failed")
        sys.exit(1)

if __name__ == "__main__":
    main()