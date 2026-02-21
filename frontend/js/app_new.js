/**
 * StyleSai - Main Application
 * Handles navigation, product display, and user interactions
 */

// Global state
const App = {
    currentCategory: 'all',
    currentSubcategory: 'all',
    products: [],
    user: null,
    
    async init() {
        console.log('Initializing StyleSai...');
        
        // Check for saved user
        const savedUser = localStorage.getItem('stylesai_user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.updateAuthUI();
        }
        
        // Load products
        await this.loadProducts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize modules
        if (typeof Cart !== 'undefined') Cart.init();
        if (typeof AI !== 'undefined') AI.init();
        
        console.log('StyleSai initialized!');
    },
    
    async loadProducts() {
        try {
            this.products = await API.products.getAll();
            this.renderProducts('menswear');
            this.renderProducts('womenswear');
            this.renderProducts('kidswear');
            this.renderProducts('genz');
        } catch (e) {
            console.error('Failed to load products:', e);
            this.showToast('Failed to load products', 'error');
        }
    },
    
    renderProducts(category) {
        const container = document.getElementById(`${category}-products`);
        if (!container) return;
        
        let filtered = this.products.filter(p => p.category === category);
        
        if (category === 'menswear') {
            const subMap = {shirts: 'shirts', tshirts: 'tshirts', blazers: 'blazers', hoodies: 'hoodies', sweatshirts: 'sweatshirts', pants: 'pants', footwear: 'footwear', accessories: 'accessories'};
            const subcats = Object.values(subMap);
            if (this.currentSubcategory !== 'all' && subcats.includes(this.currentSubcategory)) {
                filtered = filtered.filter(p => p.subcategory === this.currentSubcategory);
            }
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--secondary)">No products found</p>';
            return;
        }
        
        container.innerHTML = filtered.map(product => this.createProductCard(product)).join('');
    },
    
    createProductCard(product) {
        const ratingStars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
        
        return `
            <div class="product-card" onclick="App.openProductModal(${product.id})">
                <div class="product-image">
                    <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                    <div class="product-actions">
                        <button onclick="event.stopPropagation(); App.quickAdd(${product.id})" title="Add to Cart">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button onclick="event.stopPropagation(); AI.outfitBuilder.open(); AI.outfitBuilder.selectProduct(${product.id})" title="Build Outfit">
                            <i class="fas fa-tshirt"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
                        <div class="product-rating">
                            <i class="fas fa-star"></i>
                            <span>${product.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupEventListeners() {
        // Category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                const subcategory = btn.dataset.subcategory;
                
                document.querySelectorAll(`.tab-btn[data-category="${category}"]`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentCategory = category;
                this.currentSubcategory = subcategory;
                this.renderProducts(category);
            });
        });
        
        // Cart button
        document.getElementById('cartBtn')?.addEventListener('click', () => {
            document.getElementById('cartSidebar').classList.add('active');
        });
        
        // Close cart
        document.getElementById('closeCart')?.addEventListener('click', () => {
            document.getElementById('cartSidebar').classList.remove('active');
        });
        
        // Close modals
        document.getElementById('closeModal')?.addEventListener('click', () => {
            document.getElementById('productModal').classList.remove('active');
        });
        
        document.getElementById('closeChat')?.addEventListener('click', () => {
            document.getElementById('aiChatModal').classList.remove('active');
        });
        
        document.getElementById('closeUpload')?.addEventListener('click', () => {
            document.getElementById('imageUploadModal').classList.remove('active');
        });
        
        document.getElementById('closeBuilder')?.addEventListener('click', () => {
            document.getElementById('outfitBuilderModal').classList.remove('active');
        });
        
        document.getElementById('closeSearchResults')?.addEventListener('click', () => {
            document.getElementById('searchResultsModal').classList.remove('active');
        });
        
        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Search
        const searchInput = document.getElementById('headerSearchInput');
        const searchDropdown = document.getElementById('searchDropdown');
        
        searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        searchInput?.addEventListener('focus', () => {
            if (searchInput.value) {
                searchDropdown.classList.add('active');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchDropdown?.classList.remove('active');
            }
        });
        
        // Login/Signup buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.openAuthModal('login');
        });
        
        document.getElementById('signupBtn')?.addEventListener('click', () => {
            this.openAuthModal('signup');
        });
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
        
        // Quick questions
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = question;
                    AI.chat.sendMessage();
                }
            });
        });
    },
    
    async handleSearch(query) {
        const dropdown = document.getElementById('searchDropdown');
        const suggestions = document.getElementById('searchSuggestions');
        
        if (!query || query.length < 2) {
            dropdown.classList.remove('active');
            return;
        }
        
        try {
            const results = await API.products.search(query);
            
            if (results.length === 0) {
                suggestions.innerHTML = '<p style="padding:15px;color:var(--secondary)">No results found</p>';
            } else {
                suggestions.innerHTML = results.slice(0, 8).map(p => `
                    <a onclick="App.openProductModal(${p.id})">
                        <img src="${p.image_url}" alt="${p.name}">
                        <div class="suggestion-info">
                            <h5>${p.name}</h5>
                            <p>₹${p.price.toLocaleString('en-IN')}</p>
                        </div>
                    </a>
                `).join('');
            }
            
            dropdown.classList.add('active');
        } catch (e) {
            console.error('Search error:', e);
        }
    },
    
    async openProductModal(productId) {
        try {
            const product = await API.products.getById(productId);
            const modal = document.getElementById('productModal');
            const body = document.getElementById('modalBody');
            
            body.innerHTML = `
                <div class="modal-product-image">
                    <img src="${product.image_url}" alt="${product.name}">
                </div>
                <div class="modal-product-info">
                    <h2>${product.name}</h2>
                    <p class="brand">${product.brand}</p>
                    <p class="price">₹${product.price.toLocaleString('en-IN')}</p>
                    <p class="description">${product.description}</p>
                    
                    <div class="size-selector">
                        <h4>Select Size</h4>
                        <div class="size-options">
                            ${product.sizes.map(s => `<div class="size-option" onclick="App.selectSize(this)">${s}</div>`).join('')}
                        </div>
                    </div>
                    
                    <div class="color-selector">
                        <h4>Select Color</h4>
                        <div class="color-options">
                            ${product.colors.map(c => `<div class="color-option" style="background:${this.getColorHex(c)}" onclick="App.selectColor(this)" title="${c}"></div>`).join('')}
                        </div>
                    </div>
                    
                    <div class="quantity-selector">
                        <h4>Quantity</h4>
                        <button onclick="App.changeQty(-1)">-</button>
                        <span id="modalQty">1</span>
                        <button onclick="App.changeQty(1)">+</button>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="App.addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-secondary" onclick="AI.outfitBuilder.open(); AI.outfitBuilder.selectProduct(${product.id}); document.getElementById('productModal').classList.remove('active');">
                            <i class="fas fa-tshirt"></i> Build Outfit
                        </button>
                    </div>
                </div>
            `;
            
            modal.classList.add('active');
            this.selectedProduct = product;
            this.selectedSize = product.sizes[0];
            this.selectedColor = product.colors[0];
            this.modalQty = 1;
        } catch (e) {
            console.error('Error loading product:', e);
            this.showToast('Failed to load product details', 'error');
        }
    },
    
    selectSize(el) {
        document.querySelectorAll('.size-option').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedSize = el.textContent;
    },
    
    selectColor(el) {
        document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedColor = el.title;
    },
    
    changeQty(delta) {
        this.modalQty = Math.max(1, this.modalQty + delta);
        document.getElementById('modalQty').textContent = this.modalQty;
    },
    
    async addToCart(productId) {
        try {
            const qty = this.modalQty || 1;
            const size = this.selectedSize || 'M';
            const color = this.selectedColor || 'Black';
            
            await API.cart.add(productId, qty, size, color);
            this.showToast('Added to cart!', 'success');
            
            if (typeof Cart !== 'undefined') {
                Cart.load();
            }
        } catch (e) {
            console.error('Add to cart error:', e);
            this.showToast('Failed to add to cart', 'error');
        }
    },
    
    async quickAdd(productId) {
        try {
            await API.cart.add(productId, 1, 'M', 'Black');
            this.showToast('Added to cart!', 'success');
            if (typeof Cart !== 'undefined') Cart.load();
        } catch (e) {
            this.showToast('Failed to add to cart', 'error');
        }
    },
    
    getColorHex(colorName) {
        const colors = {
            'White': '#ffffff', 'Black': '#000000', 'Navy': '#000080', 'Blue': '#0000FF',
            'Light Blue': '#ADD8E6', 'Dark Blue': '#00008B', 'Pink': '#FFC0CB', 'Red': '#FF0000',
            'Grey': '#808080', 'Silver': '#C0C0C0', 'Gold': '#FFD700', 'Brown': '#A52A2A',
            'Tan': '#D2B48C', 'Beige': '#F5F5DC', 'Burgundy': '#800020', 'Khaki': '#C3B091',
            'Olive': '#808000', 'Green': '#008000', 'Maroon': '#800000', 'Orange': '#FFA500',
            'Yellow': '#FFFF00', 'Purple': '#800080', 'Coral': '#FF7F50', 'Mint': '#98FF98',
            'Lavender': '#E6E6FA', 'Peach': '#FFDAB9', 'Emerald': '#50C878', 'Ivory': '#FFFFF0',
            'Cream': '#FFFDD0', 'Charcoal': '#36454F', 'Floral': '#FFB6C1'
        };
        return colors[colorName] || '#cccccc';
    },
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // Auth functions
    openAuthModal(mode) {
        const modal = document.getElementById('authModal') || this.createAuthModal();
        document.getElementById('authTitle').textContent = mode === 'login' ? 'Login' : 'Create Account';
        document.getElementById('authSubmitBtn').textContent = mode === 'login' ? 'Login' : 'Sign Up';
        document.getElementById('authMode').value = mode;
        document.getElementById('authSwitch').innerHTML = mode === 'login' 
            ? 'Don\'t have an account? <a onclick="App.openAuthModal(\'signup\')">Sign Up</a>'
            : 'Already have an account? <a onclick="App.openAuthModal(\'login\')">Login</a>';
        modal.classList.add('active');
    },
    
    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <button class="close-modal" onclick="document.getElementById('authModal').classList.remove('active')">
                    <i class="fas fa-times"></i>
                </button>
                <div class="auth-header">
                    <h3 id="authTitle">Login</h3>
                    <p>Welcome to StyleSai</p>
                </div>
                <form class="auth-form" onsubmit="App.handleAuth(event)">
                    <input type="hidden" id="authMode" value="login">
                    <div class="form-group" id="nameGroup" style="display:none">
                        <label>Full Name</label>
                        <input type="text" id="authName" placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="authEmail" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="authPassword" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" id="authSubmitBtn">Login</button>
                    <p class="auth-switch" id="authSwitch">
                        Don't have an account? <a onclick="App.openAuthModal('signup')">Sign Up</a>
                    </p>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Show/hide name field based on mode
        document.getElementById('authMode').addEventListener('change', (e) => {
            document.getElementById('nameGroup').style.display = e.target.value === 'signup' ? 'block' : 'none';
        });
        
        return modal;
    },
    
    handleAuth(e) {
        e.preventDefault();
        
        const mode = document.getElementById('authMode').value;
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName')?.value || email.split('@')[0];
        
        // Simple mock auth (in production, this would call an API)
        this.user = {
            email,
            name,
            token: 'mock_token_' + Date.now()
        };
        
        localStorage.setItem('stylesai_user', JSON.stringify(this.user));
        
        this.updateAuthUI();
        document.getElementById('authModal').classList.remove('active');
        
        this.showToast(mode === 'login' ? 'Welcome back!' : 'Account created successfully!', 'success');
    },
    
    logout() {
        this.user = null;
        localStorage.removeItem('stylesai_user');
        this.updateAuthUI();
        this.showToast('Logged out successfully', 'success');
    },
    
    updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        
        if (this.user) {
            if (authButtons) authButtons.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'flex';
                document.getElementById('userName').textContent = this.user.name;
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;
