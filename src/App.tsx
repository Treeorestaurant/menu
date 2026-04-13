/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Clock,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMenu } from './hooks/useMenu';
import { MenuItem, CartItem } from './types';
import { cn } from './lib/utils';

const WHATSAPP_NUMBER = "+96171467346";
const RESTAURANT_NAME = "Tree O";

export default function App() {
  const { items, loading, error } = useMenu();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories extraction
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(items.map(item => item.category))];
    return cats;
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Cart logic
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return 'https://picsum.photos/seed/bakery/800/600';
    if (url.startsWith('http')) return url;
    
    // Handle local paths for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const sendOrder = () => {
    const orderDetails = cart.map(item => 
      `• ${item.title} x${item.quantity} - ${item.price.toLocaleString()} L.L`
    ).join('\n');
    
    const message = encodeURIComponent(
      `*New Order from ${RESTAURANT_NAME}*\n\n` +
      `${orderDetails}\n\n` +
      `*Total: ${cartTotal.toLocaleString()} L.L*\n\n` +
      `Please confirm my order. Thank you!`
    );
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bakery-crust/80 backdrop-blur-md border-b border-bakery-crust/10">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex justify-center items-center w-full">
            <img 
              src="https://drive.google.com/thumbnail?id=1JtI-8C6A7oxKRnEGLqCVXT46BxdjpkNY&sz=s800" 
              alt={RESTAURANT_NAME} 
              className="h-30 w-auto object-contain"
              onError={(e) => {
                // Fallback if logo.png is not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-12 h-12 bg-bakery-gold rounded-full flex items-center justify-center text-bakery-crust font-serif text-2xl shadow-sm border-2 border-bakery-warm">
              T
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-bakery-crust hidden sm:block">
              {RESTAURANT_NAME}
            </h1>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-bakery-flour rounded-full transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-bakery-cream text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        

        {/* Search & Filter */}
        <section className="mb-8 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bakery-crust/40" />
            <input 
              type="text"
              placeholder="Search for your favorite food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-bakery-crust/10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-bakery-warm/20 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide flex-nowrap md:justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  selectedCategory === cat 
                    ? "bg-bakery-crust text-bakery-cream shadow-md" 
                    : "bg-white text-bakery-crust border border-bakery-crust/10 hover:border-bakery-crust/30 "
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Menu Grid */}
        <section>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-bakery-warm border-t-transparent rounded-full animate-spin" />
              <p className="text-bakery-crust/60 font-serif italic">Preparing the oven...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-bakery-warm underline"
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-bakery-crust/60 italic">No items found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-bakery-crust/5 flex flex-col group"
                >
                  <div className="relative aspect-square md:aspect-[4/3] overflow-hidden">
                    <img 
                      src={resolveImageUrl(item.imageUrl)} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold text-bakery-warm shadow-sm">
                      {item.price.toLocaleString()} L.L
                    </div>
                  </div>
                  <div className="p-3 md:p-6 flex flex-col flex-grow">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-1 md:mb-2 gap-1">
                      <h3 className="text-sm md:text-xl font-bold text-bakery-crust line-clamp-1">{item.title}</h3>
                      <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-bakery-crust/40 px-1.5 py-0.5 bg-bakery-flour rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-bakery-crust/60 text-[10px] md:text-sm mb-3 md:mb-6 flex-grow line-clamp-2 italic">
                      {item.description}
                    </p>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-full py-2 md:py-3 bg-bakery-flour hover:bg-bakery-warm hover:text-white text-bakery-crust font-bold rounded-lg md:rounded-xl text-xs md:text-base transition-all flex items-center justify-center gap-1 md:gap-2 group/btn"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover/btn:rotate-90" />
                      Add
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-bakery-crust text-bakery-cream py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-serif">{RESTAURANT_NAME}</h3>
            <p className="text-bakery-cream/60 italic">
              Bringing the authentic taste of Western food to your table, every single day.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-sm text-bakery-gold">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-bakery-cream/80">
                <Phone className="w-4 h-4 text-bakery-gold" />
                <span>{WHATSAPP_NUMBER}</span>
              </li>
              <li className="flex items-center gap-3 text-bakery-cream/80">
                <MapPin className="w-4 h-4 text-bakery-gold" />
                <span>Lebanon, Tripoli</span>
              </li>
              <li className="flex items-center gap-3 text-bakery-cream/80">
                <Clock className="w-4 h-4 text-bakery-gold" />
                <span>Daily: 10:00 AM - 11:00 PM</span>
              </li>
            </ul>
          </div>
         </div> 
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-bakery-cream/10 text-center text-bakery-cream/40 text-sm">
          © {new Date().getFullYear()} {RESTAURANT_NAME}. All rights reserved.
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-bakery-cream shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-bakery-crust/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-bakery-warm" />
                  <h2 className="text-2xl font-serif">Your Order</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-bakery-flour rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-20 h-20 bg-bakery-flour rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-bakery-crust/20" />
                    </div>
                    <p className="text-bakery-crust/60 italic">Your cart is empty.<br/>Add some delicious items to get started!</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <img 
                          src={resolveImageUrl(item.imageUrl)} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-bakery-crust">{item.title}</h4>
                          <button 
                            onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                            className="text-bakery-crust/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-bakery-crust/40 mb-3">{item.price.toLocaleString()} L.L each</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-white border border-bakery-crust/10 rounded-lg px-2 py-1">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 hover:text-bakery-warm transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              className="p-1 hover:text-bakery-warm transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-bold text-bakery-warm">
                            {(item.price * item.quantity).toLocaleString()} L.L
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-bakery-crust/10 space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-serif italic">Subtotal</span>
                    <span className="font-bold text-2xl text-bakery-warm">{cartTotal.toLocaleString()} L.L</span>
                  </div>
                  <button 
                    onClick={sendOrder}
                    className="w-full py-4 bg-bakery-warm hover:bg-bakery-warm/90 text-white font-bold rounded-2xl shadow-lg shadow-bakery-warm/20 transition-all flex items-center justify-center gap-3 group"
                  >
                    Send Order to WhatsApp
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <p className="text-[10px] text-center text-bakery-crust/40 uppercase tracking-widest">
                    You will be redirected to WhatsApp to complete your order
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
