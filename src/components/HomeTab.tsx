/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Search, Camera, ShoppingCart, MessageCircle, Percent, Gift, Truck, Smartphone, Flame, Utensils, Zap, CheckCircle, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeTabProps {
  products: Product[];
  cartCount: number;
  chatUnreadCount: number;
  shopeeCoins: number;
  onProductClick: (product: Product) => void;
  onCheckIn: () => void;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  onOpenChat: () => void;
  onSearch: (query: string) => void;
  hasCheckedInToday: boolean;
  settings?: any;
  onOpenWallet?: (tab?: 'history' | 'withdraw') => void;
}

const CAMPAIGNS = [
  { id: 'c1', title: 'PAY DAY', desc: 'เงินออกช้อปเลย', discount: 'โค้ดลดสูงสุด 30%', btnText: 'ช้อปเลย >', bg: 'from-orange-500 via-red-600 to-pink-600' },
  { id: 'c2', title: 'Shopee VIP', desc: 'สิทธิพิเศษเหนือใคร', discount: 'โค้ดลด 50%', btnText: 'สมัคร 1.- >', bg: 'from-blue-600 via-indigo-600 to-purple-600' },
  { id: 'c3', title: 'โค้ดลดคุ้ม Xtra', desc: 'ลดทุกหมวดหมู่', discount: 'ส่วนลดสูงสุด 30%', btnText: 'ดูเพิ่มเติม >', bg: 'from-red-600 to-orange-500' }
];

