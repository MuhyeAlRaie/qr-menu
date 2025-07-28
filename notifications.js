class NotificationSystem {
    constructor() {
        this.orderNotifications = [];
        this.quickRequests = [];
        this.newOrderAudio = new Audio("sounds/new_order_chime.wav");
        this.quickRequestAudio = new Audio("sounds/quick_request_ding.wav");
        this.loadNotifications();
        this.loadQuickRequests();
    }

    async fetchFromGoogleSheets(sheetName) {
        const webAppUrl = "https://script.google.com/macros/s/AKfycbyNgIlCy-kp8eEJa5znqOqLCHe_3csp7i4q21UDQ0VXB97v9W-m0G_1TMWmTteWmT3w/exec"; // Replace with your Web App URL
        const url = `${webAppUrl}?sheet=${sheetName}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error(`Error fetching data from ${sheetName}:`, error);
            return [];
        }
    }

    async appendToGoogleSheets(sheetName, data) {
        const webAppUrl = "https://script.google.com/macros/s/AKfycbyNgIlCy-kp8eEJa5znqOqLCHe_3csp7i4q21UDQ0VXB97v9W-m0G_1TMWmTteWmT3w/exec"; // Replace with your Web App URL
        const url = `${webAppUrl}?sheet=${sheetName}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log(`Data appended to ${sheetName}:`, result);
            return result;
        } catch (error) {
            console.error(`Error appending data to ${sheetName}:`, error);
            return null;
        }
    }

    async updateGoogleSheets(sheetName, row, data) {
        const webAppUrl = "https://script.google.com/macros/s/AKfycbyNgIlCy-kp8eEJa5znqOqLCHe_3csp7i4q21UDQ0VXB97v9W-m0G_1TMWmTteWmT3w/exec"; // Replace with your Web App URL
        const url = `${webAppUrl}?sheet=${sheetName}&row=${row}`;
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log(`Data updated in ${sheetName}:`, result);
            return result;
        } catch (error) {
            console.error(`Error updating data in ${sheetName}:`, error);
            return null;
        }
    }

    async deleteFromGoogleSheets(sheetName, row) {
        const webAppUrl = "https://script.google.com/macros/s/AKfycbyNgIlCy-kp8eEJa5znqOqLCHe_3csp7i4q21UDQ0VXB97v9W-m0G_1TMWmTteWmT3w/exec"; // Replace with your Web App URL
        const url = `${webAppUrl}?sheet=${sheetName}&row=${row}`;
        try {
            const response = await fetch(url, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log(`Data deleted from ${sheetName}:`, result);
            return result;
        } catch (error) {
            console.error(`Error deleting data from ${sheetName}:`, error);
            return null;
        }
    }

    async loadNotifications() {
        const orders = await this.fetchFromGoogleSheets("Orders");
        this.orderNotifications = orders.map(order => ({
            id: order.Timestamp,
            tableNumber: order["Table Number"],
            items: JSON.parse(order.Items),
            total: parseFloat(order.Total),
            timestamp: order.Timestamp,
            status: order.Status || "New"
        }));
        this.renderNotifications();
    }

    async loadQuickRequests() {
        const requests = await this.fetchFromGoogleSheets("QuickRequests");
        this.quickRequests = requests.map(req => ({
            id: req.Timestamp,
            tableNumber: req["Table Number"],
            request: req.Request,
            timestamp: req.Timestamp,
            status: req.Status || "New"
        }));
        this.renderQuickRequests();
    }

    showNotification(data, type) {
        if (type === "order") {
            this.orderNotifications.unshift({
                id: data.timestamp,
                tableNumber: data.tableNumber,
                items: data.items,
                total: data.total,
                timestamp: data.timestamp,
                status: "New"
            });
            this.newOrderAudio.play();
            this.appendToGoogleSheets("Orders", {
                "Table Number": data.tableNumber,
                "Items": JSON.stringify(data.items),
                "Total": data.total,
                "Timestamp": data.timestamp,
                "Status": "New"
            });
            this.renderNotifications();
        } else if (type === "quick_request") {
            this.quickRequests.unshift({
                id: data.timestamp,
                tableNumber: data.tableNumber,
                request: data.request,
                timestamp: data.timestamp,
                status: "New"
            });
            this.quickRequestAudio.play();
            this.appendToGoogleSheets("QuickRequests", {
                "Table Number": data.tableNumber,
                "Request": data.request,
                "Timestamp": data.timestamp,
                "Status": "New"
            });
            this.renderQuickRequests();
        }
    }

    renderNotifications() {
        const container = document.getElementById("order-notifications-list");
        if (!container) return;
        container.innerHTML = "";

        if (this.orderNotifications.length === 0) {
            container.innerHTML = `<div class="no-notifications"><p>No new orders at the moment</p></div>`;
            return;
        }

        this.orderNotifications.forEach(notification => {
            const itemDiv = document.createElement("div");
            itemDiv.className = `notification-item ${notification.status.toLowerCase()} ${notification.status === 'New' ? 'new' : ''}`;
            itemDiv.setAttribute("data-id", notification.id);

            const itemsHtml = notification.items.map(item => 
                `<div class="order-items">${item.name} x ${item.quantity} ${item.size ? `(${item.size})` : ''} - $${item.price.toFixed(2)}</div>`
            ).join("");

            itemDiv.innerHTML = `
                <div class="notification-header-item">
                    <h4>Table ${notification.tableNumber}</h4>
                    <span class="notification-time">${new Date(notification.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="notification-details">
                    ${itemsHtml}
                    <div class="order-total">Total: $${notification.total.toFixed(2)}</div>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-success btn-sm" onclick="notificationSystem.markOrderReady('${notification.id}')">✅ Mark Ready</button>
                    <button class="btn btn-primary btn-sm" onclick="notificationSystem.markOrderProcessing('${notification.id}')">🔄 Processing</button>
                    <button class="btn btn-danger btn-sm" onclick="notificationSystem.dismissOrder('${notification.id}')">❌ Dismiss</button>
                </div>
            `;
            container.appendChild(itemDiv);
        });
        this.updateStatistics();
    }

    renderQuickRequests() {
        const container = document.getElementById("quick-requests-list");
        if (!container) return;
        container.innerHTML = "";

        if (this.quickRequests.length === 0) {
            container.innerHTML = `<div class="no-notifications"><p>No quick requests at the moment</p></div>`;
            return;
        }

        this.quickRequests.forEach(request => {
            const itemDiv = document.createElement("div");
            itemDiv.className = `notification-item quick-request-item ${request.status.toLowerCase()} ${request.status === 'New' ? 'new' : ''}`;
            itemDiv.setAttribute("data-id", request.id);

            itemDiv.innerHTML = `
                <div class="notification-content">
                    <div class="notification-header-info">
                        <h4>Table ${request.tableNumber}</h4>
                        <span class="notification-time">${new Date(request.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="notification-message">
                        <span class="request-icon">⚡</span> ${request.request}
                    </div>
                    <div class="notification-actions">
                        <button class="btn btn-success btn-sm" onclick="notificationSystem.markRequestCompleted('${request.id}')">✅ Done</button>
                        <button class="btn btn-danger btn-sm" onclick="notificationSystem.dismissRequest('${request.id}')">❌ Dismiss</button>
                    </div>
                </div>
            `;
            container.appendChild(itemDiv);
        });
    }

    async updateOrderStatus(id, status) {
        const index = this.orderNotifications.findIndex(n => n.id === id);
        if (index > -1) {
            this.orderNotifications[index].status = status;
            const row = await this.findRowByTimestamp("Orders", id);
            if (row) {
                await this.updateGoogleSheets("Orders", row, { Status: status });
            }
            this.renderNotifications();
        }
    }

    async markOrderReady(id) {
        await this.updateOrderStatus(id, "Ready");
    }

    async markOrderProcessing(id) {
        await this.updateOrderStatus(id, "Processing");
    }

    async dismissOrder(id) {
        const index = this.orderNotifications.findIndex(n => n.id === id);
        if (index > -1) {
            this.orderNotifications.splice(index, 1);
            const row = await this.findRowByTimestamp("Orders", id);
            if (row) {
                await this.deleteFromGoogleSheets("Orders", row);
            }
            this.renderNotifications();
        }
    }

    async updateRequestStatus(id, status) {
        const index = this.quickRequests.findIndex(n => n.id === id);
        if (index > -1) {
            this.quickRequests[index].status = status;
            const row = await this.findRowByTimestamp("QuickRequests", id);
            if (row) {
                await this.updateGoogleSheets("QuickRequests", row, { Status: status });
            }
            this.renderQuickRequests();
        }
    }

    async markRequestCompleted(id) {
        await this.updateRequestStatus(id, "Completed");
    }

    async dismissRequest(id) {
        const index = this.quickRequests.findIndex(n => n.id === id);
        if (index > -1) {
            this.quickRequests.splice(index, 1);
            const row = await this.findRowByTimestamp("QuickRequests", id);
            if (row) {
                await this.deleteFromGoogleSheets("QuickRequests", row);
            }
            this.renderQuickRequests();
        }
    }

    async clearQuickRequests() {
        for (const req of this.quickRequests) {
            const row = await this.findRowByTimestamp("QuickRequests", req.id);
            if (row) {
                await this.deleteFromGoogleSheets("QuickRequests", row);
            }
        }
        this.quickRequests = [];
        this.renderQuickRequests();
    }

    async findRowByTimestamp(sheetName, timestamp) {
        const data = await this.fetchFromGoogleSheets(sheetName);
        const headerRow = await this.fetchFromGoogleSheets(sheetName);
        const timestampColumnIndex = headerRow[0].indexOf("Timestamp");
        if (timestampColumnIndex === -1) {
            console.error("Timestamp column not found in sheet:", sheetName);
            return null;
        }
        // Rows are 1-indexed in Google Sheets, and header is row 1
        // So data rows start from index 0 in the fetched array, corresponding to row 2 in sheet
        const row = data.findIndex(item => item.Timestamp === timestamp);
        return row !== -1 ? row + 2 : null; 
    }

    updateStatistics() {
        const orderNotifications = this.orderNotifications;
        const totalOrders = orderNotifications.length;
        const pendingOrders = orderNotifications.filter(n => n.status !== "Ready").length;
        
        let totalRevenue = 0;
        orderNotifications.forEach(notification => {
            totalRevenue += notification.total;
        });
        
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        document.getElementById("total-orders").textContent = totalOrders;
        document.getElementById("pending-orders").textContent = pendingOrders;
        document.getElementById("total-revenue").textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById("avg-order").textContent = `$${avgOrder.toFixed(2)}`;
    }
}

const notificationSystem = new NotificationSystem();

// Initial render and periodic refresh
document.addEventListener("DOMContentLoaded", () => {
    notificationSystem.loadNotifications();
    notificationSystem.loadQuickRequests();

    setInterval(() => {
        notificationSystem.loadNotifications();
        notificationSystem.loadQuickRequests();
    }, 5000); // Refresh every 5 seconds
});



