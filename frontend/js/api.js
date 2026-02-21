/**
 * StyleSai API Module
 * Handles all API communications with the backend
 */

const API_BASE_URL = (() => {
    if (window.STYLESAI_API_BASE_URL) return window.STYLESAI_API_BASE_URL;
    const { protocol, hostname, port } = window.location;
    if (protocol.startsWith('http') && hostname) {
        // If frontend is served by backend, use same origin; if served on another port, target backend default port.
        return port === '8000' ? window.location.origin : `${protocol}//${hostname}:8000`;
    }
    // Fallback for file:// and other non-http contexts.
    return 'http://localhost:8000';
})();

const API = {
    // Products API
    products: {
        getAll: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/api/products?${queryString}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        },

        getById: async (id) => {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
            if (!response.ok) throw new Error('Product not found');
            return await response.json();
        },

        getByCategory: async (category) => {
            const response = await fetch(`${API_BASE_URL}/api/products/category/${category}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        },

        getBySubcategory: async (subcategory) => {
            const response = await fetch(`${API_BASE_URL}/api/products/subcategory/${subcategory}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        },

        search: async (query) => {
            const response = await fetch(`${API_BASE_URL}/api/products?search=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        },

        getCategories: async () => {
            const response = await fetch(`${API_BASE_URL}/api/products/categories`);
            if (!response.ok) throw new Error('Failed to fetch categories');
            return await response.json();
        }
    },

    // Cart API
    cart: {
        get: async () => {
            const response = await fetch(`${API_BASE_URL}/api/cart`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            return await response.json();
        },

        add: async (productId, quantity = 1, size = 'M', color = 'Black') => {
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity, size, color })
            });
            if (!response.ok) throw new Error('Failed to add to cart');
            return await response.json();
        },

        remove: async (productId) => {
            const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to remove from cart');
            return await response.json();
        },

        update: async (productId, quantity, size, color) => {
            const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity, size, color })
            });
            if (!response.ok) throw new Error('Failed to update cart');
            return await response.json();
        },

        clear: async () => {
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to clear cart');
            return await response.json();
        },

        checkout: async (deliveryAddress, paymentMethod, couponCode = '') => {
            const response = await fetch(`${API_BASE_URL}/api/cart/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    delivery_address: deliveryAddress,
                    payment_method: paymentMethod,
                    coupon_code: couponCode
                })
            });
            if (!response.ok) throw new Error('Checkout failed');
            return await response.json();
        },

        getCoupons: async () => {
            const response = await fetch(`${API_BASE_URL}/api/cart/coupons`);
            if (!response.ok) throw new Error('Failed to get coupons');
            return await response.json();
        },

        applyCoupon: async (code) => {
            const response = await fetch(`${API_BASE_URL}/api/cart/apply-coupon?code=${encodeURIComponent(code)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to apply coupon');
            return await response.json();
        }
    },

    // Recommendations API
    recommend: {
        outfit: async (productId, stylePreference = null, occasion = null, budget = null) => {
            const body = { product_id: productId };
            if (stylePreference) body.style_preference = stylePreference;
            if (occasion) body.occasion = occasion;
            if (budget) body.budget = budget;

            const response = await fetch(`${API_BASE_URL}/api/recommend/outfit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to get outfit recommendations');
            return await response.json();
        },

        match: async (productId, category = null) => {
            const body = { product_id: productId };
            if (category) body.category = category;

            const response = await fetch(`${API_BASE_URL}/api/recommend/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Failed to get matching items');
            return await response.json();
        },

        personalize: async (style, colors, budget, bodyType, occasion) => {
            const response = await fetch(`${API_BASE_URL}/api/recommend/personalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ style, colors, budget, body_type: bodyType, occasion })
            });
            if (!response.ok) throw new Error('Failed to get personalized recommendations');
            return await response.json();
        },

        analyzeImage: async (imageFile) => {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_BASE_URL}/api/recommend/analyze-image`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to analyze image');
            return await response.json();
        },

        trends: async (category) => {
            const response = await fetch(`${API_BASE_URL}/api/recommend/trends/${category}`);
            if (!response.ok) throw new Error('Failed to get trends');
            return await response.json();
        },

        similar: async (productId) => {
            const response = await fetch(`${API_BASE_URL}/api/recommend/similar/${productId}`);
            if (!response.ok) throw new Error('Failed to get similar products');
            return await response.json();
        }
    },

    // Health check
    health: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (e) {
            console.error('API not reachable:', e);
            return null;
        }
    }
};

// Export for use in other modules
window.API = API;
