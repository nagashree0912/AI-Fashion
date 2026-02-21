/**
 * StyleSai Cart Module
 * Handles shopping cart with checkout
 */
const Cart = {
    items: [], total: 0, subtotal: 0, discount: 0, deliveryCharge: 0, itemCount: 0, appliedCoupon: null,

    async init() { await this.load(); this.setupEventListeners(); },

    async load() {
        try {
            const cartData = await API.cart.get();
            this.items = cartData.items || [];
            this.subtotal = cartData.subtotal || 0;
            this.discount = cartData.discount || 0;
            this.deliveryCharge = cartData.delivery_charge || 0;
            this.total = cartData.total || 0;
            this.itemCount = cartData.item_count || 0;
            this.updateUI();
        } catch (e) { console.error('Failed to load cart:', e); }
    },

    setupEventListeners() {
        const cartBtn = document.getElementById('cartBtn');
        const cartSidebar = document.getElementById('cartSidebar');
        const closeCart = document.getElementById('closeCart');
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (cartBtn) cartBtn.addEventListener('click', () => this.open());
        if (closeCart) closeCart.addEventListener('click', () => this.close());
        if (cartSidebar) cartSidebar.addEventListener('click', (e) => { if (e.target === cartSidebar) this.close(); });
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.openCheckout());
    },

    open() { document.getElementById('cartSidebar')?.classList.add('active'); document.body.style.overflow = 'hidden'; },
    close() { document.getElementById('cartSidebar')?.classList.remove('active'); document.body.style.overflow = ''; },

    async add(product, quantity = 1, size = 'M', color = 'Black') {
        try {
            const result = await API.cart.add(product.id, quantity, size, color);
            this.items = result.items || [];
            this.subtotal = result.subtotal || 0;
            this.discount = result.discount || 0;
            this.deliveryCharge = result.delivery_charge || 0;
            this.total = result.total || 0;
            this.itemCount = result.item_count || 0;
            this.updateUI();
            this.showToast(`${product.name} added to cart!`, 'success');
        } catch (e) { console.error('Failed to add to cart:', e); this.showToast('Failed to add to cart', 'error'); }
    },

    async remove(productId) {
        try {
            const result = await API.cart.remove(productId);
            this.items = result.items || [];
            this.subtotal = result.subtotal || 0;
            this.discount = result.discount || 0;
            this.deliveryCharge = result.delivery_charge || 0;
            this.total = result.total || 0;
            this.itemCount = result.item_count || 0;
            this.updateUI();
            this.showToast('Item removed from cart', 'info');
        } catch (e) { console.error('Failed to remove from cart:', e); this.showToast('Failed to remove item', 'error'); }
    },

    async updateQuantity(productId, change) {
        const item = this.items.find(i => i.product.id === productId);
        if (!item) return;
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) { await this.remove(productId); return; }
        try {
            const result = await API.cart.update(productId, newQuantity, item.size, item.color);
            this.items = result.items || [];
            this.subtotal = result.subtotal || 0;
            this.discount = result.discount || 0;
            this.deliveryCharge = result.delivery_charge || 0;
            this.total = result.total || 0;
            this.itemCount = result.item_count || 0;
            this.updateUI();
        } catch (e) { console.error('Failed to update quantity:', e); }
    },

    updateUI() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) { cartCount.textContent = this.itemCount; cartCount.style.display = this.itemCount > 0 ? 'flex' : 'none'; }
        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) cartTotal.textContent = `₹${this.total.toLocaleString('en-IN')}`;
        this.renderCartItems();
    },

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;
        if (this.items.length === 0) { cartItemsContainer.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>'; return; }
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${item.product.image_url}" alt="${item.product.name}"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-options">Size: ${item.size} | Color: ${item.color}</div>
                    <div class="cart-item-price">${item.item_discount > 0 ? `<span class="original-price">₹${item.item_subtotal}</span> ` : ''}₹${item.item_total || item.product.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="Cart.updateQuantity(${item.product.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="Cart.updateQuantity(${item.product.id}, 1)">+</button>
                    </div>
                </div>
            </div>`).join('');
    },

    async openCheckout() {
        if (this.items.length === 0) { this.showToast('Your cart is empty', 'error'); return; }
        this.close();
        const checkoutModal = document.createElement('div');
        checkoutModal.className = 'modal checkout-modal';
        checkoutModal.id = 'checkoutModal';
        checkoutModal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button>
                <div class="checkout-header"><h2><i class="fas fa-shopping-cart"></i> Checkout</h2></div>
                <div class="checkout-body">
                    <div class="checkout-form">
                        <div class="form-section">
                            <h3><i class="fas fa-map-marker-alt"></i> Delivery Address</h3>
                            <div class="form-row">
                                <div class="form-group"><label>Full Name *</label><input type="text" id="checkoutName" required></div>
                                <div class="form-group"><label>Phone *</label><input type="tel" id="checkoutPhone" required></div>
                            </div>
                            <div class="form-group"><label>Address *</label><input type="text" id="checkoutAddress1" required></div>
                            <div class="form-group"><label>Address Line 2</label><input type="text" id="checkoutAddress2"></div>
                            <div class="form-row">
                                <div class="form-group"><label>City *</label><input type="text" id="checkoutCity" required></div>
                                <div class="form-group"><label>State *</label><input type="text" id="checkoutState" required></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group"><label>Pincode *</label><input type="text" id="checkoutPincode" required></div>
                                <div class="form-group"><label>Landmark</label><input type="text" id="checkoutLandmark"></div>
                            </div>
                        </div>
                        <div class="form-section">
                            <h3><i class="fas fa-credit-card"></i> Payment Method</h3>
                            <div class="payment-options">
                                <label class="payment-option"><input type="radio" name="payment" value="COD" checked><span><i class="fas fa-money-bill-wave"></i> COD</span></label>
                                <label class="payment-option"><input type="radio" name="payment" value="Card"><span><i class="fas fa-credit-card"></i> Card</span></label>
                                <label class="payment-option"><input type="radio" name="payment" value="UPI"><span><i class="fas fa-mobile-alt"></i> UPI</span></label>
                                <label class="payment-option"><input type="radio" name="payment" value="NetBanking"><span><i class="fas fa-university"></i> Net Banking</span></label>
                            </div>
                        </div>
                        <div class="form-section">
                            <h3><i class="fas fa-tag"></i> Coupon</h3>
                            <div class="coupon-input">
                                <input type="text" id="couponCode" placeholder="Enter coupon">
                                <button class="btn btn-secondary" onclick="Cart.applyCoupon()">Apply</button>
                            </div>
                            <div class="available-coupons">
                                <span>Available: </span>
                                <span class="coupon-tag" onclick="document.getElementById('couponCode').value='STYLE10'; Cart.applyCoupon()">STYLE10</span>
                                <span class="coupon-tag" onclick="document.getElementById('couponCode').value='STYLE20'; Cart.applyCoupon()">STYLE20</span>
                                <span class="coupon-tag" onclick="document.getElementById('couponCode').value='NEWUSER'; Cart.applyCoupon()">NEWUSER</span>
                            </div>
                            <div id="couponMessage"></div>
                        </div>
                    </div>
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div class="summary-items">${this.items.map(item => `<div class="summary-item"><img src="${item.product.image_url}"><div class="summary-item-details"><div>${item.product.name}</div><div>Qty: ${item.quantity}</div></div><div>₹${(item.item_total || item.product.price).toLocaleString()}</div></div>`).join('')}</div>
                        <div class="summary-calculations">
                            <div class="summary-row"><span>Subtotal</span><span>₹${this.subtotal.toLocaleString()}</span></div>
                            <div class="summary-row discount"><span>Discount</span><span>-₹${this.discount.toLocaleString()}</span></div>
                            <div class="summary-row"><span>Delivery</span><span>${this.deliveryCharge === 0 ? 'FREE' : '₹' + this.deliveryCharge}</span></div>
                            <div class="summary-row coupon-discount" id="couponDiscountRow" style="display:none"><span>Coupon</span><span id="couponDiscountAmount">-₹0</span></div>
                            <div class="summary-row total"><span>Total</span><span id="checkoutTotal">₹${this.total.toLocaleString()}</span></div>
                        </div>
                        <div class="delivery-info"><i class="fas fa-truck"></i><span>Delivery: 5-7 business days</span></div>
                        <button class="btn btn-primary" onclick="Cart.placeOrder()"><i class="fas fa-check"></i> Place Order</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(checkoutModal);
        checkoutModal.style.display = 'flex';
    },

    async applyCoupon() {
        const code = document.getElementById('couponCode')?.value.trim().toUpperCase();
        if (!code) { this.showCouponMessage('Enter coupon code', 'error'); return; }
        try {
            const result = await API.cart.applyCoupon(code);
            if (result.valid) {
                this.appliedCoupon = result;
                document.getElementById('couponDiscountRow').style.display = 'flex';
                const couponDiscount = this.subtotal * result.discount / 100;
                document.getElementById('couponDiscountAmount').textContent = `-₹${couponDiscount.toLocaleString()}`;
                const newTotal = this.total - couponDiscount;
                document.getElementById('checkoutTotal').textContent = `₹${newTotal.toLocaleString()}`;
                this.showCouponMessage(result.message, 'success');
            } else { this.showCouponMessage(result.message, 'error'); }
        } catch (e) { this.showCouponMessage('Failed to apply coupon', 'error'); }
    },

    showCouponMessage(message, type) {
        const msgDiv = document.getElementById('couponMessage');
        if (msgDiv) { msgDiv.innerHTML = `<div class="coupon-message ${type}">${message}</div>`; setTimeout(() => msgDiv.innerHTML = '', 3000); }
    },

    async placeOrder() {
        const fullName = document.getElementById('checkoutName')?.value.trim();
        const phone = document.getElementById('checkoutPhone')?.value.trim();
        const address1 = document.getElementById('checkoutAddress1')?.value.trim();
        const city = document.getElementById('checkoutCity')?.value.trim();
        const state = document.getElementById('checkoutState')?.value.trim();
        const pincode = document.getElementById('checkoutPincode')?.value.trim();
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        
        if (!fullName || !phone || !address1 || !city || !state || !pincode) {
            this.showToast('Fill all required fields', 'error'); return;
        }

        const deliveryAddress = { full_name: fullName, phone, address_line1: address1, address_line2: document.getElementById('checkoutAddress2')?.value || '', city, state, pincode, landmark: document.getElementById('checkoutLandmark')?.value || '' };
        const couponCode = document.getElementById('couponCode')?.value.trim() || '';

        try {
            const order = await API.cart.checkout(deliveryAddress, paymentMethod, couponCode);
            document.getElementById('checkoutModal')?.remove();
            this.showOrderSuccess(order);
            this.items = []; this.total = 0; this.itemCount = 0; this.updateUI();
        } catch (e) { console.error('Checkout failed:', e); this.showToast('Checkout failed', 'error'); }
    },

    showOrderSuccess(order) {
        const successModal = document.createElement('div');
        successModal.className = 'modal success-modal';
        successModal.innerHTML = `<div class="modal-content"><div class="success-content">
            <div class="success-icon"><i class="fas fa-check-circle"></i></div>
            <h2>Order Placed!</h2>
            <p class="order-id">Order ID: ${order.order_id}</p>
            <p><strong>Delivery:</strong> ${order.delivery_address.full_name}, ${order.delivery_address.city}</p>
            <p><strong>Payment:</strong> ${order.payment_method}</p>
            <p><strong>Delivery:</strong> ${order.estimated_delivery}</p>
            <p class="total-amount">Total: ₹${order.total.toLocaleString()}</p>
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Continue Shopping</button>
        </div></div>`;
        document.body.appendChild(successModal);
        successModal.style.display = 'flex';
    },

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'slideInRight 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); }, 3000);
    },

    isInCart(productId) { return this.items.some(item => item.product.id === productId); }
};

window.Cart = Cart;
