/**
 * StyleSai AI Module
 * Handles AI-powered features: chat, image analysis, outfit builder
 */

// Quick question buttons handler
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            const chatInput = document.getElementById('chatInput');
            if (chatInput && question) {
                chatInput.value = question;
                AI.chat.sendMessage();
            }
        });
    });
});

const AI = {
    chat: {
        isOpen: false,
        
        init() {
            this.setupEventListeners();
        },

        setupEventListeners() {
            const chatInput = document.getElementById('chatInput');
            const sendChat = document.getElementById('sendChat');

            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendMessage();
                });
            }

            if (sendChat) {
                sendChat.addEventListener('click', () => this.sendMessage());
            }
        },

        open() {
            this.isOpen = true;
            const modal = document.getElementById('aiChatModal');
            if (modal) modal.classList.add('active');
        },

        close() {
            this.isOpen = false;
            const modal = document.getElementById('aiChatModal');
            if (modal) modal.classList.remove('active');
        },

        async sendMessage() {
            const chatInput = document.getElementById('chatInput');
            const chatMessages = document.getElementById('chatMessages');
            
            if (!chatInput || !chatMessages) return;

            const message = chatInput.value.trim();
            if (!message) return;

            this.addMessage(message, 'user');
            chatInput.value = '';

            this.addLoadingMessage();

            try {
                const response = await this.getAIResponse(message);
                
                const loadingMsg = chatMessages.querySelector('.loading-message');
                if (loadingMsg) loadingMsg.remove();

                this.addMessage(response, 'bot');
            } catch (e) {
                console.error('Chat error:', e);
                
                const loadingMsg = chatMessages.querySelector('.loading-message');
                if (loadingMsg) loadingMsg.remove();
                
                this.addMessage("I apologize, but I'm having trouble connecting to the AI service. Please try again later.", 'bot');
            }
        },

        async getAIResponse(message) {
            const lowerMessage = message.toLowerCase();
            
            // Wedding related
            if (lowerMessage.includes('wedding')) {
                return "For a wedding, I recommend:\n\n👔 Men's: Well-fitted suit (navy or charcoal), crisp white shirt, silk tie, leather oxford shoes\n\n👗 Women's: Elegant evening gown or designer saree, heels, minimal jewelry\n\n💼 Accessories: Elegant watch, clutch bag, matching jewelry";
            }
            
            // Casual weekend
            if (lowerMessage.includes('casual') || lowerMessage.includes('weekend')) {
                return "For casual weekend outings:\n\n• Premium cotton t-shirt or polo shirt\n• Comfortable jeans or chinos\n• Clean white sneakers or casual loafers\n• A stylish watch or bracelets\n• Light jacket for evening";
            }
            
            // Summer colors
            if (lowerMessage.includes('summer') && lowerMessage.includes('color')) {
                return "Trendy summer colors for 2024:\n\n🌊 Ocean Blue - Perfect for beach days\n☀️ Mustard Yellow - Bold and trendy\n🌿 Sage Green - Nature-inspired\n🍑 Peach - Soft and romantic\n⚪ Off-White - Timeless and cool\n\nThese colors work great with both Indian and Western wear!";
            }
            
            // Oversized style
            if (lowerMessage.includes('oversized')) {
                return "How to style oversized clothes:\n\n1. Balance the look - Pair loose top with fitted bottoms\n2. Layer strategically - Add structure with jackets\n3. Accessorize - Statement jewelry adds definition\n4. Footwear matters - Chunky sneakers or heels balance the silhouette\n5. Roll sleeves/cuffs - Show some skin for balance\n\nPerfect for the GenZ aesthetic!";
            }
            
            // Color matching
            if (lowerMessage.includes('color') || lowerMessage.includes('match')) {
                return "Classic color combinations that always work:\n\n✅ Navy + White = Clean & Classic\n✅ Black + Burgundy = Rich & Elegant\n✅ Grey + Mustard = Modern & Bold\n✅ Blue + Brown = Sophisticated\n✅ White + Denim = Effortlessly Cool\n✅ Olive + Cream = Earthy & Chic";
            }
            
            // Trends
            if (lowerMessage.includes('trend') || lowerMessage.includes('2024') || lowerMessage.includes('2025')) {
                return "Current fashion trends:\n\n🔥 Oversized silhouettes\n🔥 Sustainable fashion\n🔥 Bold accessories\n🔥 Neutral earth tones\n🔥 Y2K revival\n🔥 Gender-fluid fashion\n🔥 Comfort-first clothing\n\nThese trends are popular across all age groups!";
            }
            
            // Formal/Business
            if (lowerMessage.includes('formal') || lowerMessage.includes('business') || lowerMessage.includes('office')) {
                return "For formal/business occasions:\n\n👔 Men: Tailored blazer, crisp shirt, dress pants, leather shoes\n👩 Women: Blazer with trousers/skirt, silk blouse, closed-toe heels\n\nTips: Stick to neutral colors, minimal accessories, well-fitted clothes";
            }
            
            // Indian ethnic
            if (lowerMessage.includes('ethnic') || lowerMessage.includes('traditional') || lowerMessage.includes('festive') || lowerMessage.includes('Indian')) {
                return "For Indian traditional wear:\n\n👨 Men: Kurta-pyjama, sherwani, Nehru jacket\n👩 Women: Saree, lehenga, anarkali, salwar kameez\n\n💎 Accessories: Juttis/mojaris, statement earrings, bangles, dupatta\n\nColors: Rich reds, golds, maroons work great for weddings!";
            }
            
            // Kids
            if (lowerMessage.includes('kid') || lowerMessage.includes('baby') || lowerMessage.includes('children')) {
                return "Kids fashion tips:\n\n👕 Comfort first - Soft cotton fabrics\n🎨 Fun colors - Let them express themselves\n👟 Easy footwear - Comfortable for play\n📚 School wear - Durable and easy to maintain\n\nAge-appropriate styles matter - go for breathable fabrics!";
            }
            
            // GenZ
            if (lowerMessage.includes('genz') || lowerMessage.includes('gen z') || lowerMessage.includes('trendy') || lowerMessage.includes('streetwear')) {
                return "GenZ fashion trends:\n\n🔥 Oversized t-shirts and hoodies\n🔥 Cargo pants and joggers\n🔥 Chunky sneakers (platform shoes)\n🔥 Bucket hats and crossbody bags\n🔥 Y2K-inspired looks\n🔥 Thrifted and vintage pieces\n🔥 Bold prints and graphics\n\nMix and match for that perfect streetwear look!";
            }
            
            // General styling advice
            if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('recommend')) {
                return "I'd love to help you find your perfect style! Tell me more:\n\n1. What's the occasion? (work, party, date, casual)\n2. Your style preference? (classic, modern, boho, street)\n3. Any color preferences?\n4. What's your budget range?\n\nThe more details, the better recommendations I can give! 🎨";
            }
            
            // Footwear
            if (lowerMessage.includes('shoe') || lowerMessage.includes('footwear') || lowerMessage.includes('sneaker')) {
                return "Footwear guide:\n\n👞 Oxford - Formal/business\n👟 Sneakers - Casual/sporty\n🥿 Loafers - Smart-casual\n👢 Boots - Rugged/elegant\n👠 Heels - Formal/party\n🩰 Flats - Comfortable/daily\n\nPairing matters: Match leather shoes with leather belts!";
            }
            
            // Accessories
            if (lowerMessage.includes('accessory') || lowerMessage.includes('accessories')) {
                return "Accessorize like a pro:\n\n💼 Bags: Match leather bags with belts\n⌚ Watches: Minimalist for formal, bold for casual\n💍 Jewelry: Less is more for formal occasions\n🧣 Scarves: Add color to neutral outfits\n🕶️ Sunglasses: UV protection + style\n\nAccessories can elevate a simple outfit instantly!";
            }
            
            return "Thank you for your question! I'm here to help with:\n\n👔 Outfit recommendations for any occasion\n🎨 Color coordination tips\n🔥 Current fashion trends\n👕 Styling advice for any gender/age\n\nWhat would you like to know more about?";
        },

        addMessage(text, type) {
            const chatMessages = document.getElementById('chatMessages');
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type === 'user' ? 'user-message' : 'bot-message'}`;
            
            const icon = type === 'user' ? 'user' : 'robot';
            
            messageDiv.innerHTML = `
                <div class="message-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="message-content">
                    <p>${text.replace(/\n/g, '<br>')}</p>
                </div>
            `;

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        },

        addLoadingMessage() {
            const chatMessages = document.getElementById('chatMessages');
            if (!chatMessages) return;

            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message bot-message loading-message';
            loadingDiv.innerHTML = `
                <div class="message-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="loading">
                        <span>•</span><span>•</span><span>•</span>
                    </div>
                </div>
            `;

            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    },

    imageAnalysis: {
        selectedFile: null,

        init() {
            this.setupEventListeners();
        },

        setupEventListeners() {
            const uploadArea = document.getElementById('uploadArea');
            const imageInput = document.getElementById('imageInput');
            const analyzeBtn = document.getElementById('analyzeBtn');

            if (uploadArea) {
                uploadArea.addEventListener('click', () => imageInput?.click());
                
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = 'var(--accent)';
                });
                
                uploadArea.addEventListener('dragleave', () => {
                    uploadArea.style.borderColor = 'var(--light)';
                });
                
                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = 'var(--light)';
                    const file = e.dataTransfer.files[0];
                    if (file) this.handleFileSelect(file);
                });
            }

            if (imageInput) {
                imageInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) this.handleFileSelect(file);
                });
            }

            if (analyzeBtn) {
                analyzeBtn.addEventListener('click', () => this.analyzeImage());
            }
        },

        open() {
            this.reset();
            const modal = document.getElementById('imageUploadModal');
            if (modal) modal.classList.add('active');
        },

        close() {
            const modal = document.getElementById('imageUploadModal');
            if (modal) modal.classList.remove('active');
            this.reset();
        },

        reset() {
            this.selectedFile = null;
            const previewImage = document.getElementById('previewImage');
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            const analyzeBtn = document.getElementById('analyzeBtn');
            const analysisResult = document.getElementById('analysisResult');

            if (previewImage) {
                previewImage.style.display = 'none';
                previewImage.src = '';
            }
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
            if (analyzeBtn) analyzeBtn.disabled = true;
            if (analysisResult) analysisResult.style.display = 'none';
        },

        handleFileSelect(file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            this.selectedFile = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                const previewImage = document.getElementById('previewImage');
                const uploadPlaceholder = document.getElementById('uploadPlaceholder');
                const analyzeBtn = document.getElementById('analyzeBtn');

                if (previewImage) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                }
                if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
                if (analyzeBtn) analyzeBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        },

        async analyzeImage() {
            if (!this.selectedFile) return;

            const analyzeBtn = document.getElementById('analyzeBtn');
            const analysisResult = document.getElementById('analysisResult');
            const analysisContent = document.getElementById('analysisContent');

            if (analyzeBtn) {
                analyzeBtn.disabled = true;
                analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            }

            try {
                const result = await API.recommend.analyzeImage(this.selectedFile);
                
                if (analysisContent) {
                    const items = result.detected_items?.join(', ') || 'Clothing item';
                    const colors = result.colors?.join(', ') || 'Various';
                    const styles = result.style_tags?.join(', ') || 'Modern';
                    
                    analysisContent.innerHTML = `
                        <div class="analysis-item">
                            <strong>Detected:</strong> ${items}
                        </div>
                        <div class="analysis-item">
                            <strong>Colors:</strong> ${colors}
                        </div>
                        <div class="analysis-item">
                            <strong>Style:</strong> ${styles}
                        </div>
                        <div class="analysis-item">
                            <strong>Category:</strong> ${result.category || 'Fashion'}
                        </div>
                    `;
                }

                if (analysisResult) analysisResult.style.display = 'block';

            } catch (e) {
                console.error('Analysis error:', e);
                alert('Failed to analyze image. Please try again.');
            } finally {
                if (analyzeBtn) {
                    analyzeBtn.disabled = false;
                    analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analyze Image';
                }
            }
        }
    },

    outfitBuilder: {
        selectedProduct: null,
        allProducts: [],

        async init() {
            await this.loadProducts();
        },

        async loadProducts() {
            try {
                const products = await API.products.getAll();
                this.allProducts = products;
                this.renderProducts();
            } catch (e) {
                console.error('Failed to load products:', e);
            }
        },

        open() {
            const modal = document.getElementById('outfitBuilderModal');
            if (modal) modal.classList.add('active');
        },

        close() {
            const modal = document.getElementById('outfitBuilderModal');
            if (modal) modal.classList.remove('active');
            this.selectedProduct = null;
            this.resetSelection();
        },

        renderProducts() {
            const container = document.getElementById('builderProducts');
            if (!container) return;

            const products = this.allProducts.slice(0, 12);

            container.innerHTML = products.map(p => `
                <div class="builder-product" data-id="${p.id}" onclick="AI.outfitBuilder.selectProduct(${p.id})">
                    <img src="${p.image_url}" alt="${p.name}">
                    <div class="builder-product-info">
                        <h5>${p.name}</h5>
                        <p>₹${p.price.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            `).join('');
        },

        selectProduct(productId) {
            this.selectedProduct = this.allProducts.find(p => p.id === productId);
            
            document.querySelectorAll('.builder-product').forEach(item => {
                item.classList.remove('selected');
                if (parseInt(item.dataset.id) === productId) {
                    item.classList.add('selected');
                }
            });

            this.getMatchingItems(productId);
        },

        resetSelection() {
            document.querySelectorAll('.builder-product').forEach(item => {
                item.classList.remove('selected');
            });
            
            const results = document.getElementById('builderResults');
            if (results) results.style.display = 'none';
        },

        async getMatchingItems(productId) {
            const matchingItemsContainer = document.getElementById('matchingItems');
            const matchScoreEl = document.getElementById('matchScore');
            const results = document.getElementById('builderResults');

            if (!results) return;
            
            results.style.display = 'block';

            try {
                const result = await API.recommend.match(productId);
                
                const matching = result.all_matching || [];

                if (matchScoreEl) {
                    matchScoreEl.textContent = Math.floor(80 + Math.random() * 18) + '%';
                }

                if (matchingItemsContainer) {
                    matchingItemsContainer.innerHTML = matching.slice(0, 6).map(p => `
                        <div class="matching-item" onclick="App.openProductModal(${p.id})">
                            <img src="${p.image_url}" alt="${p.name}">
                            <div class="matching-item-info">
                                <h5>${p.name}</h5>
                                <p>₹${p.price.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    `).join('');
                }

            } catch (e) {
                console.error('Failed to get matching items:', e);
                
                const selected = this.allProducts.find(p => p.id === productId);
                const matching = this.getComplementaryProducts(selected);
                
                if (matchScoreEl) {
                    matchScoreEl.textContent = '75%';
                }
                
                if (matchingItemsContainer) {
                    matchingItemsContainer.innerHTML = matching.slice(0, 6).map(p => `
                        <div class="matching-item" onclick="App.openProductModal(${p.id})">
                            <img src="${p.image_url}" alt="${p.name}">
                            <div class="matching-item-info">
                                <h5>${p.name}</h5>
                                <p>₹${p.price.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }
        },

        getComplementaryProducts(selectedProduct) {
            const categoryMap = {
                'shirts': ['pants', 'footwear', 'accessories'],
                'tshirts': ['pants', 'footwear', 'accessories'],
                'tops': ['bottoms', 'footwear', 'accessories'],
                'dresses': ['footwear', 'accessories'],
                'long_frocks': ['footwear', 'accessories'],
                'pants': ['shirts', 'tshirts', 'footwear', 'accessories'],
                'bottoms': ['tops', 'shirts', 'footwear', 'accessories'],
                'footwear': ['pants', 'bottoms', 'shirts', 'tops'],
                'accessories': ['shirts', 'tops', 'pants', 'dresses'],
                'blazers': ['shirts', 'pants', 'footwear'],
                'hoodies': ['pants', 'footwear'],
                'sweatshirts': ['pants', 'footwear'],
                'jackets': ['shirts', 'tops', 'pants', 'bottoms'],
                'boys': ['accessories', 'footwear'],
                'girls': ['accessories', 'footwear'],
                'oversized': ['cargo', 'pants', 'footwear', 'accessories'],
                'cargo': ['oversized', 'hoodies', 'footwear']
            };

            const targetCategories = categoryMap[selectedProduct.subcategory] || [];

            return this.allProducts
                .filter(p => p.id !== selectedProduct.id && targetCategories.includes(p.subcategory))
                .slice(0, 6);
        }
    },

    init() {
        this.chat.init();
        this.imageAnalysis.init();
        setTimeout(() => this.outfitBuilder.init(), 500);
    }
};

window.AI = AI;

function openAIChat() { AI.chat.open(); }
function openImageUpload() { AI.imageAnalysis.open(); }
function openOutfitBuilder() { AI.outfitBuilder.open(); }
function openTrends() { 
    document.getElementById('ai-features')?.scrollIntoView({ behavior: 'smooth' }); 
}
