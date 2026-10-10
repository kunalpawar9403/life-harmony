import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import { Toaster } from './components/ui/toaster';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  // Completely separate standalone Admin Portal layout matching website styling
  if (isAdminRoute) {
    return (
      <div className="admin-portal-app min-h-screen bg-gradient-to-b from-[#fdf7f9] via-[#f7ebf1] to-[#f4e2ec] text-[#1c1c21] relative overflow-x-hidden selection:bg-[#adc8f8] selection:text-[#18181b]">
        {/* Ambient background glow orbs */}
        <div className="fixed top-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#f8dce5]/40 to-transparent blur-[120px] pointer-events-none -z-10" />
        <div className="fixed top-[40%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#d8e6ff]/35 to-transparent blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#f3e1ea]/50 to-transparent blur-[130px] pointer-events-none -z-10" />

        <ScrollToTop />
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </div>
      </div>
    );
  }

  const isCheckoutRoute = pathname.startsWith('/checkout');

  // Consumer E-Commerce Storefront layout (no admin elements)
  return (
    <div className="App min-h-screen bg-gradient-to-b from-[#fdf7f9] via-[#f7ebf1] to-[#f4e2ec] text-[#1c1c21] relative overflow-x-hidden selection:bg-[#adc8f8] selection:text-[#18181b]">
      {/* Ambient background glow orbs */}
      <div className="fixed top-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#f8dce5]/40 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#d8e6ff]/35 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#f3e1ea]/50 to-transparent blur-[130px] pointer-events-none -z-10" />

      <ScrollToTop />
      <div className={`max-w-[1440px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 sm:py-6 ${isCheckoutRoute ? 'pb-8' : 'pb-24 sm:pb-28 md:pb-6'}`}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isCheckoutRoute && <Footer />}
      </div>
      <CartDrawer />
      {!isCheckoutRoute && <MobileBottomNav />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
      <Toaster />
    </AuthProvider>
  );
}

export default App;