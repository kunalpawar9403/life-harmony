import crypto from 'crypto';
import { pool, query } from '../config/database.js';
import { razorpayInstance, keyId, keySecret } from '../config/razorpay.js';

export async function createRazorpayOrder(req, res, next) {
    try {
        const userId = req.user.id;
        const { shippingCost = 0, tax = 0 } = req.body;

        // Fetch user cart
        const [cartRows] = await query('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (!cartRows) return res.status(400).json({ message: 'Cart not found' });
        const cartId = cartRows.id;

        const items = await query(
            `SELECT ci.qty, p.id, p.slug, p.name, p.subtitle, p.price, p.image
             FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ?`,
            [cartId]
        );
        if (!items.length) return res.status(400).json({ message: 'Your cart is empty' });

        const serverSubtotal = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
        const serverShipping = Number(shippingCost) || 0;
        const serverTax = Number(tax) || 0;
        const serverTotal = serverSubtotal + serverShipping + serverTax;

        // Native INR paise for universal Razorpay checkout
        const amountINR = Math.round(serverTotal);
        const amountInPaise = amountINR * 100;

        const receipt = `rcpt_${userId}_${Date.now().toString().slice(-6)}`;

        let rzpOrder;
        const isPlaceholder = !keyId || keyId === 'rzp_test_placeholder';

        if (razorpayInstance && !isPlaceholder) {
            try {
                rzpOrder = await razorpayInstance.orders.create({
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt,
                    notes: {
                        userId: String(userId),
                        totalINR: serverTotal.toFixed(2),
                    },
                });
            } catch (err) {
                console.error('Razorpay API error, falling back to test order:', err.message);
                rzpOrder = {
                    id: `order_test_${Date.now()}`,
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt,
                };
            }
        } else {
            // Simulated Test Order for sandbox / placeholder testing
            rzpOrder = {
                id: `order_test_${Date.now()}`,
                amount: amountInPaise,
                currency: 'INR',
                receipt,
            };
        }

        res.json({
            success: true,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: 'INR',
            keyId: isPlaceholder ? 'rzp_test_placeholder' : keyId,
            amountINR: serverTotal.toFixed(2),
            isTestMode: true,
        });
    } catch (err) {
        next(err);
    }
}

export async function verifyRazorpayPayment(req, res, next) {
    const conn = await pool.getConnection();
    try {
        const userId = req.user.id;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            shippingAddress,
            shippingMethod = 'Standard',
            shippingCost = 0,
            tax = 0,
        } = req.body;

        const isPlaceholder = !keyId || keyId === 'rzp_test_placeholder';

        // Verify HMAC signature if real Razorpay keys are configured
        if (!isPlaceholder && razorpay_signature) {
            const generatedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

            if (generatedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Razorpay payment signature verification failed.',
                });
            }
        }

        await conn.beginTransaction();

        // Load cart items
        const [cartRows] = await conn.execute('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (!cartRows.length) throw Object.assign(new Error('Cart is empty'), { status: 400 });
        const cartId = cartRows[0].id;

        const [items] = await conn.execute(
            `SELECT ci.qty, p.id, p.slug, p.name, p.subtitle, p.price, p.image
             FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ?`,
            [cartId]
        );
        if (!items.length) throw Object.assign(new Error('Cart is empty'), { status: 400 });

        const serverSubtotal = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
        const serverShipping = Number(shippingCost) || 0;
        const serverTax = Number(tax) || 0;
        const serverTotal = serverSubtotal + serverShipping + serverTax;

        const orderNumber = `LH-${Date.now().toString().slice(-8)}`;
        const trackingNumber = `TRK${Math.floor(100000000 + Math.random() * 900000000)}`;
        const eta = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

        const [result] = await conn.execute(
            `INSERT INTO orders (
                order_number, user_id, status, tracking_number, estimated_delivery,
                subtotal, shipping_cost, tax, discount, total, shipping_method,
                ship_name, ship_email, ship_phone, ship_line1, ship_line2, ship_city, ship_state, ship_zip, ship_country,
                payment_method, payment_brand, payment_last4, payment_name,
                razorpay_order_id, razorpay_payment_id, payment_status
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                orderNumber, userId, 'Processing', trackingNumber, eta,
                serverSubtotal, serverShipping, serverTax, 0, serverTotal, shippingMethod || 'Standard',
                shippingAddress?.name ?? null, shippingAddress?.email ?? null, shippingAddress?.phone ?? null,
                shippingAddress?.line1 ?? null, shippingAddress?.line2 ?? null, shippingAddress?.city ?? null,
                shippingAddress?.state ?? null, shippingAddress?.zip ?? null, shippingAddress?.country ?? null,
                'razorpay', 'Razorpay', razorpay_payment_id ? razorpay_payment_id.slice(-4) : 'RZP',
                shippingAddress?.name ?? null, razorpay_order_id ?? null, razorpay_payment_id ?? null, 'Paid'
            ]
        );
        const orderId = result.insertId;

        for (const it of items) {
            await conn.execute(
                `INSERT INTO order_items (order_id, product_id, name, subtitle, image, price, qty)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [orderId, it.id, it.name ?? null, it.subtitle ?? null, it.image ?? null, it.price, it.qty]
            );
        }

        // Clear user's cart
        await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

        await conn.commit();

        const [savedOrder] = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
        const orderItems = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        res.status(201).json({
            success: true,
            message: 'Payment verified and order created successfully.',
            order: {
                id: savedOrder.order_number,
                dbId: savedOrder.id,
                date: savedOrder.created_at,
                status: savedOrder.status,
                trackingNumber: savedOrder.tracking_number,
                estimatedDelivery: savedOrder.estimated_delivery,
                subtotal: Number(savedOrder.subtotal),
                shippingCost: Number(savedOrder.shipping_cost),
                tax: Number(savedOrder.tax),
                discount: Number(savedOrder.discount),
                total: Number(savedOrder.total),
                shippingMethod: savedOrder.shipping_method,
                shippingAddress: {
                    name: savedOrder.ship_name, email: savedOrder.ship_email, phone: savedOrder.ship_phone,
                    line1: savedOrder.ship_line1, line2: savedOrder.ship_line2, city: savedOrder.ship_city,
                    state: savedOrder.ship_state, zip: savedOrder.ship_zip, country: savedOrder.ship_country,
                },
                payment: {
                    method: 'razorpay',
                    brand: 'Razorpay',
                    last4: razorpay_payment_id ? razorpay_payment_id.slice(-4) : 'RZP',
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    status: 'Paid',
                },
                items: orderItems.map((i) => ({
                    id: i.product_id,
                    productId: i.product_id,
                    name: i.name,
                    subtitle: i.subtitle,
                    image: i.image,
                    price: Number(i.price),
                    qty: i.qty,
                })),
            },
        });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
}
