// QR Menu JavaScript
class QRMenu {
    constructor() {
        this.apiUrl = 'https://script.google.com/macros/s/AKfycbyeNom3iTnZ-1YwVFalozrt6bAw487sy5eifmiuMbXIesULfeErYBNk97WzsZiltf2EJg/exec';
        this.categories = [
            'Hot Drinks', 'Cold Drinks', 'Frappe', 'Refresher', 
            'Smoothies', 'Mojito', 'Soft Drinks', 'Milk Shake', 
            'Dessert', 'Food', 'Hookah'
        ];
        this.currentCategory = this.categories[0];
        this.currentSlide = 0;
        this.menuData = [];
        this.cart = [];
        this.isAnimating = false;
        this.currentTableNumber = null;
        
        this.init();
    }

    async init() {
        this.checkTableNumber();
        this.setupEventListeners();
        this.setupQuickRequest();
        this.showLoading();
        await this.loadMenuData();
        this.create3DCarousel();
        this.createCategoryNavigation();
        this.loadMenuItems();
        this.setupCart();
        this.hideLoading();
    }

    // Table number management
    checkTableNumber() {
        const savedTableNumber = localStorage.getItem('tableNumber');
        if (savedTableNumber) {
            this.currentTableNumber = parseInt(savedTableNumber);
            this.updateTableNumberDisplay();
        } else {
            // Show table number modal on first visit
            setTimeout(() => {
                this.showTableNumberModal();
            }, 1000);
        }
    }

    showTableNumberModal() {
        const modal = new bootstrap.Modal(document.getElementById('tableNumberModal'));
        modal.show();
    }

