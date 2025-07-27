// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.apiUrl = 'https://script.google.com/macros/s/AKfycbyHkAU-eedRJtC1dYqnEm6tGUkqfhDNCHTDnCeuLoh565M1lreCoC96FIIXfrA39_Qr9A/exec';
        this.menuData = [];
        this.ordersData = [];
        this.currentSection = 'dashboard';
        this.charts = {};
        
        // Cloudinary configuration
        this.cloudinaryConfig = {
            cloudName: 'dezvuqqrl',
            uploadPreset: 'unsigned_preset'
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadDashboard();
        await this.loadMenuData();
        await this.loadOrdersData();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Header actions
        document.getElementById('sync-data').addEventListener('click', () => {
            this.syncData();
        });

        document.getElementById('add-item').addEventListener('click', () => {
            this.showItemModal();
        });

        // Filters
        document.getElementById('category-filter').addEventListener('change', () => {
            this.filterMenuItems();
        });

        document.getElementById('search-items').addEventListener('input', () => {
            this.filterMenuItems();
        });

        document.getElementById('availability-filter').addEventListener('change', () => {
            this.filterMenuItems();
        });

        document.getElementById('order-status-filter').addEventListener('change', () => {
            this.filterOrders();
        });

        document.getElementById('order-date-filter').addEventListener('change', () => {
            this.filterOrders();
        });

        document.getElementById('search-orders').addEventListener('input', () => {
            this.filterOrders();
        });

        // Forms
        document.getElementById('restaurant-settings').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRestaurantSettings();
        });

        document.getElementById('system-settings').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemSettings();
        });

        // Cloudinary image upload
        document.getElementById('upload-image-btn').addEventListener('click', () => {
            this.openCloudinaryUpload();
        });

        // Image URL preview
        document.getElementById('item-image').addEventListener('input', (e) => {
            this.previewImage(e.target.value);
        });
    }

    switchSection(section) {
        // Update sidebar
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'menu-management': 'Menu Management',
            'orders': 'Orders',
            'analytics': 'Analytics',
            'settings': 'Settings'
        };
        document.getElementById('page-title').textContent = titles[section];

        this.currentSection = section;

        // Load section-specific data
        switch(section) {
            case 'menu-management':
                this.loadMenuManagement();
                break;
            case 'orders':
                this.loadOrdersManagement();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    async loadMenuData() {
        try {
            // For demo purposes, we'll use sample data
            // In production, uncomment the API call below
            
            const response = await fetch(`${this.apiUrl}?action=getMenu`);
            const data = await response.json();
            this.menuData = data.success ? data.data : [];
            
            
            // Sample data for demonstration
            // this.menuData = this.generateSampleMenuData();
            
        } catch (error) {
            console.error('Error loading menu data:', error);
            // this.menuData = this.generateSampleMenuData();
        }
    }

    async loadOrdersData() {
        try {
            // For demo purposes, we'll use sample data
            // In production, uncomment the API call below
            
            const response = await fetch(`${this.apiUrl}?action=getOrders`);
            const data = await response.json();
            this.ordersData = data.success ? data.data : [];
            
            
            // Sample data for demonstration
            // this.ordersData = this.generateSampleOrdersData();
            
        } catch (error) {
            console.error('Error loading orders data:', error);
            // this.ordersData = this.generateSampleOrdersData();
        }
    }

    generateSampleMenuData() {
        const categories = [
            'Hot Drinks', 'Cold Drinks', 'Frappe', 'Refresher', 
            'Smoothies', 'Mojito', 'Soft Drinks', 'Milk Shake', 
            'Dessert', 'Food', 'Hookah'
        ];
        
        // const sampleItems = [];
        // categories.forEach((category, categoryIndex) => {
        //     for (let i = 1; i <= 5; i++) {
        //         sampleItems.push({
        //             id: `${categoryIndex + 1}_${i}`,
        //             category: category,
        //             name: `${category} Item ${i}`,
        //             description: `Delicious ${category.toLowerCase()} item with amazing flavors`,
        //             ingredients: 'Premium ingredients, Fresh herbs, Special blend',
        //             price: (Math.random() * 10 + 3).toFixed(2),
        //             sizes: JSON.stringify({
        //                 'Small': (Math.random() * 5 + 3).toFixed(2),
        //                 'Medium': (Math.random() * 7 + 5).toFixed(2),
        //                 'Large': (Math.random() * 10 + 7).toFixed(2)
        //             }),
        //             image: `https://picsum.photos/300/200?random=${categoryIndex * 5 + i}`,
        //             available: Math.random() > 0.1 // 90% available
        //         });
        //     }
        // });
        
        // return sampleItems;
    }

    generateSampleOrdersData() {
        const orders = [];
        const statuses = ['pending', 'processing', 'ready', 'completed'];
        
        for (let i = 1; i <= 20; i++) {
            const orderDate = new Date();
            orderDate.setHours(orderDate.getHours() - Math.floor(Math.random() * 24));
            
            orders.push({
                orderId: `ORD${Date.now() - i * 1000}`,
                tableNumber: Math.floor(Math.random() * 50) + 1,
                items: JSON.stringify([
                    { name: 'Hot Drinks Item 1', quantity: 2, price: 6.74 },
                    { name: 'Cold Drinks Item 2', quantity: 1, price: 8.50 }
                ]),
                total: (Math.random() * 50 + 10).toFixed(2),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                timestamp: orderDate.toISOString(),
                notes: i % 3 === 0 ? 'Extra hot please' : ''
            });
        }
        
        return orders;
    }

    loadDashboard() {
        this.updateRecentOrders();
    }

    updateStatistics() {
        // Total menu items
        document.getElementById('total-items').textContent = this.menuData.length;

        // Orders today
        const today = new Date().toDateString();
        const todayOrders = this.ordersData.filter(order => 
            new Date(order.timestamp).toDateString() === today
        );
        document.getElementById('total-orders-today').textContent = todayOrders.length;

        // Revenue today
        const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        document.getElementById('revenue-today').textContent = `$${todayRevenue.toFixed(2)}`;

        // Popular category
        const categoryCount = {};
        this.menuData.forEach(item => {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });
        const popularCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b, '-'
        );
        document.getElementById('popular-category').textContent = popularCategory;
    }

    updateRecentOrders() {
        const recentOrders = this.ordersData
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        const container = document.getElementById('recent-orders');
        
        if (recentOrders.length === 0) {
            container.innerHTML = '<div class="text-center text-muted">No recent orders</div>';
            return;
        }

        container.innerHTML = recentOrders.map(order => {
            const orderTime = new Date(order.timestamp).toLocaleTimeString();
            return `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <strong>${order.orderId}</strong> - Table ${order.tableNumber}
                        <br>
                        <small class="text-muted">${orderTime}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-${this.getStatusColor(order.status)}">${order.status}</span>
                        <br>
                        <strong>$${order.total}</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'processing': 'info',
            'ready': 'success',
            'completed': 'secondary'
        };
        return colors[status] || 'secondary';
    }

    loadMenuManagement() {
        this.renderMenuItems();
    }

    renderMenuItems(items = this.menuData) {
        const container = document.getElementById('menu-items-grid');
        
        if (items.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No items found</div>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="menu-item-card">
                <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                <div class="menu-item-content">
                    <div class="menu-item-category">${item.category}</div>
                    <h5 class="menu-item-title">${item.name}</h5>
                    <p class="menu-item-description">${item.description}</p>
                    <div class="menu-item-price">$${item.price}</div>
                    <div class="menu-item-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="adminPanel.editItem('${item.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-outline-${item.available ? 'warning' : 'success'} btn-sm" 
                                onclick="adminPanel.toggleAvailability('${item.id}')">
                            ${item.available ? '🚫 Disable' : '✅ Enable'}
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="adminPanel.deleteItem('${item.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterMenuItems() {
        const category = document.getElementById('category-filter').value;
        const search = document.getElementById('search-items').value.toLowerCase();
        const availability = document.getElementById('availability-filter').value;

        let filtered = this.menuData;

        if (category) {
            filtered = filtered.filter(item => item.category === category);
        }

        if (search) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search)
            );
        }

        if (availability !== '') {
            const isAvailable = availability === 'true';
            filtered = filtered.filter(item => item.available === isAvailable);
        }

        this.renderMenuItems(filtered);
    }

    loadOrdersManagement() {
        this.renderOrders();
    }

    renderOrders(orders = this.ordersData) {
        const container = document.getElementById('orders-list');
        
        if (orders.length === 0) {
            container.innerHTML = '<div class="text-center text-muted">No orders found</div>';
            return;
        }

        container.innerHTML = orders.map(order => {
            const items = JSON.parse(order.items);
            const orderTime = new Date(order.timestamp).toLocaleString();
            
            return `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-id">${order.orderId}</div>
                            <small class="text-muted">Table ${order.tableNumber} • ${orderTime}</small>
                        </div>
                        <span class="order-status ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <div class="order-items">
                            ${items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                            ${order.notes ? `<br><em>Note: ${order.notes}</em>` : ''}
                        </div>
                        <div class="order-total">$${order.total}</div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="adminPanel.updateOrderStatus('${order.orderId}', 'processing')">
                            Process
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="adminPanel.updateOrderStatus('${order.orderId}', 'ready')">
                            Ready
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="adminPanel.updateOrderStatus('${order.orderId}', 'completed')">
                            Complete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterOrders() {
        const status = document.getElementById('order-status-filter').value;
        const date = document.getElementById('order-date-filter').value;
        const search = document.getElementById('search-orders').value.toLowerCase();

        let filtered = this.ordersData;

        if (status) {
            filtered = filtered.filter(order => order.status === status);
        }

        if (date) {
            filtered = filtered.filter(order => 
                new Date(order.timestamp).toDateString() === new Date(date).toDateString()
            );
        }

        if (search) {
            filtered = filtered.filter(order => 
                order.orderId.toLowerCase().includes(search) ||
                order.tableNumber.toString().includes(search)
            );
        }

        this.renderOrders(filtered);
    }

    loadAnalytics() {
        this.createCategoryChart();
        this.createRevenueChart();
    }

    createCategoryChart() {
        const ctx = document.getElementById('category-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.categoryChart) {
            this.charts.categoryChart.destroy();
        }

        const categoryData = {};
        this.menuData.forEach(item => {
            categoryData[item.category] = (categoryData[item.category] || 0) + 1;
        });

        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#3498db', '#e74c3c', '#f39c12', '#27ae60',
                        '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
                        '#2ecc71', '#f1c40f', '#8e44ad'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.revenueChart) {
            this.charts.revenueChart.destroy();
        }

        // Generate last 7 days data
        const last7Days = [];
        const revenueData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toLocaleDateString());
            
            const dayRevenue = this.ordersData
                .filter(order => new Date(order.timestamp).toDateString() === date.toDateString())
                .reduce((sum, order) => sum + parseFloat(order.total), 0);
            
            revenueData.push(dayRevenue);
        }

        this.charts.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    showItemModal(item = null) {
        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        const title = document.getElementById('itemModalTitle');
        
        if (item) {
            title.textContent = 'Edit Item';
            this.populateItemForm(item);
        } else {
            title.textContent = 'Add New Item';
            this.clearItemForm();
        }
        
        modal.show();
    }

    populateItemForm(item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-description').value = item.description;
        document.getElementById('item-ingredients').value = item.ingredients;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-image').value = item.image;
        document.getElementById('item-sizes').value = item.sizes;
        document.getElementById('item-available').checked = item.available;
        
        // Show image preview if image URL exists
        if (item.image) {
            this.previewImage(item.image);
        }
    }

    clearItemForm() {
        document.getElementById('item-form').reset();
        document.getElementById('item-id').value = '';
        document.getElementById('item-available').checked = true;
        
        // Hide image preview
        document.getElementById('image-preview').style.display = 'none';
    }

    async saveItem() {
        const formData = {
            id: document.getElementById('item-id').value || Date.now().toString(),
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            description: document.getElementById('item-description').value,
            ingredients: document.getElementById('item-ingredients').value,
            price: document.getElementById('item-price').value,
            image: document.getElementById('item-image').value,
            sizes: document.getElementById('item-sizes').value,
            available: document.getElementById('item-available').checked
        };

        try {
            // Validate form
            if (!formData.name || !formData.category || !formData.price) {
                alert('Please fill in all required fields');
                return;
            }

            // Update local data
            const existingIndex = this.menuData.findIndex(item => item.id === formData.id);
            if (existingIndex >= 0) {
                this.menuData[existingIndex] = formData;
            } else {
                this.menuData.push(formData);
            }

            // In production, sync with Google Sheets
            await this.syncMenuToSheets();

            // Close modal and refresh view
            bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
            this.renderMenuItems();
            this.updateStatistics();

            alert('Item saved successfully!');

        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item. Please try again.');
        }
    }

    editItem(itemId) {
        const item = this.menuData.find(item => item.id === itemId);
        if (item) {
            this.showItemModal(item);
        }
    }

    async toggleAvailability(itemId) {
        const item = this.menuData.find(item => item.id === itemId);
        if (item) {
            item.available = !item.available;
            this.renderMenuItems();
            
            // In production, sync with Google Sheets
            await this.syncMenuToSheets();
        }
    }

    async deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.menuData = this.menuData.filter(item => item.id !== itemId);
            this.renderMenuItems();
            this.updateStatistics();
            
            // In production, sync with Google Sheets
            await this.syncMenuToSheets();
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        const order = this.ordersData.find(order => order.orderId === orderId);
        if (order) {
            order.status = newStatus;
            this.renderOrders();
            
            // In production, sync with Google Sheets
            await this.syncOrderToSheets(order);
        }
    }

    async syncData() {
        const button = document.getElementById('sync-data');
        const originalText = button.innerHTML;
        
        button.innerHTML = '🔄 Syncing...';
        button.disabled = true;

        try {
            await this.loadMenuData();
            await this.loadOrdersData();
            this.updateStatistics();
            
            if (this.currentSection === 'menu-management') {
                this.renderMenuItems();
            } else if (this.currentSection === 'orders') {
                this.renderOrders();
            }

            alert('Data synced successfully!');

        } catch (error) {
            console.error('Error syncing data:', error);
            alert('Error syncing data. Please try again.');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    refreshOrders() {
        this.loadOrdersData().then(() => {
            this.renderOrders();
            this.updateStatistics();
        });
    }

    saveRestaurantSettings() {
        const settings = {
            name: document.getElementById('restaurant-name').value,
            contact: document.getElementById('contact-number').value,
            address: document.getElementById('address').value,
            hours: document.getElementById('operating-hours').value
        };

        localStorage.setItem('restaurantSettings', JSON.stringify(settings));
        alert('Restaurant settings saved successfully!');
    }

    saveSystemSettings() {
        const settings = {
            sheetsId: document.getElementById('sheets-id').value,
            scriptUrl: document.getElementById('script-url').value,
            autoSync: document.getElementById('auto-sync').checked,
            notifications: document.getElementById('notifications-enabled').checked
        };

        localStorage.setItem('systemSettings', JSON.stringify(settings));
        
        // Update API URL if provided
        if (settings.scriptUrl) {
            this.apiUrl = settings.scriptUrl;
        }

        alert('System configuration saved successfully!');
    }

    // Utility functions
    exportMenu() {
        const dataStr = JSON.stringify(this.menuData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'menu-export.json';
        link.click();
    }

    importMenu() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        this.menuData = importedData;
                        this.renderMenuItems();
                        this.updateStatistics();
                        alert('Menu imported successfully!');
                    } catch (error) {
                        alert('Error importing menu. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    backupData() {
        const backup = {
            menu: this.menuData,
            orders: this.ordersData,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    generateQR() {
        const menuUrl = window.location.origin + '/index.html';
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
        
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="modal fade" id="qrModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">QR Code for Menu</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <img src="${qrUrl}" alt="QR Code" class="img-fluid">
                            <p class="mt-3">Scan this QR code to access the menu</p>
                            <p><small>${menuUrl}</small></p>
                        </div>
                        <div class="modal-footer">
                            <a href="${qrUrl}" download="menu-qr-code.png" class="btn btn-primary">Download QR Code</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
        qrModal.show();
        
        // Remove modal from DOM after it's hidden
        document.getElementById('qrModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Cloudinary Upload Methods
    openCloudinaryUpload() {
        if (typeof cloudinary === 'undefined') {
            alert('Cloudinary widget is not loaded. Please refresh the page and try again.');
            return;
        }

        const widget = cloudinary.createUploadWidget({
            cloudName: this.cloudinaryConfig.cloudName,
            uploadPreset: this.cloudinaryConfig.uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxFileSize: 10000000, // 10MB
            maxImageWidth: 2000,
            maxImageHeight: 2000,
            cropping: true,
            croppingAspectRatio: 4/3,
            showSkipCropButton: false,
            croppingDefaultSelectionRatio: 1,
            folder: 'qr-menu-items',
            publicId: `menu-item-${Date.now()}`,
            tags: ['menu-item', 'qr-menu'],
            context: {
                caption: 'Menu item image',
                alt: 'Menu item'
            },
            styles: {
                palette: {
                    window: "#FFFFFF",
                    windowBorder: "#90A0B3",
                    tabIcon: "#3498db",
                    menuIcons: "#5A616A",
                    textDark: "#000000",
                    textLight: "#FFFFFF",
                    link: "#3498db",
                    action: "#FF620C",
                    inactiveTabIcon: "#0E2F5A",
                    error: "#F44235",
                    inProgress: "#0078FF",
                    complete: "#20B832",
                    sourceBg: "#E4EBF1"
                }
            }
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Upload successful:', result.info);
                this.handleUploadSuccess(result.info);
            } else if (error) {
                console.error('Upload error:', error);
                alert('Upload failed. Please try again.');
            }
        });

        widget.open();
    }

    handleUploadSuccess(uploadInfo) {
        const imageUrl = uploadInfo.secure_url;
        const imageUrlField = document.getElementById('item-image');
        
        // Set the URL in the input field
        imageUrlField.value = imageUrl;
        
        // Show preview
        this.previewImage(imageUrl);
        
        // Show success message
        this.showUploadSuccess(uploadInfo);
    }

    previewImage(imageUrl) {
        const previewContainer = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        
        if (imageUrl && this.isValidImageUrl(imageUrl)) {
            previewImg.src = imageUrl;
            previewImg.onload = () => {
                previewContainer.style.display = 'block';
            };
            previewImg.onerror = () => {
                previewContainer.style.display = 'none';
            };
        } else {
            previewContainer.style.display = 'none';
        }
    }

    isValidImageUrl(url) {
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
        return imageExtensions.test(url) || url.includes('cloudinary.com') || url.includes('picsum.photos');
    }

    showUploadSuccess(uploadInfo) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success alert-dismissible fade show mt-2';
        successDiv.innerHTML = `
            <strong>✅ Upload Successful!</strong> 
            Image uploaded to Cloudinary successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const imagePreview = document.getElementById('image-preview');
        imagePreview.parentNode.insertBefore(successDiv, imagePreview.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});

