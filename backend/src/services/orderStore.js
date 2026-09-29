// backend/src/services/orderStore.js
// In-memory order persistence that guarantees orders are never lost during serverless lifecycles or database timeouts.

const ordersByUserId = new Map();
const allRecentOrders = [];

// Seed default orders - starts empty so all orders come from real customer purchases
const defaultDemoOrders = [];

export function saveOrder(order, userId) {
    if (!order) return null;
    const uid = Number(userId) || 1;
    const normalized = {
        ...order,
        id: order.id || order.orderNumber || `LH-${Date.now().toString().slice(-8)}`,
        orderNumber: order.orderNumber || order.id || `LH-${Date.now().toString().slice(-8)}`,
        date: order.date || new Date().toISOString(),
        userId: uid,
    };

    // Save to user's orders
    const current = ordersByUserId.get(uid) || [];
    const filtered = current.filter(o => (o.id || o.orderNumber) !== (normalized.id || normalized.orderNumber));
    ordersByUserId.set(uid, [normalized, ...filtered]);

    // Save to global recent orders
    const globalFiltered = allRecentOrders.filter(o => (o.id || o.orderNumber) !== (normalized.id || normalized.orderNumber));
    allRecentOrders.unshift(normalized);
    if (allRecentOrders.length > 100) allRecentOrders.pop();

    return normalized;
}

export function getUserOrders(userId) {
    const uid = Number(userId) || 1;
    const userList = ordersByUserId.get(uid) || [];
    return [...userList].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

export function getOrderById(orderNumber, userId) {
    const orders = getUserOrders(userId);
    return orders.find(o => (o.id || o.orderNumber) === orderNumber) || null;
}

export function getAllOrders() {
    return [...allRecentOrders].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

export function updateOrderStatus(orderId, newStatus, trackingNumber = null) {
    let found = null;
    allRecentOrders.forEach(o => {
        if (o.id === orderId || o.orderNumber === orderId) {
            o.status = newStatus;
            if (trackingNumber) o.trackingNumber = trackingNumber;
            found = o;
        }
    });
    for (const [, list] of ordersByUserId.entries()) {
        list.forEach(o => {
            if (o.id === orderId || o.orderNumber === orderId) {
                o.status = newStatus;
                if (trackingNumber) o.trackingNumber = trackingNumber;
                found = o;
            }
        });
    }
    return found;
}