export default function HomeTab({
  products,
  cartCount,
  chatUnreadCount,
  shopeeCoins,
  onProductClick,
  onCheckIn,
  onOpenCart,
  onOpenSupport,
  onOpenChat,
  onSearch,
  hasCheckedInToday,
  settings,
  onOpenWallet
}: HomeTabProps) {
  const [searchVal, setSearchVal] = useState('');
  const [activeCampaignIdx, setActiveCampaignIdx] = useState(0);

  const campaigns = (settings?.slides && settings.slides.length > 0) ? settings.slides : CAMPAIGNS;

  // Auto scroll campaign banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCampaignIdx((prev) => (prev + 1) % campaigns.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [campaigns.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    p.location.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div id="home-tab-container" className="flex flex-col bg-slate-50 min-h-full pb-20 select-none">
      {/* 1. Header (Sticky) */}
      <div id="home-header" className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 pt-3 pb-3 z-30 shadow-md">
        <div id="home-header-row" className="flex items-center justify-between gap-2">
          {/* Search bar */}
          <form id="search-form" onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div id="search-input-wrapper" className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                id="search-input"
                type="text"
                placeholder="SF Cinema ตั๋วหนัง"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full bg-white text-slate-800 rounded-lg pl-9 pr-9 py-1.5 text-sm focus:outline-none placeholder-slate-400 font-sans"
              />
              <Camera className="absolute right-3 w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
            </div>
          </form>

          {/* Action Icons */}
          <div id="header-actions" className="flex items-center gap-2 relative">
            {/* Contact Support Icon */}
            <button
              id="support-button"
              onClick={onOpenSupport}
              className="relative p-1.5 bg-white/20 hover:bg-white/35 rounded-full transition-all flex items-center justify-center text-white border border-white/25 active:scale-95 cursor-pointer shadow-xs shrink-0"
              aria-label="Contact Support"
            >
              <Headphones className="w-4 h-4 text-white animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Shopee Pay & Coins Check-in Board */}
      <div id="quick-wallet-section" className="mx-3 mt-3 bg-white rounded-xl shadow-sm border border-slate-100 p-3">
        <div id="wallet-grid" className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* ShopeePay */}
          <button
            id="wallet-shopeepay"
            onClick={() => onOpenWallet?.('withdraw')}
            className="flex flex-col items-center justify-between border-r border-slate-100 py-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors text-center w-full"
          >
            <span className="text-[10px] font-bold text-red-500 tracking-wide">S ShopeePay</span>
            <span className="text-[9px] text-slate-500 mt-1">รับ Coins เพิ่ม</span>
          </button>

          {/* Coins Check-in */}
          <button
            id="wallet-checkin"
            onClick={onCheckIn}
            disabled={hasCheckedInToday}
            className="flex flex-col items-center justify-between border-r border-slate-100 py-1 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-90 w-full"
          >
            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 justify-center">
              🪙 Check-in
            </span>
            <span className="text-[9px] text-slate-500 mt-1">
              {hasCheckedInToday ? 'รับคอยน์แล้ว' : 'รับ coin ฟรี!'}
            </span>
          </button>

          {/* SPayLater */}
          <a
            id="wallet-spaylater"
            href="https://shopee.co.th/m/SPayLater-intro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-between border-r border-slate-100 py-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors w-full block text-center"
          >
            <span className="text-[10px] font-bold text-orange-600">SPayLater</span>
            <span className="text-[9px] text-slate-500 mt-1">สูงสุด 20,000.-</span>
          </a>

          {/* Coupons Wallet link */}
          <a
            id="wallet-coupons"
            href="https://th.shp.ee/dX5XrshZ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-between py-1 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors w-full block text-center"
          >
            <div className="flex justify-center w-full">
              <Percent className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-[9px] text-slate-500 mt-1">โค้ดส่วนลด 50+</span>
          </a>
        </div>
      </div>

      {/* 3. Horizontal Menu Services (Icons Section) */}
      <div id="services-grid-wrapper" className="px-3 mt-4">
        <div id="services-grid" className="grid grid-cols-5 gap-y-4 gap-x-2 text-center">
          <a
            id="btn-shopeefood"
            href={settings?.shopeefoodUrl || "https://th.shp.ee/vSLR2HS9"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            {/* Custom ShopeeFood Original Logo */}
            <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform relative overflow-hidden aspect-square">
              <img
                src={settings?.shopeefoodLogo || "https://logos-world.net/wp-content/uploads/2022/11/ShopeeFood-Logo.png"}
                alt={settings?.shopeefoodLabel || "ShopeeFood"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[10px] text-slate-700 font-medium leading-tight">{settings?.shopeefoodLabel || "ShopeeFood"}</span>
            {settings?.shopeefoodSubLabel && (
              <span className="text-[8px] text-red-500 font-bold leading-tight">{settings.shopeefoodSubLabel}</span>
            )}
          </a>

          <a
            id="btn-freeshipping"
            href={settings?.freeshippingUrl || "https://th.shp.ee/dX5XrshZ"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            {settings?.freeshippingLogo ? (
              <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform relative overflow-hidden aspect-square">
                <img
                  src={settings.freeshippingLogo}
                  alt={settings?.freeshippingLabel || "ส่งฟรี* +"}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 mb-1 group-hover:scale-105 transition-transform shadow-sm aspect-square">
                <Truck className="w-6 h-6" />
              </div>
            )}
            <span className="text-[10px] text-slate-700 font-medium leading-tight">{settings?.freeshippingLabel || "ส่งฟรี* +"}</span>
            <span className="text-[8px] text-teal-600 font-bold leading-tight">{settings?.freeshippingSubLabel !== undefined ? settings.freeshippingSubLabel : "โค้ดลดทั้งแอป"}</span>
          </a>

          <a
            id="btn-payday"
            href={settings?.paydayUrl || "https://th.shp.ee/EvpbriqW"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            {settings?.paydayLogo ? (
              <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform relative overflow-hidden aspect-square">
                <img
                  src={settings.paydayLogo}
                  alt={settings?.paydayLabel || "PAY DAY"}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 mb-1 group-hover:scale-105 transition-transform shadow-sm aspect-square">
                <Gift className="w-6 h-6" />
              </div>
            )}
            <span className="text-[10px] text-slate-700 font-medium leading-tight">{settings?.paydayLabel || "PAY DAY"}</span>
            <span className="text-[8px] text-pink-600 font-bold leading-tight">{settings?.paydaySubLabel !== undefined ? settings.paydaySubLabel : "6.25 ช้อปเลย"}</span>
          </a>

          <a
            id="btn-instantdelivery"
            href={settings?.instantUrl || "https://th.shp.ee/CSRKfM1g"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            {settings?.instantLogo ? (
              <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform relative overflow-hidden aspect-square">
                <img
                  src={settings.instantLogo}
                  alt={settings?.instantLabel || "สั่งปุ๊บ ส่งปั๊บ"}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-1 group-hover:scale-105 transition-transform shadow-sm aspect-square">
                <Zap className="w-6 h-6" />
              </div>
            )}
            <span className="text-[10px] text-slate-700 font-medium leading-tight">{settings?.instantLabel || "สั่งปุ๊บ ส่งปั๊บ"}</span>
            <span className="text-[8px] text-blue-600 font-bold leading-tight">{settings?.instantSubLabel !== undefined ? settings.instantSubLabel : "รับทันที"}</span>
          </a>

          <a
            id="btn-flashdeal"
            href={settings?.flashdealUrl || "https://th.shp.ee/VqGS57C3"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
          >
            {settings?.flashdealLogo ? (
              <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform relative overflow-hidden aspect-square">
                <img
                  src={settings.flashdealLogo}
                  alt={settings?.flashdealLabel || "Flash Deal"}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mb-1 group-hover:scale-105 transition-transform shadow-sm aspect-square">
                <Flame className="w-6 h-6" />
              </div>
            )}
            <span className="text-[10px] text-slate-700 font-medium leading-tight">{settings?.flashdealLabel || "Flash Deal"}</span>
            <span className="text-[8px] text-amber-600 font-bold leading-tight">{settings?.flashdealSubLabel !== undefined ? settings.flashdealSubLabel : "ดีลเด็ดด่วน"}</span>
          </a>
        </div>
      </div>

      {/* 4. Rotating Dynamic Banner */}
      <div id="dynamic-banners-section" className="px-3 mt-4">
        <div className="relative overflow-hidden rounded-xl h-28 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCampaignIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 text-white p-4 flex flex-col justify-between"
            >
              {/* Background gradient or image */}
              {campaigns[activeCampaignIdx]?.image ? (
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={campaigns[activeCampaignIdx].image}
                    alt={campaigns[activeCampaignIdx].title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${campaigns[activeCampaignIdx]?.bg || 'from-orange-500 via-red-600 to-pink-600'}`}></div>
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="bg-yellow-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {campaigns[activeCampaignIdx]?.title}
                  </span>
                  <span className="text-xs font-semibold opacity-90">{campaigns[activeCampaignIdx]?.desc}</span>
                </div>
                <h3 className="text-lg font-bold mt-1 tracking-tight">{campaigns[activeCampaignIdx]?.discount}</h3>
              </div>
              
              <div className="relative z-10 flex justify-between items-center">
                <span className="text-[10px] text-white/80">แคมเปญสุดเอ็กซ์คลูซีฟเฉพาะวันนี้</span>
                <span className="bg-white/25 backdrop-blur-md hover:bg-white/40 text-white text-[10px] font-bold px-3 py-1 rounded-full transition-colors">
                  {campaigns[activeCampaignIdx]?.btnText || 'ช้อปเลย >'}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Indicators */}
        <div id="banner-indicators" className="flex justify-center gap-1 mt-2">
          {campaigns.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCampaignIdx(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === activeCampaignIdx ? 'w-4 bg-orange-500' : 'w-1.5 bg-slate-300'}`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 5. Product Feed Section */}
      <div id="product-feed-section" className="px-3 mt-4">
        {/* Section Header */}
        <div id="feed-header" className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1 bg-red-500 h-4 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-800">สินค้าแนะนำประจำวัน (Daily Discover)</h2>
          </div>
          <span className="text-xs text-orange-500 font-bold hover:underline cursor-pointer">ดูทั้งหมด &gt;</span>
        </div>

        {/* Dynamic empty/search state */}
        {filteredProducts.length === 0 ? (
          <div id="search-empty-state" className="flex flex-col items-center justify-center py-10 bg-white rounded-xl border border-slate-100">
            <p className="text-slate-400 text-xs">ไม่พบสินค้าที่ตรงกับการค้นหาของคุณ</p>
            <button
              onClick={() => {
                setSearchVal('');
                onSearch('');
              }}
              className="mt-3 text-xs bg-orange-500 text-white px-4 py-1.5 rounded-full font-bold hover:bg-orange-600 transition-colors"
            >
              ดูสินค้าทั้งหมด
            </button>
          </div>
        ) : (
          /* Grid list (Responsive columns to fit any laptop, tablet, or smartphone) */
          <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="bg-white rounded-lg overflow-hidden border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow relative"
                whileTap={{ scale: 0.98 }}
              >
                {/* Product Image & Badges */}
                <div id={`product-img-wrap-${product.id}`} className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Discount Badge */}
                  {product.discount && (
                    <div id={`discount-badge-${product.id}`} className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-bl">
                      {product.discount}
                    </div>
                  )}

                  {/* Free shipping & cashback overlay tag like Shopee */}
                  <div className="absolute bottom-1 left-1 flex flex-col gap-0.5">
                    {product.isLive && (
                      <span className="bg-red-500 text-white text-[8px] font-bold px-1 rounded flex items-center gap-0.5 w-fit">
                        <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>
                        LIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Content info */}
                <div id={`product-info-${product.id}`} className="p-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 className="text-xs text-slate-800 line-clamp-2 leading-snug font-medium mb-1">
                      {product.title}
                    </h3>

                    {/* Promotion highlights */}
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {product.isHot && (
                        <span className="bg-orange-50 text-orange-600 text-[8px] font-bold px-1 py-0.5 rounded border border-orange-200">
                          สินค้าขายดี
                        </span>
                      )}
                      <span className="bg-red-50 text-red-500 text-[8px] font-bold px-1 py-0.5 rounded border border-red-100">
                        ร้านโค้ดคุ้ม
                      </span>
                      <span className="bg-teal-50 text-teal-600 text-[8px] font-bold px-1 py-0.5 rounded border border-teal-100">
                        ส่งฟรี*
                      </span>
                    </div>
                  </div>

                  {/* Price, Sales, Location */}
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-red-500 font-bold text-sm">
                        ฿{product.price.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {product.salesText}
                      </span>
                    </div>

                    {/* Delivery speed & Province */}
                    <div className="mt-1.5 border-t border-slate-50 pt-1.5 flex items-center justify-between text-[8px] text-slate-400">
                      <span className="font-medium text-teal-600">{product.deliveryTime}</span>
                      <span className="truncate max-w-[70px]">{product.location.replace('จังหวัด', '')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
