/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Coupon, Product } from '../types';
import { ShoppingBag, Calendar, Flame, Percent, Check, ShoppingCart, Search, MoreVertical, Headphones } from 'lucide-react';
import { motion } from 'motion/react';

interface MallTabProps {
  products: Product[];
  coupons: Coupon[];
  cartCount: number;
  onClaimCoupon: (couponId: string) => void;
  onProductClick: (product: Product) => void;
  onOpenCart: () => void;
  onOpenSupport: () => void;
}

export default function MallTab({
  products,
  coupons,
  cartCount,
  onClaimCoupon,
  onProductClick,
  onOpenCart,
  onOpenSupport
}: MallTabProps) {
  // Only show mall products or special brand products here
  const mallProducts = products.filter(p => p.isMall || p.price > 100);

  return (
    <div id="mall-tab-container" className="flex flex-col bg-slate-100 min-h-full pb-20 select-none">
      {/* 1. Mall Header */}
      <div id="mall-header" className="sticky top-0 bg-red-700 text-white px-3 pt-3 pb-3 z-30 shadow-md">
        <div id="mall-header-row" className="flex items-center justify-between gap-2">
          {/* Search bar */}
          <div id="mall-search-wrapper" className="flex-1 relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              id="mall-search-input"
              type="text"
              readOnly
              placeholder="Shopee Mall"
              className="w-full bg-white text-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none placeholder-red-700 font-sans font-bold"
            />
          </div>

          {/* Action Icons */}
          <div id="mall-header-actions" className="flex items-center gap-2">
            {/* Contact Support Icon */}
            <button
              id="support-button"
              onClick={onOpenSupport}
              className="relative p-1.5 bg-white/20 hover:bg-white/35 rounded-full transition-all flex items-center justify-center text-white border border-white/25 active:scale-95 cursor-pointer shadow-xs shrink-0"
              aria-label="Contact Support"
            >
              <Headphones className="w-4 h-4 text-white animate-pulse" />
            </button>
            <button id="mall-more-button" className="p-1 hover:bg-white/10 rounded-full transition-colors" aria-label="More options">
              <MoreVertical className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Brand Guarantee Banner */}
      <div id="mall-banner" className="bg-gradient-to-r from-red-800 to-orange-600 text-white p-4 relative overflow-hidden shadow-sm">
        <div className="absolute right-2 -bottom-2 opacity-15">
          <ShoppingBag className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <span className="bg-red-600 border border-white text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
            Shopee Mall
          </span>
          <h2 className="text-xl font-black mt-2 tracking-tight">แบรนด์แท้ คุ้มชัวร์ ✅</h2>
          <p className="text-xs text-yellow-300 font-bold mt-1">แบรนด์ฮิต ถูกสุดการันตี | โค้ดลดสูงสุด ฿2,000</p>
          <p className="text-[10px] text-white/90 mt-0.5">ส่งฟรี พรุ่งนี้ถึง มั่นใจของแท้ 100% คืนเงินได้ง่าย</p>
        </div>
      </div>

      {/* 3. Quick Brand Navigation Features */}
      <div id="mall-features" className="bg-white py-3 px-2 grid grid-cols-4 gap-1 text-center shadow-sm border-b border-slate-200">
        <div className="flex flex-col items-center cursor-pointer group">
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-amber-600 bg-amber-50 shadow-inner group-hover:scale-105 transition-transform relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-1 rounded-full uppercase scale-90">NEW</span>
          </div>
          <span className="text-[9px] text-slate-700 font-semibold mt-1.5 leading-tight">Shopee Premium</span>
        </div>

        <div className="flex flex-col items-center cursor-pointer group">
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-blue-600 bg-blue-50 shadow-inner group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[9px] text-slate-700 font-semibold mt-1.5 leading-tight">Brand Day Calendar</span>
        </div>

        <div className="flex flex-col items-center cursor-pointer group">
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-red-600 bg-red-50 shadow-inner group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-[9px] text-slate-700 font-semibold mt-1.5 leading-tight">Crazy Deals</span>
        </div>

        <div className="flex flex-col items-center cursor-pointer group">
          <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-orange-600 bg-orange-50 shadow-inner group-hover:scale-105 transition-transform">
            <Percent className="w-5 h-5" />
          </div>
          <span className="text-[9px] text-slate-700 font-semibold mt-1.5 leading-tight">Brand Deals</span>
        </div>
      </div>

      {/* 4. Shopee Mall Special Coupons */}
      <div id="mall-coupons-section" className="px-3 mt-4">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">โค้ดพิเศษจาก SHOPEE MALL</h3>
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
        </div>

        {/* Coupons Feed list */}
        <div id="mall-vouchers-list" className="space-y-2.5">
          {coupons.map((coupon) => {
            // Determine coupon styling
            const isKtc = coupon.type === 'ktc';
            const isKrungsri = coupon.type === 'krungsri';
            const bgClass = isKtc ? 'bg-gradient-to-r from-red-600 to-red-700' : isKrungsri ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-amber-500 to-orange-500';

            return (
              <div
                key={coupon.id}
                id={`coupon-card-${coupon.id}`}
                className="flex bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 relative"
              >
                {/* Left side Ticket Tag */}
                <div className={`w-28 ${bgClass} text-white flex flex-col items-center justify-center p-2 relative text-center border-r-2 border-dashed border-slate-200`}>
                  {/* Ticket notch cutouts */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-slate-100 rounded-full"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-slate-100 rounded-full z-10"></div>
                  
                  <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                    {coupon.type === 'mall' ? 'Mall' : coupon.type.toUpperCase()}
                  </span>
                  <p className="text-[11px] font-bold mt-1.5 leading-tight">
                    {coupon.brandName || 'ส่วนลดแบรนด์'}
                  </p>
                </div>

                {/* Right side Coupon Info */}
                <div id={`coupon-details-${coupon.id}`} className="flex-1 p-3 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">
                      {coupon.discountText}
                    </h4>
                    <p className="text-[10px] text-red-600 font-bold mt-0.5">
                      {coupon.minSpendText}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>{coupon.expiryText}</span>
                      <span>•</span>
                      <span className="text-blue-500 hover:underline cursor-pointer">เงื่อนไข</span>
                    </p>
                  </div>

                  {/* Claim Button */}
                  <button
                    id={`claim-btn-${coupon.id}`}
                    onClick={() => onClaimCoupon(coupon.id)}
                    disabled={coupon.isCollected}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm transition-all flex items-center gap-0.5 whitespace-nowrap ${
                      coupon.isCollected
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                    }`}
                  >
                    {coupon.isCollected ? (
                      <>
                        <Check className="w-3 h-3 text-teal-600" />
                        <span>เก็บแล้ว</span>
                      </>
                    ) : (
                      'เก็บโค้ด'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggregate Action Button like Shopee image */}
        <div id="collect-aggregate-vouchers" className="mt-3">
          <button
            id="collect-all-btn"
            onClick={() => {
              coupons.forEach(c => {
                if (!c.isCollected) onClaimCoupon(c.id);
              });
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition-colors text-center shadow-sm"
          >
            เก็บโค้ดพิเศษทั้งหมด ({coupons.filter(c => !c.isCollected).length}) โค้ด
          </button>
        </div>
      </div>

      {/* 5. Mall Featured Brand Products */}
      <div id="mall-products-section" className="px-3 mt-6">
        <div className="flex items-center gap-1.5 mb-3">
          <ShoppingBag className="w-4 h-4 text-red-700" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">แบรนด์แนะนำยอดนิยม</h3>
        </div>

        <div id="mall-products-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {mallProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onProductClick(product)}
              className="bg-white rounded-lg overflow-hidden border border-slate-200 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow relative"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-0 left-0 bg-red-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded-br uppercase tracking-wide">
                  Mall
                </span>
                {product.discount && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-red-700 text-[9px] font-black px-1.5 py-0.5">
                    {product.discount}
                  </div>
                )}
              </div>

              <div className="p-2 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
                    {product.title}
                  </h4>
                  <p className="text-[9px] text-red-700 font-bold mt-1">{product.shopName}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50">
                  <div className="flex items-baseline justify-between">
                    <span className="text-red-600 font-bold text-xs">฿{product.price.toLocaleString()}</span>
                    <span className="text-[8px] text-slate-400">{product.salesText}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
