/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, MessageCircle, Settings, ChevronRight, CreditCard, Box, Truck, Star, Heart, Percent, Sparkles, Coins, ArrowUpRight, HelpCircle, Shield, LifeBuoy, Headphones } from 'lucide-react';
import { motion } from 'motion/react';

interface MeTabProps {
  shopeeCoins: number;
  cartCount: number;
  chatUnreadCount: number;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  onOpenChat: () => void;
  ordersCount: {
    toPay: number;
    toShip: number;
    toReceive: number;
    toRate: number;
  };
  onCheckIn: () => void;
  hasCheckedInToday: boolean;
  onSelectTab: (tabIndex: number) => void;
  user: any;
  onLogout: () => void;
  onOpenAdminPanel: () => void;
  onOpenWallet: () => void;
}

export default function MeTab({
  shopeeCoins,
  cartCount,
  chatUnreadCount,
  onOpenCart,
  onOpenSupport,
  onOpenChat,
  ordersCount,
  onCheckIn,
  hasCheckedInToday,
  onSelectTab,
  user,
  onLogout,
  onOpenAdminPanel,
  onOpenWallet
}: MeTabProps) {
  return (
    <div id="me-tab-container" className="flex flex-col bg-slate-100 min-h-full pb-20 select-none">
      {/* 1. Header with Gradient Background */}
      <div id="me-header" className="bg-gradient-to-br from-orange-500 via-red-500 to-red-600 text-white pt-5 pb-6 px-4 shadow-md relative">
        {/* Top Control Bar */}
        <div id="me-header-controls" className="flex items-center justify-end gap-3.5 mb-4">
          {user?.role === 'admin' && (
            <button
              onClick={onOpenAdminPanel}
              className="bg-white text-orange-600 border border-white/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-orange-50 cursor-pointer shadow-sm animate-pulse"
            >
              <Shield className="w-3 h-3 fill-orange-600" />
              <span>หลังบ้านแอดมิน</span>
            </button>
          )}
          <Settings className="w-5.5 h-5.5 hover:rotate-45 transition-transform cursor-pointer" />
          
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

        {/* User profile layout */}
        <div id="me-profile-layout" className="flex items-center gap-3">
          {/* Avatar frame */}
          <div className="w-14 h-14 rounded-full bg-white border-2 border-white/40 overflow-hidden shadow">
            <img
              src={user?.role === 'admin' 
                ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80" 
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              }
              alt="User Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Identity details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base truncate">{user?.username || 'shopee_user'}</h3>
              <span className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/25">
                Level {user?.level || 1} &gt;
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs mt-1 text-orange-100 font-medium">
              <span><strong>{user?.role === 'admin' ? 'แอดมินระบบ' : 'พาร์ตเนอร์ลูกค้า'}</strong></span>
              <span>📱 {user?.phone || '090-000-0000'}</span>
            </div>
          </div>
        </div>

        {/* VIP Premium Promo banner */}
        <div id="me-vip-banner" className="mx-0 mt-5 bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-900 rounded-lg px-3 py-2 flex items-center justify-between shadow border border-yellow-200">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-600 animate-spin" />
            <span className="text-[10px] font-black uppercase bg-slate-900 text-amber-300 px-1.5 rounded-sm">VIP</span>
            <span className="text-[10px] font-bold">รับโค้ดสูงสุด 25% ทุกวัน และส่งฟรี* ขั้นต่ำ 0.-</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-800" />
        </div>
      </div>

      {/* 2. My Purchases Flow Layout */}
      <div id="me-purchases-card" className="mx-3 -mt-3 bg-white rounded-xl shadow-sm p-3 relative z-10 border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Box className="w-4 h-4 text-slate-700" /> การซื้อของฉัน
          </h4>
          <button
            onClick={() => onSelectTab(3)} // Jump to Notifications tab which manages order details
            className="text-[10px] text-slate-400 font-medium flex items-center"
          >
            ดูประวัติการซื้อ <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Steps grid */}
        <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-slate-600">
          <div className="flex flex-col items-center cursor-pointer py-1 hover:bg-slate-50 rounded-lg transition-colors relative">
            <CreditCard className="w-5 h-5 text-slate-700 mb-1" />
            <span>ที่ต้องชำระ</span>
            {ordersCount.toPay > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {ordersCount.toPay}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center cursor-pointer py-1 hover:bg-slate-50 rounded-lg transition-colors relative">
            <Box className="w-5 h-5 text-slate-700 mb-1" />
            <span>ที่ต้องจัดส่ง</span>
            {ordersCount.toShip > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {ordersCount.toShip}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center cursor-pointer py-1 hover:bg-slate-50 rounded-lg transition-colors relative">
            <Truck className="w-5 h-5 text-slate-700 mb-1" />
            <span>ที่ต้องได้รับ</span>
            {ordersCount.toReceive > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {ordersCount.toReceive}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center cursor-pointer py-1 hover:bg-slate-50 rounded-lg transition-colors relative">
            <Star className="w-5 h-5 text-slate-700 mb-1" />
            <span>ให้คะแนน</span>
            {ordersCount.toRate > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {ordersCount.toRate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Services Links Block */}
      <div id="me-services" className="mx-3 mt-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
        <div className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">🍔</span>
            <span className="text-xs font-semibold text-slate-800">ShopeeFood (ไทยช่วยไทย+)</span>
          </div>
          <span className="text-[10px] font-bold text-red-500 flex items-center">ลดสูงสุด 50% <ChevronRight className="w-4 h-4 text-slate-400" /></span>
        </div>

        <div className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500">📱</span>
            <span className="text-xs font-semibold text-slate-800">E-Service / E-Voucher</span>
          </div>
          <span className="text-[10px] font-bold text-teal-600 flex items-center">ส่วนลด ฿30 <ChevronRight className="w-4 h-4 text-slate-400" /></span>
        </div>
      </div>

      {/* 4. Wallet & Balances Section */}
      <div id="me-wallet-card" className="mx-3 mt-3 bg-white rounded-xl shadow-sm border border-slate-100 p-3">
        <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5 border-b border-slate-50 pb-2">
          💳 My Wallet
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* ShopeePay Card */}
          <div 
            onClick={onOpenWallet}
            className="bg-slate-50 hover:bg-orange-50/20 rounded-xl p-3 border border-slate-100 flex flex-col justify-between h-20 hover:border-orange-500 cursor-pointer transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold text-slate-500">ShopeePay Wallet</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black text-slate-800">
                ฿{typeof user?.balance === 'number' ? user.balance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '450.00'}
              </span>
              <span className="bg-orange-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded">เปิดใช้งานแล้ว</span>
            </div>
          </div>

          {/* Shopee Coins Check-in */}
          <div
            onClick={onCheckIn}
            className={`rounded-xl p-3 border flex flex-col justify-between h-20 cursor-pointer transition-colors ${hasCheckedInToday ? 'bg-slate-50 border-slate-100' : 'bg-amber-50/40 border-amber-200 hover:bg-amber-50/70'}`}
          >
            <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
              🪙 Shopee Coins
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black text-slate-800">{shopeeCoins} Coins</span>
              <span className={`font-extrabold text-[8px] px-2 py-0.5 rounded ${hasCheckedInToday ? 'bg-slate-200 text-slate-400' : 'bg-amber-500 text-white'}`}>
                {hasCheckedInToday ? 'เช็คอินแล้ว' : 'กดรับ Coins!'}
              </span>
            </div>
          </div>

          {/* SPayLater limit */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between h-20 hover:border-orange-200 cursor-pointer">
            <span className="text-[10px] font-bold text-slate-500">My SPayLater</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-semibold text-slate-500">วงเงิน ฿20,000</span>
              <span className="text-xs font-black text-orange-600">ช็อปก่อน จ่ายเดือนหน้า</span>
            </div>
          </div>

          {/* Coupons counts */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between h-20 hover:border-orange-200 cursor-pointer">
            <span className="text-[10px] font-bold text-slate-500">โค้ดส่วนลดของฉัน</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black text-slate-800">52 โค้ด</span>
              <span className="bg-red-50 text-red-500 font-extrabold text-[8px] px-2 py-0.5 rounded border border-red-100">
                หมดอายุวันนี้ (3)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Financial Services */}
      <div id="me-finance" className="mx-3 mt-3 bg-white rounded-xl shadow-sm border border-slate-100 p-3 mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            📊 บริการทางการเงิน
          </h4>
          <span className="text-[10px] text-slate-400 font-medium flex items-center">ดูเพิ่มเติม <ChevronRight className="w-3.5 h-3.5" /></span>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between cursor-pointer group">
            <div>
              <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-500">SEasyCash</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">รับวงเงินกู้ยืมสูงสุดถึง ฿100,000 สมัครง่ายผ่านแอปได้ทันที</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between cursor-pointer group">
            <div>
              <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-500">ประกันภัย Shopee</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">คุ้มครองชีวิต สุขภาพ และพัสดุ ด่วน! ผ่อนชำระ 0% ผ่าน SPayLater</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* 6. Sign Out Button */}
      <div className="mx-3 mb-8">
        <button
          onClick={onLogout}
          className="w-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs py-3 rounded-xl border border-red-200/50 hover:border-red-300 transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-xs cursor-pointer"
        >
          <span>ออกจากระบบบัญชีผู้ใช้</span>
        </button>
      </div>
    </div>
  );
}
