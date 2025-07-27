// Notification System for Cash Register Device
class NotificationSystem {
    constructor() {
        this.apiUrl = 'https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec';
        this.isListening = false;
        this.lastOrderCheck = Date.now();
        this.checkInterval = 5000; // Check every 5 seconds
        this.audio = null;
        this.init();
    }

    init() {
        this.setupAudio();
        this.setupUI();
        this.startListening();
    }

    setupAudio() {
        // Create notification sound
        this.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    }

    setupUI() {
        // Create notification panel for cash register
        const notificationHTML = `
            <div id="notification-panel" class="notification-panel">
                <div class="notification-header">
                    <h3>🔔 Order Notifications</h3>
                    <div class="notification-controls">
                        <button id="toggle-notifications" class="btn btn-sm btn-primary">
                            <span id="notification-status">🔊 ON</span>
                        </button>
                        <button id="clear-notifications" class="btn btn-sm btn-secondary">Clear All</button>
                    </div>
                </div>
                <div id="notification-list" class="notification-list">
                    <div class="no-notifications">No new orders</div>
                </div>
            </div>
        `;

        // Add to page if not exists
        if (!document.getElementById('notification-panel')) {
            document.body.insertAdjacentHTML('beforeend', notificationHTML);
        }

        // Setup event listeners
        document.getElementById('toggle-notifications').addEventListener('click', () => {
            this.toggleNotifications();
        });

        document.getElementById('clear-notifications').addEventListener('click', () => {
            this.clearNotifications();
        });
    }

    async startListening() {
        if (this.isListening) return;
        
        this.isListening = true;
        this.checkForNewOrders();
    }

    stopListening() {
        this.isListening = false;
    }

    async checkForNewOrders() {
        if (!this.isListening) return;

        try {
            // For demo purposes, we'll simulate checking for new orders
            // In production, uncomment the API call below
            /*
            const response = await fetch(`${this.apiUrl}?action=getOrders&since=${this.lastOrderCheck}`);
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                data.data.forEach(order => this.showNotification(order));
            }
            */

            // Simulate random new orders for demo
            if (Math.random() < 0.1) { // 10% chance of new order
                this.simulateNewOrder();
            }

        } catch (error) {
            console.error('Error checking for new orders:', error);
        }

        // Schedule next check
        setTimeout(() => this.checkForNewOrders(), this.checkInterval);
    }

    simulateNewOrder() {
        const mockOrder = {
            orderId: 'ORD' + Date.now(),
            tableNumber: Math.floor(Math.random() * 50) + 1,
            items: [
                { name: 'Hot Drinks Item 1', quantity: 2, price: 6.74 },
                { name: 'Cold Drinks Item 2', quantity: 1, price: 8.50 }
            ],
            total: 21.98,
            timestamp: new Date().toISOString()
        };

        this.showNotification(mockOrder);
    }

    showNotification(order) {
        // Play notification sound
        if (this.audio && this.isListening) {
            this.audio.play().catch(e => console.log('Audio play failed:', e));
        }

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('New Order Received!', {
                body: `Table ${order.tableNumber} - $${order.total}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍽️</text></svg>',
                tag: order.orderId
            });
        }

        // Add to notification list
        this.addToNotificationList(order);

        // Update last check time
        this.lastOrderCheck = Date.now();
    }

    addToNotificationList(order) {
        const notificationList = document.getElementById('notification-list');
        const noNotifications = notificationList.querySelector('.no-notifications');
        
        if (noNotifications) {
            noNotifications.remove();
        }

        const orderTime = new Date(order.timestamp).toLocaleTimeString();
        const itemsList = order.items.map(item => 
            `${item.quantity}x ${item.name}`
        ).join(', ');

        const notificationHTML = `
            <div class="notification-item" data-order-id="${order.orderId}">
                <div class="notification-content">
                    <div class="notification-header-item">
                        <strong>Table ${order.tableNumber}</strong>
                        <span class="notification-time">${orderTime}</span>
                    </div>
                    <div class="notification-details">
                        <div class="order-items">${itemsList}</div>
                        <div class="order-total">Total: $${order.total}</div>
                    </div>
                    <div class="notification-actions">
                        <button class="btn btn-sm btn-success" onclick="notificationSystem.markAsProcessed('${order.orderId}')">
                            ✓ Processed
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="notificationSystem.markAsReady('${order.orderId}')">
                            🍽️ Ready
                        </button>
                    </div>
                </div>
            </div>
        `;

        notificationList.insertAdjacentHTML('afterbegin', notificationHTML);

        // Auto-remove after 10 minutes
        setTimeout(() => {
            const notification = document.querySelector(`[data-order-id="${order.orderId}"]`);
            if (notification) {
                notification.remove();
                this.checkEmptyNotifications();
            }
        }, 600000);
    }

    async markAsProcessed(orderId) {
        try {
            // Update order status in Google Sheets
            /*
            await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=updateOrder&data=${encodeURIComponent(JSON.stringify({
                    orderId: orderId,
                    status: 'processing'
                }))}`
            });
            */

            // Update UI
            const notification = document.querySelector(`[data-order-id="${orderId}"]`);
            if (notification) {
                notification.classList.add('processing');
                notification.querySelector('.notification-actions').innerHTML = `
                    <span class="badge bg-warning">Processing...</span>
                    <button class="btn btn-sm btn-success" onclick="notificationSystem.markAsReady('${orderId}')">
                        🍽️ Ready
                    </button>
                `;
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }

    async markAsReady(orderId) {
        try {
            // Update order status in Google Sheets
            /*
            await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=updateOrder&data=${encodeURIComponent(JSON.stringify({
                    orderId: orderId,
                    status: 'ready'
                }))}`
            });
            */

            // Update UI
            const notification = document.querySelector(`[data-order-id="${orderId}"]`);
            if (notification) {
                notification.classList.add('ready');
                notification.querySelector('.notification-actions').innerHTML = `
                    <span class="badge bg-success">Ready for Pickup</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="notificationSystem.removeNotification('${orderId}')">
                        ✓ Delivered
                    </button>
                `;
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }

    removeNotification(orderId) {
        const notification = document.querySelector(`[data-order-id="${orderId}"]`);
        if (notification) {
            notification.remove();
            this.checkEmptyNotifications();
        }
    }

    toggleNotifications() {
        const statusElement = document.getElementById('notification-status');
        
        if (this.isListening) {
            this.stopListening();
            statusElement.textContent = '🔇 OFF';
            statusElement.parentElement.classList.remove('btn-primary');
            statusElement.parentElement.classList.add('btn-secondary');
        } else {
            this.startListening();
            statusElement.textContent = '🔊 ON';
            statusElement.parentElement.classList.remove('btn-secondary');
            statusElement.parentElement.classList.add('btn-primary');
        }
    }

    clearNotifications() {
        const notificationList = document.getElementById('notification-list');
        notificationList.innerHTML = '<div class="no-notifications">No new orders</div>';
    }

    checkEmptyNotifications() {
        const notificationList = document.getElementById('notification-list');
        const notifications = notificationList.querySelectorAll('.notification-item');
        
        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">No new orders</div>';
        }
    }

    // Request notification permission
    static async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }
}

// Initialize notification system
let notificationSystem;
document.addEventListener('DOMContentLoaded', async () => {
    // Request notification permission
    await NotificationSystem.requestNotificationPermission();
    
    // Initialize notification system
    notificationSystem = new NotificationSystem();
});

