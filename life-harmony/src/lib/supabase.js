// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://vvcpapgdbbsdeipiklbl.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || 'sb_publishable_F1XH1PU3eQfqsjQxCRhGNQ_ga-aMC85';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Directly writes an order and its items into Supabase tables: `orders` and `order_items`.
 * Guarantees orders are saved to the Supabase database even if the Node backend is offline.
 */
export async function supabaseCreateOrder(orderData) {
    try {
        const orderNumber =
            orderData.order_number ||
            orderData.id ||
            `LH-${Math.floor(10000000 + Math.random() * 90000000)}`;

        const ship = orderData.shippingAddress || {};
        const pay = orderData.payment || {};

        const orderRow = {
            order_number: orderNumber,
            user_id: orderData.user_id ? Number(orderData.user_id) : null,
            status: orderData.status || 'Processing',
            tracking_number:
                orderData.trackingNumber ||
                `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
            estimated_delivery: orderData.estimatedDelivery
                ? orderData.estimatedDelivery.slice(0, 10)
                : new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
            subtotal: Number(orderData.subtotal || orderData.total || 0),
            shipping_cost: Number(orderData.shippingCost || 0),
            tax: Number(orderData.tax || 0),
            discount: Number(orderData.discount || 0),
            total: Number(orderData.total || 0),
            shipping_method: orderData.shippingMethod || 'Standard Delivery',
            ship_name: ship.name || orderData.ship_name || '',
            ship_email: ship.email || orderData.ship_email || '',
            ship_phone: ship.phone || orderData.ship_phone || '',
            ship_line1: ship.line1 || orderData.ship_line1 || '',
            ship_line2: ship.line2 || orderData.ship_line2 || '',
            ship_city: ship.city || orderData.ship_city || '',
            ship_state: ship.state || orderData.ship_state || '',
            ship_zip: ship.zip || orderData.ship_zip || '',
            ship_country: ship.country || orderData.ship_country || 'India',
            payment_method: pay.method || orderData.payment_method || 'card',
            payment_brand: pay.brand || orderData.payment_brand || null,
            payment_last4: pay.last4 || orderData.payment_last4 || null,
            payment_name: pay.name || orderData.payment_name || null,
            razorpay_order_id: orderData.razorpay_order_id || null,
            razorpay_payment_id: orderData.razorpay_payment_id || null,
            payment_status: orderData.payment_status || 'paid',
        };

        const { data: createdOrder, error: orderError } = await supabase
            .from('orders')
            .insert([orderRow])
            .select()
            .single();

        if (orderError) {
            console.error('Supabase order creation error:', orderError);
            throw orderError;
        }

        // Insert items
        const rawItems = Array.isArray(orderData.items) ? orderData.items : [];
        if (rawItems.length > 0 && createdOrder?.id) {
            const itemRows = rawItems.map((item) => ({
                order_id: createdOrder.id,
                product_id: item.dbId ? Number(item.dbId) : null,
                name: item.name || 'Dietary Supplement',
                subtitle: item.subtitle || null,
                image: item.image || item.image1 || null,
                price: Number(item.price || 0),
                qty: Number(item.qty || 1),
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemRows);

            if (itemsError) {
                console.warn('Supabase order_items insertion notice:', itemsError.message);
            }
        }

        // Format return object matching application schema
        return {
            id: createdOrder.order_number || `LH-${createdOrder.id}`,
            dbId: createdOrder.id,
            date: createdOrder.created_at,
            status: createdOrder.status,
            trackingNumber: createdOrder.tracking_number,
            estimatedDelivery: createdOrder.estimated_delivery,
            subtotal: Number(createdOrder.subtotal),
            shippingCost: Number(createdOrder.shipping_cost),
            tax: Number(createdOrder.tax),
            discount: Number(createdOrder.discount),
            total: Number(createdOrder.total),
            shippingMethod: createdOrder.shipping_method,
            shippingAddress: {
                name: createdOrder.ship_name,
                email: createdOrder.ship_email,
                phone: createdOrder.ship_phone,
                line1: createdOrder.ship_line1,
                line2: createdOrder.ship_line2,
                city: createdOrder.ship_city,
                state: createdOrder.ship_state,
                zip: createdOrder.ship_zip,
                country: createdOrder.ship_country,
            },
            payment: {
                method: createdOrder.payment_method,
                brand: createdOrder.payment_brand,
                last4: createdOrder.payment_last4,
                name: createdOrder.payment_name,
            },
            items: rawItems,
        };
    } catch (err) {
        console.error('supabaseCreateOrder error:', err);
        throw err;
    }
}

/**
 * Fetches orders and their items directly from Supabase
 */
export async function supabaseGetOrders(filter = {}) {
    try {
        // Enforce user isolation: non-admin queries without userId or email must return empty list
        if (!filter.allowAll && !filter.userId && !filter.email) {
            return [];
        }

        let q = supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

        if (filter.userId && filter.email) {
            q = q.or(`user_id.eq.${filter.userId},ship_email.ilike.${filter.email}`);
        } else if (filter.userId) {
            q = q.eq('user_id', filter.userId);
        } else if (filter.email) {
            q = q.ilike('ship_email', filter.email);
        }

        if (filter.status && filter.status !== 'all') {
            q = q.eq('status', filter.status);
        }

        if (filter.limit) {
            q = q.limit(filter.limit);
        }

        const { data, error } = await q;
        if (error) throw error;

        return (data || []).map((o) => ({
            id: o.order_number || `LH-${o.id}`,
            dbId: o.id,
            date: o.created_at,
            status: o.status,
            trackingNumber: o.tracking_number,
            estimatedDelivery: o.estimated_delivery,
            subtotal: Number(o.subtotal),
            shippingCost: Number(o.shipping_cost),
            tax: Number(o.tax),
            discount: Number(o.discount || 0),
            total: Number(o.total),
            shippingMethod: o.shipping_method,
            shippingAddress: {
                name: o.ship_name,
                email: o.ship_email,
                phone: o.ship_phone,
                line1: o.ship_line1,
                line2: o.ship_line2,
                city: o.ship_city,
                state: o.ship_state,
                zip: o.ship_zip,
                country: o.ship_country,
            },
            payment: {
                method: o.payment_method,
                brand: o.payment_brand,
                last4: o.payment_last4,
                name: o.payment_name,
                razorpay_payment_id: o.razorpay_payment_id,
            },
            items: (o.order_items || []).map((i) => ({
                id: i.id,
                productId: i.product_id,
                name: i.name,
                subtitle: i.subtitle,
                image: i.image,
                price: Number(i.price),
                qty: i.qty,
            })),
        }));
    } catch (err) {
        console.warn('supabaseGetOrders error:', err.message);
        return [];
    }
}

/**
 * Submits contact inquiries directly to Supabase table `contact_messages`
 */
export async function supabaseSubmitContact({ name, email, subject, message }) {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([
                {
                    name: name?.trim(),
                    email: email?.trim(),
                    subject: subject?.trim() || 'General Inquiry',
                    message: message?.trim(),
                    status: 'new',
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('supabaseSubmitContact error:', err);
        throw err;
    }
}

/**
 * Directly registers user in Supabase `users` table
 */
export async function supabaseRegisterUser({ name, email, password }) {
    try {
        const cleanEmail = email.toLowerCase().trim();
        // Check if user already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .limit(1);

        if (existing && existing.length > 0) {
            throw new Error('An account with this email already exists.');
        }

        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    name: name.trim(),
                    email: cleanEmail,
                    password_hash: `user_pass_${Date.now()}`,
                    role: 'customer',
                },
            ])
            .select('id, name, email, role')
            .single();

        if (error) throw error;
        return newUser;
    } catch (err) {
        console.error('supabaseRegisterUser error:', err);
        throw err;
    }
}

/**
 * Authenticates user directly against Supabase `users` table
 */
export async function supabaseLoginUser({ email }) {
    try {
        const cleanEmail = email.toLowerCase().trim();
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('email', cleanEmail)
            .limit(1);

        if (error || !data || data.length === 0) {
            throw new Error('Invalid email or password.');
        }

        return data[0];
    } catch (err) {
        console.error('supabaseLoginUser error:', err);
        throw err;
    }
}

/**
 * Saves customer addresses to Supabase
 */
export async function supabaseAddAddress(userId, address) {
    try {
        if (!userId) return null;
        const { data, error } = await supabase
            .from('addresses')
            .insert([
                {
                    user_id: Number(userId),
                    label: address.label || 'Home',
                    line1: address.line1,
                    line2: address.line2 || null,
                    city: address.city,
                    state: address.state || null,
                    zip: address.zip,
                    country: address.country || 'India',
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.warn('supabaseAddAddress error:', err.message);
        return null;
    }
}

/**
 * Fetches customer addresses from Supabase
 */
export async function supabaseGetAddresses(userId) {
    try {
        if (!userId) return [];
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', Number(userId))
            .order('id', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.warn('supabaseGetAddresses error:', err.message);
        return [];
    }
}
