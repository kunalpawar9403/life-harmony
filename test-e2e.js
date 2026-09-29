// test-e2e.js
// Automated End-to-End Flow Testing for Life Harmony (Frontend <-> Backend <-> Database <-> Admin)

const BASE = process.env.API_URL || 'http://localhost:5001/api';

async function req(url, options = {}) {
  const res = await fetch(BASE + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function testAll() {
  console.log('====================================================');
  console.log('🧪 LIFE HARMONY END-TO-END FLOW TEST SUITE');
  console.log('Testing: Frontend <-> Backend <-> MySQL <-> Admin');
  console.log('Target API:', BASE);
  console.log('====================================================\n');

  const results = [];

  function record(name, pass, details = '') {
    results.push({ name, pass, details });
    console.log((pass ? '✅ PASS: ' : '❌ FAIL: ') + name + (details ? ' - ' + details : ''));
  }

  // 1. Storefront Product List
  try {
    const r = await req('/products');
    record('Storefront: GET /products', r.ok && r.data.products?.length > 0, 'Found ' + (r.data.products?.length || 0) + ' products');
  } catch(e) { record('Storefront: GET /products', false, e.message); }

  // 2. Storefront Product Detail
  try {
    const r = await req('/products/vitamin-d3-k2');
    record('Storefront: GET /products/vitamin-d3-k2', r.ok && r.data.product?.name === 'Vitamin D3+K2', r.data.product?.name);
  } catch(e) { record('Storefront: GET /products/vitamin-d3-k2', false, e.message); }

  // 3. Customer Auth: Register
  const testEmail = 'e2e_cust_' + Date.now() + '@example.com';
  let customerToken = '';
  let customerUser = null;
  try {
    const r = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'E2E Customer', email: testEmail, password: 'password123' })
    });
    customerToken = r.data?.token;
    customerUser = r.data?.user;
    record('Auth: Customer Registration', r.status === 201 && !!customerToken, 'User ID: ' + customerUser?.id);
  } catch(e) { record('Auth: Customer Registration', false, e.message); }

  // 4. Customer Auth: Login
  try {
    const r = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'password123' })
    });
    record('Auth: Customer Login', r.ok && !!r.data?.token, 'Logged in as ' + r.data?.user?.email);
  } catch(e) { record('Auth: Customer Login', false, e.message); }

  // 5. Admin Auth: Login
  let adminToken = '';
  try {
    const r = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@lifeharmony.com', password: 'admin123' })
    });
    adminToken = r.data?.token;
    record('Auth: Admin Login', r.ok && r.data?.user?.role === 'admin', 'Role: ' + r.data?.user?.role);
  } catch(e) { record('Auth: Admin Login', false, e.message); }

  // 6. Admin: Get Stats
  try {
    const r = await req('/admin/stats', { headers: { Authorization: 'Bearer ' + adminToken } });
    record('Admin: GET /admin/stats', r.ok && r.data?.totalProducts >= 0, 'Products: ' + r.data?.totalProducts + ', Orders: ' + r.data?.totalOrders);
  } catch(e) { record('Admin: GET /admin/stats', false, e.message); }

  // 7. Admin: Get Products
  try {
    const r = await req('/admin/products', { headers: { Authorization: 'Bearer ' + adminToken } });
    record('Admin: GET /admin/products', r.ok && r.data?.products?.length > 0, 'Count: ' + r.data?.count);
  } catch(e) { record('Admin: GET /admin/products', false, e.message); }

  // 8. Admin: Create Product
  const newProdSlug = 'e2e-super-collagen-' + Date.now();
  let createdProdId = null;
  try {
    const r = await req('/admin/products', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify({
        name: 'E2E Super Collagen',
        slug: newProdSlug,
        subtitle: 'Test formulation',
        description: 'Premium pure testing collagen',
        price: 1899,
        originalPrice: 2299,
        category: 'supplements',
        stock: 55,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=85',
        goals: ['beauty', 'energy'],
        benefits: ['Skin firmness', 'Joint health']
      })
    });
    createdProdId = r.data?.product?.id;
    record('Admin: POST /admin/products (Create)', r.status === 201 && !!createdProdId, 'Product ID: ' + createdProdId + ', Slug: ' + newProdSlug);
  } catch(e) { record('Admin: POST /admin/products (Create)', false, e.message); }

  // 9. Storefront: Check new product is live in consumer catalog
  try {
    const r = await req('/products/' + newProdSlug);
    record('Storefront: New product live in /products/' + newProdSlug, r.ok && r.data?.product?.name === 'E2E Super Collagen', 'Name: ' + r.data?.product?.name);
  } catch(e) { record('Storefront: New product live in /products/' + newProdSlug, false, e.message); }

  // 10. Admin: Update Product (Price & stock)
  try {
    const r = await req('/admin/products/' + createdProdId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify({
        name: 'E2E Super Collagen Ultra',
        price: 1999,
        stock: 75
      })
    });
    record('Admin: PUT /admin/products/:id (Update)', r.ok, 'Updated ID: ' + createdProdId);
  } catch(e) { record('Admin: PUT /admin/products/:id (Update)', false, e.message); }

  // 11. Storefront: Check updated product in storefront
  try {
    const r = await req('/products/' + newProdSlug);
    record('Storefront: Updated price/name reflected', r.ok && r.data?.product?.name === 'E2E Super Collagen Ultra' && r.data?.product?.price === 1999, 'Name: ' + r.data?.product?.name + ', Price: ' + r.data?.product?.price);
  } catch(e) { record('Storefront: Updated price/name reflected', false, e.message); }

  // 12. Admin: Quick stock update
  try {
    const r = await req('/admin/products/' + createdProdId + '/stock', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify({ delta: 10 })
    });
    record('Admin: PATCH /admin/products/:id/stock', r.ok && r.data?.stock === 85, 'New stock: ' + r.data?.stock);
  } catch(e) { record('Admin: PATCH /admin/products/:id/stock', false, e.message); }

  // 13. Customer: Add to cart
  try {
    const r = await req('/cart/items', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + customerToken },
      body: JSON.stringify({ productSlug: newProdSlug, qty: 2 })
    });
    record('Customer: POST /cart/items', r.ok, 'Cart updated');
  } catch(e) { record('Customer: POST /cart/items', false, e.message); }

  // 14. Customer: Get cart
  try {
    const r = await req('/cart', {
      headers: { Authorization: 'Bearer ' + customerToken }
    });
    record('Customer: GET /cart', r.ok && r.data?.items?.length > 0, 'Items: ' + r.data?.items?.length);
  } catch(e) { record('Customer: GET /cart', false, e.message); }

  // 15. Customer: Add Shipping Address
  let addressId = null;
  try {
    const r = await req('/addresses', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + customerToken },
      body: JSON.stringify({
        label: 'Home',
        line1: '456 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400020',
        country: 'India'
      })
    });
    addressId = r.data?.address?.id;
    record('Customer: POST /addresses', r.status === 201 && !!addressId, 'Address ID: ' + addressId);
  } catch(e) { record('Customer: POST /addresses', false, e.message); }

  // 16. Customer: Wishlist toggle
  try {
    const r = await req('/wishlist/toggle/' + newProdSlug, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + customerToken }
    });
    record('Customer: POST /wishlist/toggle/:slug', r.ok, 'Wishlist toggled');
  } catch(e) { record('Customer: POST /wishlist/toggle/:slug', false, e.message); }

  // 17. Customer: Place Order (Razorpay Verify / Card / Cash)
  let orderNumber = '';
  try {
    const r = await req('/payment/razorpay/verify', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + customerToken },
      body: JSON.stringify({
        razorpay_order_id: 'order_test_9911',
        razorpay_payment_id: 'pay_test_9922',
        razorpay_signature: 'test_signature_simulated',
        items: [{
          id: newProdSlug,
          slug: newProdSlug,
          name: 'E2E Super Collagen Ultra',
          price: 1999,
          qty: 2
        }],
        total: 3998,
        shippingAddress: {
          name: 'E2E Customer',
          email: testEmail,
          phone: '+91 9123456780',
          line1: '456 Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400020',
          country: 'India'
        },
        shippingMethod: 'Express',
        shippingCost: 99,
        tax: 0
      })
    });
    orderNumber = r.data?.order?.orderNumber || r.data?.order?.id;
    record('Customer: Place Order via /payment/razorpay/verify', r.status === 201 && !!orderNumber, 'Order Number: ' + orderNumber);
  } catch(e) { record('Customer: Place Order via /payment/razorpay/verify', false, e.message); }

  // 18. Customer: View My Orders in Profile
  try {
    const r = await req('/orders', {
      headers: { Authorization: 'Bearer ' + customerToken }
    });
    const found = r.data?.orders?.some(o => (o.orderNumber || o.id) === orderNumber);
    record('Customer: GET /orders shows new order', r.ok && found, 'Found order in customer profile');
  } catch(e) { record('Customer: GET /orders shows new order', false, e.message); }

  // 19. Admin: View Orders
  try {
    const r = await req('/admin/orders', {
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    const found = r.data?.orders?.some(o => (o.orderNumber || o.id) === orderNumber);
    record('Admin: GET /admin/orders contains customer order', r.ok && found, 'Order synchronized to Admin dashboard');
  } catch(e) { record('Admin: GET /admin/orders contains customer order', false, e.message); }

  // 20. Admin: Update Order Status to 'Shipped' with tracking
  try {
    const r = await req('/admin/orders/' + orderNumber + '/status', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify({
        status: 'Shipped',
        trackingNumber: 'TRK11223344'
      })
    });
    record('Admin: PATCH /admin/orders/:id/status to Shipped', r.ok, 'Status updated');
  } catch(e) { record('Admin: PATCH /admin/orders/:id/status to Shipped', false, e.message); }

  // 21. Customer: Verify Shipped status & tracking in customer order
  try {
    const r = await req('/orders/' + orderNumber, {
      headers: { Authorization: 'Bearer ' + customerToken }
    });
    const isShipped = r.data?.order?.status === 'Shipped';
    const trk = r.data?.order?.trackingNumber || r.data?.order?.tracking_number;
    record('Customer: GET /orders/:id reflects Shipped status & Tracking from Admin', isShipped && trk === 'TRK11223344', 'Status: ' + r.data?.order?.status + ', Tracking: ' + trk);
  } catch(e) { record('Customer: GET /orders/:id reflects Shipped status & Tracking from Admin', false, e.message); }

  // 22. Admin: Check Users List
  try {
    const r = await req('/admin/users', {
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    const u = r.data?.users?.find(x => x.email === testEmail);
    record('Admin: GET /admin/users includes new customer with stats', !!u && u.orderCount >= 1, 'Customer found with order count ' + u?.orderCount);
  } catch(e) { record('Admin: GET /admin/users includes new customer with stats', false, e.message); }

  // 23. Admin: Delete Product
  try {
    const r = await req('/admin/products/' + createdProdId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    record('Admin: DELETE /admin/products/:id', r.ok, 'Product removed by admin');
  } catch(e) { record('Admin: DELETE /admin/products/:id', false, e.message); }

  // 24. Storefront: Check deleted product is no longer found
  try {
    const r = await req('/products/' + newProdSlug);
    record('Storefront: Deleted product removed from catalog', r.status === 404, 'Status: ' + r.status);
  } catch(e) { record('Storefront: Deleted product removed from catalog', false, e.message); }

  console.log('\n====================================================');
  const passed = results.filter(r => r.pass).length;
  console.log('RESULTS: ' + passed + ' / ' + results.length + ' tests passed.');
  if (passed === results.length) {
    console.log('🎉 ALL 24 END-TO-END FLOW TESTS COMPLETED WITH 100% SUCCESS!');
  } else {
    console.log('⚠️ Some tests failed. Review output above.');
    process.exit(1);
  }
}

testAll();
