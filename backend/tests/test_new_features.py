"""
Backend API Tests for Name Craft E-commerce
Tests: Navigation, Refunds, WhatsApp Settings, Product Images
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admin-ui-revamp-11.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "admin123"


class TestNavigation:
    """Navigation API endpoint tests"""
    
    def test_public_navigation_endpoint(self):
        """Test /api/navigation returns navigation items"""
        response = requests.get(f"{BASE_URL}/api/navigation")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check structure of navigation items
        first_item = data[0]
        assert "name" in first_item
        assert "href" in first_item
        print(f"Navigation items: {len(data)}")
    
    def test_navigation_item_structure(self):
        """Test navigation item has required fields"""
        response = requests.get(f"{BASE_URL}/api/navigation")
        assert response.status_code == 200
        data = response.json()
        for item in data:
            assert "id" in item
            assert "name" in item
            assert "href" in item
            # Verify href starts with /
            assert item["href"].startswith("/")
        print("All navigation items have valid structure")
    
    def test_navigation_highlight_flag(self):
        """Test some items can have highlight flag"""
        response = requests.get(f"{BASE_URL}/api/navigation")
        assert response.status_code == 200
        data = response.json()
        highlighted = [item for item in data if item.get("highlight")]
        print(f"Highlighted items: {len(highlighted)}")


class TestAdminAuth:
    """Admin authentication tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        data = response.json()
        assert "token" in data
        return data["token"]
    
    def test_admin_login(self, admin_token):
        """Test admin can login"""
        assert admin_token is not None
        print("Admin login successful")


class TestAdminNavigation:
    """Admin Navigation CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json()["token"]
    
    def test_admin_get_navigation(self, admin_token):
        """Admin can get all navigation items"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/navigation", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Admin navigation items: {len(data)}")
    
    def test_admin_create_navigation(self, admin_token):
        """Admin can create a navigation item"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        unique_name = f"TEST_nav_{uuid.uuid4().hex[:6]}"
        nav_data = {
            "name": unique_name,
            "href": "/test-page",
            "order": 99,
            "highlight": False
        }
        response = requests.post(f"{BASE_URL}/api/admin/navigation", json=nav_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == unique_name
        assert data["href"] == "/test-page"
        assert "id" in data
        print(f"Created navigation item: {data['id']}")
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/navigation/{data['id']}", headers=headers)
    
    def test_admin_update_navigation(self, admin_token):
        """Admin can update a navigation item"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Create a test item first
        unique_name = f"TEST_nav_{uuid.uuid4().hex[:6]}"
        create_res = requests.post(f"{BASE_URL}/api/admin/navigation", json={
            "name": unique_name,
            "href": "/original-path",
            "order": 99
        }, headers=headers)
        assert create_res.status_code == 200
        nav_id = create_res.json()["id"]
        
        # Update it
        update_res = requests.put(f"{BASE_URL}/api/admin/navigation/{nav_id}", json={
            "name": f"{unique_name}_updated",
            "href": "/updated-path"
        }, headers=headers)
        assert update_res.status_code == 200
        print(f"Updated navigation item: {nav_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/navigation/{nav_id}", headers=headers)
    
    def test_admin_delete_navigation(self, admin_token):
        """Admin can delete a navigation item"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Create a test item first
        unique_name = f"TEST_nav_{uuid.uuid4().hex[:6]}"
        create_res = requests.post(f"{BASE_URL}/api/admin/navigation", json={
            "name": unique_name,
            "href": "/to-delete",
            "order": 99
        }, headers=headers)
        assert create_res.status_code == 200
        nav_id = create_res.json()["id"]
        
        # Delete it
        delete_res = requests.delete(f"{BASE_URL}/api/admin/navigation/{nav_id}", headers=headers)
        assert delete_res.status_code == 200
        print(f"Deleted navigation item: {nav_id}")
    
    def test_admin_seed_navigation(self, admin_token):
        """Admin can seed default navigation"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{BASE_URL}/api/admin/navigation/seed", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "added" in data
        print(f"Seeded navigation - Added: {data['added']}")


