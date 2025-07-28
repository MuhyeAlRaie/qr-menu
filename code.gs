/**
 * QR Menu Google Apps Script
 * This script provides API endpoints for the QR Menu application
 * to interact with Google Sheets as a database
 */

// Configuration - Replace with your actual Google Sheet ID
const SHEET_ID = '1HdT4PjZJUg5uwVgaJ1O1NjOO7giBJPSTy9VOcRBINfc';

/**
 * Main function to handle web app requests
 */
function doGet(e) {
  const action = e.parameter.action;

  const response = (() => {
    switch(action) {
      case 'getMenu':
        return getMenuData();
      case 'getOrders':
        return getOrdersData();
      case 'syncData':
        return syncAllData();
      default:
        return ContentService
          .createTextOutput(JSON.stringify({error: 'Invalid action'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  })();

  return addCORSHeaders(response);
}

/**
 * Handle POST requests for data updates
 */
function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);

  const response = (() => {
    switch(action) {
      case 'updateMenu':
        return updateMenuData(data);
      case 'addOrder':
        return addOrder(data);
      case 'updateOrder':
        return updateOrderStatus(data);
      case 'addQuickRequest':
        return addQuickRequest(data);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({error: 'Invalid action'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  })();

  return addCORSHeaders(response);
}

function addCORSHeaders(response) {
  return response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
}

/**
 * Sync all data (menu and orders)
 */
function syncAllData() {
  try {
    const menuData = getMenuData().getContent();
    const ordersData = getOrdersData().getContent();

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        menu: JSON.parse(menuData).data,
        orders: JSON.parse(ordersData).data
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get menu data from Google Sheets
 */
function getMenuData() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Menu');
    const data = sheet.getDataRange().getValues();
    
    // Convert to JSON format
    const headers = data[0];
    const menuItems = [];
    
    for (let i = 1; i < data.length; i++) {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = data[i][index];
      });
      menuItems.push(item);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: menuItems}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get orders data from Google Sheets
 */
function getOrdersData() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
    const data = sheet.getDataRange().getValues();
    
    // Convert to JSON format
    const headers = data[0];
    const orders = [];
    
    for (let i = 1; i < data.length; i++) {
      const order = {};
      headers.forEach((header, index) => {
        order[header] = data[i][index];
      });
      orders.push(order);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: orders}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update menu data in Google Sheets
 */
function updateMenuData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Menu');
    
    // Clear existing data except headers
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Add new data
    if (data.items && data.items.length > 0) {
      const values = data.items.map(item => [
        item.id || '',
        item.category || '',
        item.name || '',
        item.description || '',
        item.ingredients || '',
        item.price || '',
        item.sizes || '',
        item.image || '',
        item.available || true
      ]);
      
      sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Menu updated successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Add new order to Google Sheets
 */
function addOrder(orderData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
    
    // Generate order ID and table number
    const orderId = 'ORD' + Date.now();
    const tableNumber = Math.floor(Math.random() * 50) + 1;
    const timestamp = new Date();
    
    // Add order to sheet
    sheet.appendRow([
      orderId,
      tableNumber,
      JSON.stringify(orderData.items),
      orderData.total || 0,
      'pending',
      timestamp,
      orderData.customerNotes || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        orderId: orderId,
        tableNumber: tableNumber,
        message: 'Order placed successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Add new quick request to Google Sheets
 */
function addQuickRequest(requestData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QuickRequests");
    
    const requestId = "QR" + Date.now();
    const timestamp = new Date();
    
    sheet.appendRow([
      requestId,
      requestData.tableNumber,
      requestData.requestType,
      requestData.notes || "",
      "pending",
      timestamp
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        requestId: requestId,
        message: "Quick request added successfully"
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
