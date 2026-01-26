"""
Razorpay Payment Integration Tests
Tests for Razorpay config, order creation, and verification endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRazorpayConfig:
    """Test Razorpay configuration endpoint"""
    
    def test_razorpay_config_returns_enabled(self):
        """GET /api/payment/razorpay/config should return enabled status and key_id"""
        response = requests.get(f"{BASE_URL}/api/payment/razorpay/config")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "enabled" in data
        assert data["enabled"] == True
        assert "key_id" in data
        assert data["key_id"].startswith("rzp_test_")
        assert "name" in data
        assert "currency" in data
        assert data["currency"] == "INR"
        print(f"✓ Razorpay config: enabled={data['enabled']}, key_id={data['key_id'][:15]}...")


class TestRazorpayOrderCreation:
    """Test Razorpay order creation endpoint"""
    
    def test_create_razorpay_order_success(self):
        """POST /api/payment/razorpay/create-order should create a valid Razorpay order"""
        payload = {
            "amount": 1499,
            "order_id": "test_order_001",
            "email": "test@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payment/razorpay/create-order",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["id"].startswith("order_")  # Razorpay order IDs start with 'order_'
        assert "amount" in data
        assert data["amount"] == 149900  # Amount in paise (1499 * 100)
        assert "currency" in data
        assert data["currency"] == "INR"
        assert "key_id" in data
        print(f"✓ Razorpay order created: {data['id']}, amount={data['amount']} paise")
    
    def test_create_razorpay_order_with_different_amounts(self):
        """Test order creation with various amounts"""
        test_amounts = [999, 1999, 2499]
        
        for amount in test_amounts:
            payload = {
                "amount": amount,
                "order_id": f"test_order_{amount}",
                "email": "test@example.com"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/payment/razorpay/create-order",
                json=payload
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["amount"] == amount * 100  # Verify paise conversion
            print(f"✓ Order for ₹{amount} created: {data['id']}")


class TestRazorpayVerification:
    """Test Razorpay payment verification endpoint"""
    
    def test_verify_payment_missing_details(self):
        """POST /api/payment/razorpay/verify should fail with missing details"""
        payload = {
            "razorpay_order_id": "",
            "razorpay_payment_id": "",
            "razorpay_signature": ""
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payment/razorpay/verify",
            json=payload
        )
        
        # Should return 400 for missing details
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Verification correctly rejects missing details: {data['detail']}")
    
    def test_verify_payment_invalid_signature(self):
        """POST /api/payment/razorpay/verify should fail with invalid signature"""
        payload = {
            "razorpay_order_id": "order_test123",
            "razorpay_payment_id": "pay_test123",
            "razorpay_signature": "invalid_signature_here",
            "order_id": "test_order"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payment/razorpay/verify",
            json=payload
        )
        
        # Should return 400 for invalid signature
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Verification correctly rejects invalid signature: {data['detail']}")


class TestOrderCreationWithRazorpay:
    """Test full order creation flow with Razorpay payment method"""
    
    def test_create_order_with_razorpay_payment(self):
        """Create an order with Razorpay as payment method"""
        # First get a product
        products_response = requests.get(f"{BASE_URL}/api/products")
        assert products_response.status_code == 200
        products = products_response.json()["products"]
        assert len(products) > 0
        
        product = products[0]
        
        # Create order
        order_payload = {
            "items": [{
                "product_id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": 1,
                "image": product["image"],
                "customization": {"name": "TEST_Razorpay"}
            }],
            "shipping_address": {
                "first_name": "Test",
                "last_name": "User",
                "email": "test@razorpay.com",
                "phone": "+919876543210",
                "address": "123 Test Street",
                "apartment": "Apt 1",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "payment_method": "razorpay",
            "coupon_code": None
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify order structure
        assert "id" in data
        assert "order_number" in data
        assert data["payment_method"] == "razorpay"
        assert data["payment_status"] == "pending"
        assert "total" in data
        print(f"✓ Order created with Razorpay: {data['order_number']}, total=₹{data['total']}")
        
        return data["order_number"]


class TestSettingsRazorpayEnabled:
    """Test that Razorpay is enabled in site settings"""
    
    def test_settings_has_razorpay_enabled(self):
        """GET /api/settings should show razorpay_enabled"""
        response = requests.get(f"{BASE_URL}/api/settings")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "razorpay_enabled" in data
        assert data["razorpay_enabled"] == True
        print(f"✓ Site settings: razorpay_enabled={data['razorpay_enabled']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