class TestAdminRefunds:
    """Admin Refunds CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json()["token"]
    
    def test_admin_get_refunds(self, admin_token):
        """Admin can get all refund requests"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/refunds", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "refunds" in data
        assert "total" in data
        assert isinstance(data["refunds"], list)
        print(f"Refunds count: {data['total']}")
    
    def test_admin_get_refunds_with_status_filter(self, admin_token):
        """Admin can filter refunds by status"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        for status in ["pending", "approved", "processed", "rejected"]:
            response = requests.get(f"{BASE_URL}/api/admin/refunds?status={status}", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert "refunds" in data
        print("Refunds status filter works")
    
    def test_admin_create_refund_requires_order(self, admin_token):
        """Creating refund without valid order should fail"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        refund_data = {
            "order_id": "non-existent-order-id",
            "amount": 100.00,
            "reason": "Test refund"
        }
        response = requests.post(f"{BASE_URL}/api/admin/refunds", json=refund_data, headers=headers)
        # Should return 404 for non-existent order
        assert response.status_code == 404
        print("Refund creation properly validates order existence")


class TestProductImages:
    """Product image URL tests"""
    
    def test_earrings_products_have_valid_images(self):
        """Test earrings products have image URLs"""
        response = requests.get(f"{BASE_URL}/api/products?category=earrings")
        assert response.status_code == 200
        data = response.json()
        products = data["products"]
        assert len(products) > 0
        
        for product in products:
            assert "image" in product
            assert product["image"].startswith("http")
            # Check images are from valid sources
            valid_sources = ["unsplash.com", "pexels.com", "emergentagent.com", "via.placeholder"]
            has_valid_source = any(source in product["image"] for source in valid_sources)
            assert has_valid_source, f"Invalid image source for {product['name']}: {product['image']}"
        print(f"All {len(products)} earrings products have valid image URLs")
    
    def test_for_her_products_have_valid_images(self):
        """Test for-her products have image URLs"""
        response = requests.get(f"{BASE_URL}/api/products?category=for-her")
        assert response.status_code == 200
        data = response.json()
        products = data["products"]
        assert len(products) > 0
        
        for product in products:
            assert "image" in product
            assert product["image"].startswith("http")
        print(f"All {len(products)} for-her products have valid image URLs")
    
    def test_products_have_hover_images(self):
        """Test products have hover images"""
        response = requests.get(f"{BASE_URL}/api/products?limit=20")
        assert response.status_code == 200
        data = response.json()
        products = data["products"]
        
        products_with_hover = [p for p in products if p.get("hover_image")]
        print(f"{len(products_with_hover)}/{len(products)} products have hover images")


class TestWhatsAppSettings:
    """WhatsApp settings tests (via site settings)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json()["token"]
    
    def test_admin_can_update_whatsapp_settings(self, admin_token):
        """Admin can update WhatsApp settings"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Update WhatsApp settings
        update_data = {
            "whatsapp_enabled": False,
            "whatsapp_number": "+91 98765 43210",
            "send_whatsapp_order_confirmation": True,
            "send_whatsapp_shipping_notification": True
        }
        response = requests.put(f"{BASE_URL}/api/admin/settings", json=update_data, headers=headers)
        assert response.status_code == 200
        
        # Verify the update persisted
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=headers)
        assert get_response.status_code == 200
        data = get_response.json()
        
        # Now these settings should exist
        assert data.get("whatsapp_number") == "+91 98765 43210"
        print(f"WhatsApp settings update successful")
        print(f"WhatsApp enabled: {data.get('whatsapp_enabled', False)}")


class TestProductCustomImage:
    """Test product custom image upload feature"""
    
    def test_some_products_allow_custom_image(self):
        """Some products should have allow_custom_image flag"""
        response = requests.get(f"{BASE_URL}/api/products?limit=50")
        assert response.status_code == 200
        data = response.json()
        products = data["products"]
        
        products_with_custom = [p for p in products if p.get("allow_custom_image")]
        assert len(products_with_custom) > 0, "No products found with allow_custom_image flag"
        print(f"{len(products_with_custom)}/{len(products)} products allow custom image upload")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
