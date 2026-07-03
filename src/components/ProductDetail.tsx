/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, Share2, MessageCircle, ShoppingCart, Star, ShieldCheck, MapPin, Truck, ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, variant?: string) => void;
  onBuyNow: (product: Product, quantity: number, variant?: string) => void;
  onOpenChatWithShop: (shopName: string, shopLogo: string) => void;
}

export default function ProductDetail({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenChatWithShop
}: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>(product.variants?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    // Disabled / do nothing by request
  };

  const handleBuyNow = () => {
    // Disabled / do nothing by request
  };

  return (
    <div className="fixed inset-0 bg-white z-45 flex flex-col select-none overflow-y-auto">
      {/* 1. Header Toolbar Overlay */}
      <div className="sticky top-0 bg-white border-b border-slate-100 px-3 py-3 flex items-center justify-between z-10 shadow-sm">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-slate-800 max-w-[200px] truncate">รายละเอียดสินค้า</span>
        <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 transition-colors" aria-label="Share">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Product Scroll Container */}
      <div className="flex-1 pb-24">
        {/* Banner image carousel */}
        <div className="aspect-square w-full bg-slate-50 relative overflow-hidden group">
          <img
            src={imagesList[activeImageIndex] || product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          
          {/* Left/Right Arrow Navigation */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {product.discount && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-red-600 font-black text-xs px-2 py-1 rounded-md shadow-sm z-10">
              ส่วนลด {product.discount}
            </div>
          )}

          {/* Dots / Thumbnails Indicators */}
          {imagesList.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
              {imagesList.map((_, idx) => (
                <button
                  key={`dot-idx-${idx}`}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'bg-orange-500 w-4' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Small thumbnails row below main image for rich multi-image feel */}
        {imagesList.length > 1 && (
          <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-150 overflow-x-auto">
            {imagesList.map((img, idx) => (
              <button
                key={`sub-thumb-idx-${idx}`}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  activeImageIndex === idx ? 'border-orange-500 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}

        {/* Info detail block */}
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            {product.isMall && (
              <span className="bg-red-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                Mall
              </span>
            )}
            <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-orange-100">
              ร้านแนะนำ Xtra
            </span>
          </div>

          <h1 className="text-sm font-bold text-slate-800 leading-snug">
            {product.title}
          </h1>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-red-600 font-extrabold text-xl">฿{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">฿{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Rating, Sales, and Share counts row */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 text-xs text-slate-500">
            <span className="flex items-center gap-0.5 font-bold text-amber-500">
              ★ {product.rating || '4.8'}
              <span className="text-slate-400 font-normal ml-1">({product.reviewsCount?.toLocaleString() || '1.2k'} รีวิว)</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>{product.salesText}</span>
          </div>
        </div>

        {/* Shopee Direct App Link Banner */}
        <div className="mx-4 mt-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="bg-white text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                Shopee App
              </span>
              <span className="text-[10px] font-bold text-orange-100">เชื่อมต่อแอปพลิเคชันอย่างปลอดภัย</span>
            </div>
            <h4 className="text-xs font-extrabold mt-1 truncate leading-snug">🛍️ ค้นหาและช้อปสินค้านี้จริงบน Shopee!</h4>
            <p className="text-[9px] text-orange-50/80 mt-0.5 font-medium line-clamp-1">เปิดร้านค้าแท้ในระบบเพื่อเลือกซื้อแบบเรียลไทม์</p>
          </div>
          <a
            href={`https://shopee.co.th/search?keyword=${encodeURIComponent(product.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-orange-600 hover:bg-orange-50 active:scale-95 px-3 py-2 rounded-xl text-center text-xs font-black flex items-center gap-1 transition-all shrink-0 shadow-sm"
          >
            <span>เปิดแอป</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Shipping & Delivery policy card */}
        <div className="p-4 bg-white border-b border-slate-100 mt-2.5 flex flex-col gap-3.5">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">ส่งไปยัง</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">เขตปทุมวัน, จังหวัดกรุงเทพมหานคร</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-teal-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">ค่าจัดส่ง ฿0 - ฿40</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="text-teal-600 font-bold">มีโค้ดส่งฟรี*</span>
                <span>•</span>
                <span>ได้รับของประมาณ: <strong className="text-slate-800">{product.deliveryTime}</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Variants Selection panel */}
        {product.variants && product.variants.length > 0 && (
          <div className="p-4 bg-white border-b border-slate-100 mt-2.5">
            <h4 className="text-xs font-bold text-slate-800 mb-3">ตัวเลือกสินค้า (Variants)</h4>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v, idx) => (
                <button
                  key={`${v}-${idx}`}
                  onClick={() => setSelectedVariant(v)}
                  className={`text-xs px-3.5 py-2 rounded-lg border font-medium transition-colors ${
                    selectedVariant === v
                      ? 'bg-red-50 text-red-600 border-red-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Quantity Adjuster */}
        <div className="p-4 bg-white border-b border-slate-100 mt-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">จำนวนที่ต้องการ</span>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-extrabold text-sm transition-colors"
            >
              -
            </button>
            <span className="px-4 text-xs font-bold text-slate-800 min-w-[30px] text-center bg-white border-x border-slate-100 py-1.5">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-extrabold text-sm transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Shop / Seller card */}
        <div className="p-4 bg-white border-b border-slate-100 mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <img
                src={product.image} // Re-use image or similar for shop logo fallback
                alt={product.shopName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">{product.shopName || 'Shopee Official Shop'}</h4>
              <p className="text-[10px] text-teal-600 flex items-center gap-0.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block animate-ping"></span>
                ออนไลน์กำลังตอบแชท
              </p>
            </div>
          </div>
          <button
            onClick={() => {}}
            className="text-xs text-slate-400 border border-slate-200 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed"
            disabled
          >
            พูดคุยเลย
          </button>
        </div>

        {/* Product description collapse box */}
        <div className="p-4 bg-white mt-2.5">
          <h4 className="text-xs font-bold text-slate-800 mb-2">รายละเอียดสินค้าแบบย่อ</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-sans whitespace-pre-line">
            {product.description || 'ไม่มีข้อมูลรายละเอียดสินค้าเพิ่มเติมสำหรับสินค้านี้ ทางเราจัดส่งสินค้าวันต่อวัน รวดเร็ว มั่นใจได้ของแท้แน่นอน'}
          </p>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2 mt-4">
            <ShieldCheck className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-[10px] text-slate-500 leading-normal">
              <span className="font-bold text-slate-800 block">ช้อปปี้การันตี มั่นใจได้รับของ</span>
              คืนเงินหากไม่ได้รับของ หรือได้รับของสภาพไม่สมบูรณ์ ตรวจเช็คข้อมูลละเอียดความปลอดภัยของลูกค้าเป็นสำคัญ
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Buttons Bar (Sticky) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-3 flex items-center gap-2.5 z-40 max-w-md mx-auto shadow-xl">
        {/* Add To Cart */}
        <button
          id="add-to-cart-action-btn"
          onClick={handleAddToCart}
          className="flex-1 bg-red-50 hover:bg-red-100 border border-red-500 text-red-600 font-extrabold text-xs py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>เพิ่มไปยังรถเข็น</span>
        </button>

        {/* Buy Now */}
        <button
          id="buy-now-action-btn"
          onClick={handleBuyNow}
          className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-extrabold text-xs py-2.5 rounded-lg transition-all text-center shadow-md active:scale-98"
        >
          ซื้อตอนนี้เลย
        </button>
      </div>

      {/* Floating Success Toast overlay */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-center z-50 shadow-2xl border border-white/10 flex flex-col items-center gap-1 max-w-[200px]">
          <span className="text-xl">🛒</span>
          <span className="text-xs font-bold font-sans">เพิ่มในรถเข็นสำเร็จ</span>
          <span className="text-[10px] text-white/70">เข้าไปตรวจสอบได้ในตลับรถเข็นเพื่อทำการเลือกส่วนลดและสั่งซื้อ</span>
        </div>
      )}
    </div>
  );
}
