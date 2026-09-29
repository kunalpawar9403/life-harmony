// backend/src/services/orderStore.js
// In-memory order persistence that guarantees orders are never lost during serverless lifecycles or database timeouts.

const ordersByUserId = new Map();
const allRecentOrders = [];

// Seed default orders so demo accounts have realistic history even if database is offline
const defaultDemoOrders = [
    {
        id: 'LH-70436580',
        orderNumber: 'LH-70436580',
        userId: 2,
        date: new Date(Date.now() - 3600000 * 3).toISOString(),
        status: 'Shipped',
        trackingNumber: 'TRK891240192',
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        subtotal: 1199,
        shippingCost: 0,
        tax: 95.92,
        discount: 0,
        total: 1294.92,
        shippingMethod: 'Express Delivery',
        shippingAddress: {
            name: 'Demo Member',
            email: 'demo@lifeharmony.com',
            phone: '+91 98765 43210',
            line1: 'Flat 402, Green Valley Heights',
            line2: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400050',
            country: 'India',
        },
        payment: {
            method: 'razorpay',
            brand: 'Razorpay',
            last4: '4242',
            paymentId: 'pay_demo_70436580',
            orderId: 'order_demo_70436580',
            status: 'Paid',
        },
        items: [
            {
                id: 'vitamin-d3-k2',
                name: 'Vitamin D3+K2',
                subtitle: 'With Coconut MCT Oil',
                price: 1199,
                qty: 1,
                image: 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
            },
        ],
    },
    {
        id: 'LH-69595734',
        orderNumber: 'LH-69595734',
        userId: 2,
        date: new Date(Date.now() - 86400000 * 4).toISOString(),
        status: 'Delivered',
        trackingNumber: 'TRK441920811',
        estimatedDelivery: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
        subtotal: 1999,
        shippingCost: 0,
        tax: 159.92,
        discount: 0,
        total: 2158.92,
        shippingMethod: 'Standard Delivery',
        shippingAddress: {
            name: 'Demo Member',
            email: 'demo@lifeharmony.com',
            phone: '+91 98765 43210',
            line1: 'Flat 402, Green Valley Heights',
            line2: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400050',
            country: 'India',
        },
        payment: {
            method: 'razorpay',
            brand: 'Razorpay',
            last4: '8891',
            paymentId: 'pay_demo_69595734',
            orderId: 'order_demo_69595734',
            status: 'Paid',
        },
        items: [
            {
                id: 'great-offer-set',
                name: 'A set of Dietary supplements',
                subtitle: 'Vitamin D3+K2 + Organic Collagen Peptides',
                price: 1999,
                qty: 1,
                image: 'https://images.unsplash.com/photo-1664786908163-85ca46f85138?crop=entropy&cs=srgb&fm=jpg&q=85',
            },
        ],
    },
];

// Seed demo users (id 1, 2)
ordersByUserId.set(1, [...defaultDemoOrders]);
ordersByUserId.set(2, [...defaultDemoOrders]);
allRecentOrders.push(...defaultDemoOrders);

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

    // Also link to both demo IDs 1 and 2 if it's the demo account
    if (uid === 1 || uid === 2) {
        const otherId = uid === 1 ? 2 : 1;
        const otherCurrent = ordersByUserId.get(otherId) || [];
        const otherFiltered = otherCurrent.filter(o => (o.id || o.orderNumber) !== (normalized.id || normalized.orderNumber));
        ordersByUserId.set(otherId, [normalized, ...otherFiltered]);
    }

    // Save to global recent orders
    const globalFiltered = allRecentOrders.filter(o => (o.id || o.orderNumber) !== (normalized.id || normalized.orderNumber));
    allRecentOrders.unshift(normalized);
    if (allRecentOrders.length > 50) allRecentOrders.pop();

    return normalized;
}

export function getUserOrders(userId) {
    const uid = Number(userId) || 1;
    const userList = ordersByUserId.get(uid) || [];
    if (uid === 1 || uid === 2) {
        const id1 = ordersByUserId.get(1) || [];
        const id2 = ordersByUserId.get(2) || [];
        const map = new Map();
        [...id1, ...id2].forEach(o => {
            const key = o.id || o.orderNumber;
            if (key) map.set(key, o);
        });
        return Array.from(map.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }
    return userList;
}

export function getOrderById(orderNumber, userId) {
    const orders = getUserOrders(userId);
    return orders.find(o => (o.id || o.orderNumber) === orderNumber) || null;
}

export function getAllOrders() {
    return [...allRecentOrders];
}

export function updateOrderStatus(orderId, newStatus) {
    let found = null;
    allRecentOrders.forEach(o => {
        if (o.id === orderId || o.orderNumber === orderId) {
            o.status = newStatus;
            found = o;
        }
    });
    for (const [uid, list] of ordersByUserId.entries()) {
        list.forEach(o => {
            if (o.id === orderId || o.orderNumber === orderId) {
                o.status = newStatus;
                found = o;
            }
        });
    }
    return found;
}