    setTableNumber() {
        const tableInput = document.getElementById('tableNumberInput');
        const tableNumber = parseInt(tableInput.value);
        
        if (tableNumber && tableNumber >= 1 && tableNumber <= 100) {
            this.currentTableNumber = tableNumber;
            localStorage.setItem('tableNumber', tableNumber);
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('tableNumberModal'));
            modal.hide();
            
            // Update UI to show table number
            this.updateTableNumberDisplay();
            
            // Show success message
            this.showNotification(`Welcome to Table ${tableNumber}!`, 'success');
        } else {
            this.showNotification('Please enter a valid table number (1-100)', 'error');
        }
    }

    updateTableNumberDisplay() {
        if (this.currentTableNumber) {
            // Update header to show table number
            const header = document.querySelector('header h1');
            header.innerHTML = `🍽️ Our Menu - Table ${this.currentTableNumber}`;
        }
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-toggle')) {
                this.toggleCart();
            }
        });

        // Category navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.switchCategory(e.target.dataset.category);
            }
        });

        // Add to cart
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const itemId = e.target.dataset.itemId;
                this.addToCart(itemId);
            }
        });

        // Size selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('size-btn')) {
                const card = e.target.closest('.menu-item-card');
                card.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update price
                const price = e.target.dataset.price;
                const priceElement = card.querySelector('.menu-item-price');
                priceElement.textContent = `$${price}`;
            }
        });
    }

    createCategoryNavigation() {
        const navContainer = document.getElementById('category-navigation');
        navContainer.innerHTML = this.categories.map(category => 
            `<button class="category-btn ${category === this.currentCategory ? 'active' : ''}" 
                     data-category="${category}">${category}</button>`
        ).join('');
    }

    createCartUI() {
        const cartHTML = `
            <button class="cart-toggle">
                🛒
                <span class="cart-badge" id="cart-count">0</span>
            </button>
            <div class="cart-container" id="cart-container">
                <h5>Your Order</h5>
                <div id="cart-items"></div>
                <div class="cart-total">
                    <strong>Total: $<span id="cart-total">0.00</span></strong>
                </div>
                <button class="btn btn-primary w-100 mt-3" onclick="qrMenu.checkout()">
                    Place Order
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    async loadMenuData() {
        this.showLoading();
        try {
            // For demo purposes, we'll use sample data
            // In production, uncomment the API call below
             const response = await fetch(`${this.apiUrl}?action=getMenu`);
             const data = await response.json();
             this.menuData = data.success ? data.data : [];
            
            // Sample data for demonstration
            this.menuData = this.generateSampleData();
            
        } catch (error) {
            console.error('Error loading menu data:', error);
            this.menuData = this.generateSampleData();
        }
        this.hideLoading();
    }

    generateSampleData() {
        const sampleItems = [];
        const categories = this.categories;
        
        categories.forEach((category, categoryIndex) => {
            for (let i = 1; i <= 5; i++) {
                sampleItems.push({
                    id: `${categoryIndex + 1}_${i}`,
                    category: category,
                    name: `${category} Item ${i}`,
                    description: `Delicious ${category.toLowerCase()} item with amazing flavors`,
                    ingredients: 'Premium ingredients, Fresh herbs, Special blend',
                    price: (Math.random() * 10 + 3).toFixed(2),
                    sizes: JSON.stringify({
                        'Small': (Math.random() * 5 + 3).toFixed(2),
                        'Medium': (Math.random() * 7 + 5).toFixed(2),
                        'Large': (Math.random() * 10 + 7).toFixed(2)
                    }),
                    image: `https://picsum.photos/300/200?random=${categoryIndex * 5 + i}`,
                    available: true
                });
            }
        });
        
        return sampleItems;
    }

    create3DCarousel() {
        const container = document.getElementById('menu-categories');
        const carouselHTML = `
            <div class="carousel-3d">
                <div class="carousel-3d-container" id="carousel-container">
                    ${this.categories.map((category, index) => `
                        <div class="category-card" data-category="${category}" 
                             style="transform: rotateY(${index * (360 / this.categories.length)}deg) translateZ(400px);">
                            <img src="https://picsum.photos/300/200?random=${index + 100}" alt="${category}">
                            <div class="category-card-content">
                                <h3>${category}</h3>
                                <p>Explore our ${category.toLowerCase()} selection</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="carousel-nav prev" onclick="qrMenu.rotateCarousel(-1)">‹</button>
                <button class="carousel-nav next" onclick="qrMenu.rotateCarousel(1)">›</button>
            </div>
        `;
        
        container.innerHTML = carouselHTML;
        this.updateCarouselRotation();
        
        // Add click handlers to category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.switchCategory(category);
            });
        });
    }

    rotateCarousel(direction) {
        this.currentSlide += direction;
        if (this.currentSlide >= this.categories.length) {
            this.currentSlide = 0;
        } else if (this.currentSlide < 0) {
            this.currentSlide = this.categories.length - 1;
        }
        this.updateCarouselRotation();
    }

    updateCarouselRotation() {
        const container = document.getElementById('carousel-container');
        const rotation = -(this.currentSlide * (360 / this.categories.length));
        container.style.transform = `rotateY(${rotation}deg)`;
    }

    switchCategory(category) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.currentCategory = category;
        
        // Add exit animation to current items
        const currentItems = document.querySelectorAll('.menu-item-card');
        currentItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInFromLeft 0.3s ease-out reverse';
                item.style.opacity = '0';
            }, index * 50);
        });
        
        // Update navigation with smooth transition
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
            if (btn.dataset.category === category) {
                btn.style.animation = 'pulse 0.5s ease-in-out';
            }
        });
        
        // Update carousel with enhanced transition
        const categoryIndex = this.categories.indexOf(category);
        this.currentSlide = categoryIndex;
        
        const container = document.querySelector('.carousel-3d-container');
        container.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        this.updateCarouselRotation();
        
        // Load new items with staggered entrance animation
        setTimeout(() => {
            this.loadMenuItems();
            
            // Add entrance animation to new items
            setTimeout(() => {
                const newItems = document.querySelectorAll('.menu-item-card');
                newItems.forEach((item, index) => {
                    item.style.animation = `slideInFromBottom 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`;
                    item.style.opacity = '1';
                });
                
                this.isAnimating = false;
            }, 100);
        }, 400);
    }

    loadMenuItems() {
        const container = document.getElementById('menu-items');
        const categoryItems = this.menuData.filter(item => item.category === this.currentCategory);
        
        if (categoryItems.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No items available in this category.</p></div>';
            return;
        }

        const itemsHTML = `
            <div class="col-12">
                <div class="menu-items-container fade-in">
                    <h2 class="text-center mb-4">${this.currentCategory}</h2>
                    <div class="row">
                        ${categoryItems.map(item => this.createMenuItemCard(item)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = itemsHTML;
    }

    createMenuItemCard(item) {
        const sizes = item.sizes ? JSON.parse(item.sizes) : null;
        const basePrice = sizes ? Object.values(sizes)[0] : item.price;
        
        return `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                <div class="menu-item-card">
                    <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                    <div class="menu-item-content">
                        <h4 class="menu-item-title">${item.name}</h4>
                        <p class="menu-item-description">${item.description}</p>
                        <p class="menu-item-ingredients">${item.ingredients}</p>
                        <div class="menu-item-price">$${basePrice}</div>
                        ${sizes ? `
                            <div class="size-options">
                                ${Object.entries(sizes).map(([size, price], index) => `
                                    <button class="size-btn ${index === 0 ? 'active' : ''}" 
                                            data-price="${price}">${size} - $${price}</button>
                                `).join('')}
                            </div>
                        ` : ''}
                        <button class="add-to-cart-btn" data-item-id="${item.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addToCart(itemId) {
        const item = this.menuData.find(i => i.id === itemId);
        if (!item) return;

        const card = document.querySelector(`[data-item-id="${itemId}"]`).closest('.menu-item-card');
        const activeSize = card.querySelector('.size-btn.active');
        const price = activeSize ? activeSize.dataset.price : item.price;
        const size = activeSize ? activeSize.textContent.split(' - ')[0] : 'Regular';

        const cartItem = {
            id: itemId,
            name: item.name,
            price: parseFloat(price),
            size: size,
            quantity: 1
        };

        // Check if item already exists in cart
        const existingItem = this.cart.find(i => i.id === itemId && i.size === size);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push(cartItem);
        }

        this.updateCartUI();
        this.showAddedToCartAnimation(card);
    }

    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (!cartCount || !cartItems || !cartTotal) {
            console.error('Cart UI elements are missing. Ensure the cart UI is properly initialized.');
            return;
        }

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        cartCount.textContent = totalItems;
        cartTotal.textContent = totalPrice.toFixed(2);

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item d-flex justify-content-between align-items-center mb-2">
                <div>
                    <small>${item.name} (${item.size})</small>
                    <br>
                    <small>$${item.price} x ${item.quantity}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="qrMenu.removeFromCart('${item.id}', '${item.size}')">
                    ×
                </button>
            </div>
        `).join('');
    }

    removeFromCart(itemId, size) {
        this.cart = this.cart.filter(item => !(item.id === itemId && item.size === size));
        this.updateCartUI();
    }

    toggleCart() {
        const cartContainer = document.getElementById('cart-container');
        cartContainer.classList.toggle('open');
    }

    showAddedToCartAnimation(card) {
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 0 20px rgba(46, 204, 113, 0.5)';
        
        setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '';
        }, 300);
    }

    async placeOrder() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        if (!this.currentTableNumber) {
            this.showTableNumberModal();
            return;
        }

        const orderData = {
            tableNumber: this.currentTableNumber,
            items: this.cart,
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString(),
            customerNotes: ''
        };

        try {
            // For demo purposes, we'll simulate the order
            // In production, uncomment the API call below
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=addOrder&data=${encodeURIComponent(JSON.stringify(orderData))}`
            });
            const result = await response.json();
            
            
            // Simulated response
            /*
            const result = {
                success: true,
                orderId: 'ORD' + Date.now(),
                tableNumber: this.currentTableNumber
            };
            */
            if (result.success) {
                this.showOrderConfirmation(result.orderId, result.tableNumber);
                
                // Send notification to cash register
                this.sendOrderNotification(orderData);
                
                this.cart = [];
                this.updateCartUI();
                this.toggleCart();
            } else {
                alert('Error placing order. Please try again.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        }
    }

    sendOrderNotification(orderData) {
        // Send notification to cash register system
        if (window.parent && window.parent.notificationSystem) {
            window.parent.notificationSystem.showNotification(orderData, 'order');
        }
        
        // Also try to send via postMessage for iframe scenarios
        window.postMessage({
            type: 'new_order',
            data: orderData
        }, '*');
    }

    showOrderConfirmation(orderId, tableNumber) {
        const modalHTML = `
            <div class="modal fade" id="orderModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Order Confirmed!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center">
                                <div class="table-number">
                                    Table ${tableNumber}
                                </div>
                                <p>Your order has been placed successfully!</p>
                                <p><strong>Order ID:</strong> ${orderId}</p>
                                <p>Please take a seat at table ${tableNumber}. Your order will be prepared shortly.</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        modal.show();
        
        // Remove modal from DOM after it's hidden
        document.getElementById('orderModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    showLoading() {
        this.isLoading = true;
        const container = document.getElementById('menu-items');
        container.innerHTML = `
            <div class="col-12">
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            </div>
        `;
    }

    hideLoading() {
        this.isLoading = false;
    }

    // Quick Request functionality
    setupQuickRequest() {
        const quickRequestBtn = document.getElementById('quick-request-btn');
        const quickRequestModal = new bootstrap.Modal(document.getElementById('quickRequestModal'));
        const quickRequestConfirmModal = new bootstrap.Modal(document.getElementById('quickRequestConfirmModal'));

        quickRequestBtn.addEventListener('click', () => {
            quickRequestModal.show();
        });

        document.querySelectorAll('.quick-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestItem = e.target.dataset.item;
                this.sendQuickRequest(requestItem);
                quickRequestModal.hide();
                this.showQuickRequestConfirmation(requestItem);
            });
        });

        document.getElementById('send-custom-request').addEventListener('click', () => {
            const customText = document.getElementById('custom-request-text').value.trim();
            if (customText) {
                this.sendQuickRequest(customText);
                quickRequestModal.hide();
                this.showQuickRequestConfirmation(customText);
                document.getElementById('custom-request-text').value = '';
            } else {
                alert('Please enter your custom request.');
            }
        });
    }
    
    async sendQuickRequest(requestText) {
        if (!this.currentTableNumber) {
            this.showTableNumberModal();
            return;
        }

        const requestData = {
            tableNumber: this.currentTableNumber,
            request: requestText,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.apiUrl}?action=addQuickRequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error('Failed to send request');
            }

            console.log('Quick Request Sent:', requestData);
            this.notifyCashRegister('quick_request', requestData);
        } catch (error) {
            console.error('Error sending quick request:', error);
            alert('Failed to send request. Please try again.');
        }
    }
    
    showQuickRequestConfirmation(requestText) {
        document.getElementById('sent-request-text').textContent = requestText;
        const confirmModal = new bootstrap.Modal(document.getElementById('quickRequestConfirmModal'));

        setTimeout(() => {
            const modalContent = document.querySelector('#quickRequestConfirmModal .modal-content');
            modalContent.classList.add('success-animation');
        }, 100);

        confirmModal.show();

        setTimeout(() => {
            confirmModal.hide();
        }, 3000);
    }

    getTableNumber() {
        let tableNumber = localStorage.getItem('tableNumber');
        if (!tableNumber) {
            tableNumber = Math.floor(Math.random() * 50) + 1;
            localStorage.setItem('tableNumber', tableNumber);
        }
        return tableNumber;
    }

    notifyCashRegister(type, data) {
        const notification = {
            type: type,
            data: data,
            timestamp: new Date().toISOString()
        };

        console.log('Notification sent to cash register:', notification);
    }

    setupCart() {
        // Ensure the cart UI is created
        this.createCartUI();

        // Initialize cart-related event listeners
        const cartToggle = document.querySelector('.cart-toggle');
        const cartContainer = document.getElementById('cart-container');

        if (cartToggle && cartContainer) {
            cartToggle.addEventListener('click', () => {
                cartContainer.classList.toggle('open');
            });
        }
    }
}


// Global functions for table number modal
function setTableNumber() {
    if (window.qrMenu) {
        window.qrMenu.setTableNumber();
    }
}

// Initialize the QR Menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qrMenu = new QRMenu();
});

// Auto-rotate carousel every 5 seconds
setInterval(() => {
    if (qrMenu && !qrMenu.isLoading) {
        qrMenu.rotateCarousel(1);
    }
}, 5000);

