/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NotificationItem, OrderDetails } from '../types';
import { ShoppingCart, MessageCircle, ArrowRight, CheckCircle2, ChevronRight, Gift, Film, Coins, Bell, Check, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsTabProps {
  notifications: NotificationItem[];
  cartCount: number;
  chatUnreadCount: number;
  onConfirmReceipt: (orderId: string) => void;
  onOpenCart: () => void;
  onOpenSupport: () => void;
  onOpenChat: () => void;
}

export default function NotificationsTab({
  notifications,
  cartCount,
  chatUnreadCount,
  onConfirmReceipt,
  onOpenCart,
  onOpenSupport,
  onOpenChat
}: NotificationsTabProps) {
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'promotion' | 'order' | 'finance'>('all');

  // Separating notifications based on types
  const orderNotifs = notifications.filter(n => n.type === 'order');
  const promoNotifs = notifications.filter(n => n.type === 'promotion' || n.type === 'shopee');

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'promotion') return n.type === 'promotion' || n.type === 'shopee';
    return n.type === activeFilter;
  });

  const handleNotificationClick = (item: NotificationItem) => {
    if (item.order) {
      setSelectedOrderDetails(item.order);
    }
  };

  return (
    <div id="notifications-tab-container" className="flex flex-col bg-slate-50 min-h-full pb-20 select-none">
      {/* 1. Header */}
      <div id="notif-header" className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 z-30 shadow-sm flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">การแจ้งเตือน</h2>

        <div id="notif-actions" className="flex items-center gap-2">
          {/* Contact Support Icon */}
          <button
            id="support-button"
            onClick={onOpenSupport}
            className="relative p-1.5 bg-red-50 hover:bg-red-100 rounded-full transition-all flex items-center justify-center text-red-600 border border-red-100 active:scale-95 cursor-pointer shadow-xs shrink-0"
            aria-label="Contact Support"
          >
            <Headphones className="w-4 h-4 text-red-600 animate-pulse" />
          </button>
        </div>
      </div>

      {/* 2. Order Updates Panel Group */}
      {orderNotifs.length > 0 && (
        <div id="order-updates-panel" className="bg-white px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">
                {orderNotifs.length}
              </span>
              <span className="text-xs font-bold text-slate-800">อัปเดตคำสั่งซื้อ</span>
            </div>
            <button className="text-[11px] text-slate-400 font-medium flex items-center gap-0.5">
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Order Notifications list */}
          <div id="order-notifs-list" className="space-y-4">
            {orderNotifs.map((item, idx) => (
              <div
                key={`order-notif-${item.id}-${idx}`}
                onClick={() => handleNotificationClick(item)}
                className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-100"
              >
                {/* Product Thumbnail or delivery indicator */}
                <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Text detail block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    {item.statusText && (
                      <span className="bg-teal-50 text-teal-600 text-[9px] font-extrabold px-1 rounded border border-teal-100 uppercase tracking-wider">
                        {item.statusText}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block font-mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Category Filter Tabs Row */}
      <div id="notif-filters-rail" className="bg-white py-3 px-3 mt-3 border-b border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 mb-3.5">อัปเดตล่าสุด</h3>

        <div id="filters-flex" className="grid grid-cols-5 gap-1 text-center">
          {/* Important */}
          <div
            onClick={() => setActiveFilter('all')}
            className={`flex flex-col items-center cursor-pointer p-1 rounded-lg transition-colors ${activeFilter === 'all' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <div className="w-9 h-9 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 mb-1 relative shadow-sm">
              <Gift className="w-4 h-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <span className="text-[9px] font-semibold leading-tight">โปรดปราน</span>
          </div>

          {/* Promotion */}
          <div
            onClick={() => setActiveFilter('promotion')}
            className={`flex flex-col items-center cursor-pointer p-1 rounded-lg transition-colors ${activeFilter === 'promotion' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <div className="w-9 h-9 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-1 shadow-sm">
              <Gift className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold leading-tight">โปรโมชั่น</span>
          </div>

          {/* Live & Prizes */}
          <div className="flex flex-col items-center cursor-pointer p-1 text-slate-600 hover:bg-slate-50 rounded-lg">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 mb-1 shadow-sm">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold leading-tight">Live & Prizes</span>
          </div>

          {/* Finance */}
          <div
            onClick={() => setActiveFilter('finance')}
            className={`flex flex-col items-center cursor-pointer p-1 rounded-lg transition-colors ${activeFilter === 'finance' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-1 shadow-sm">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold leading-tight">การเงิน</span>
          </div>

          {/* Shopee Update */}
          <div className="flex flex-col items-center cursor-pointer p-1 text-slate-600 hover:bg-slate-50 rounded-lg">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-1 shadow-sm">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold leading-tight">ข่าวสาร</span>
          </div>
        </div>
      </div>

      {/* 4. Latest News List */}
      <div id="general-notifs-list" className="bg-white flex-1 divide-y divide-slate-100">
        {filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Bell className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs">ไม่มีการแจ้งเตือนประเภทนี้</p>
          </div>
        ) : (
          filteredNotifs.map((item, idx) => (
            <div
              key={`filtered-notif-${item.id}-${idx}`}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 ${!item.read ? 'bg-red-50/20' : ''}`}
            >
              {/* Notification icon circle */}
              <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center">
                {item.type === 'promotion' ? (
                  <Gift className="w-4 h-4 text-red-500" />
                ) : item.type === 'shopee' ? (
                  <Gift className="w-4 h-4 text-orange-500" />
                ) : item.type === 'finance' ? (
                  <Coins className="w-4 h-4 text-blue-500" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-500" />
                )}
              </div>

              {/* Text info and red dot marker */}
              <div className="flex-1 min-w-0 relative">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800 pr-4">{item.title}</h4>
                  {!item.read && (
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 absolute top-1 right-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {item.message}
                </p>
                <span className="text-[9px] text-slate-400 mt-1.5 block font-mono">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ORDER INTERACTIVE MODAL PANEL */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50">
            {/* Modal frame */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-2xl w-full max-w-md p-4 pb-8 text-slate-800 shadow-2xl border-t border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-slate-900">รายละเอียดคำสั่งซื้อ</h3>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ปิด
                </button>
              </div>

              {/* Order Info Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>เลขที่ออเดอร์: <strong className="font-mono text-slate-700">{selectedOrderDetails.orderId}</strong></span>
                  <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-bold border border-orange-100">
                    {selectedOrderDetails.status === 'to_receive' ? 'รอรับสินค้า' : selectedOrderDetails.status === 'to_rate' ? 'รอให้คะแนน' : 'เสร็จสมบูรณ์'}
                  </span>
                </div>

                <div className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <img
                    src={selectedOrderDetails.productImage}
                    alt={selectedOrderDetails.productName}
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{selectedOrderDetails.productName}</h4>
                    {selectedOrderDetails.variant && (
                      <p className="text-[10px] text-slate-400 mt-0.5">ตัวเลือก: {selectedOrderDetails.variant}</p>
                    )}
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="text-red-600 text-xs font-bold">฿{selectedOrderDetails.price}</span>
                      <span className="text-[10px] text-slate-400">จำนวน x{selectedOrderDetails.quantity}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping tracker flow chart */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <h4 className="text-[11px] font-bold text-slate-800 mb-2.5">ความคืบหน้าการจัดส่ง</h4>
                  <div className="space-y-3 relative pl-4 border-l border-orange-200 ml-1">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <Check className="w-2 h-2 text-white" />
                      </span>
                      <p className="text-[11px] font-bold text-slate-800">สินค้าส่งถึงผู้รับเรียบร้อยแล้ว</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">พัสดุถูกวางไว้ที่จุดรับของนิติบุคคล / ผู้รับเซ็นชื่อตรวจรับ</p>
                    </div>
                    <div>
                      <span className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 bg-orange-300 rounded-full border-2 border-white"></span>
                      <p className="text-[11px] text-slate-600">พัสดุออกเพื่อนำจ่ายให้กับผู้รับ</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">เจ้าหน้าที่นำส่งกำลังพยายามติดต่อโทรหาผู้รับ</p>
                    </div>
                    <div>
                      <span className="absolute -left-[21px] top-0.5 w-3.5 h-3.5 bg-slate-200 rounded-full border-2 border-white"></span>
                      <p className="text-[11px] text-slate-400">ผู้ส่งทำการเตรียมพัสดุเข้าระบบสำเร็จ</p>
                    </div>
                  </div>
                </div>

                {/* Primary Interactive buttons based on Order Status */}
                <div className="pt-2">
                  {selectedOrderDetails.status === 'to_receive' ? (
                    <button
                      onClick={() => {
                        onConfirmReceipt(selectedOrderDetails.orderId);
                        setSelectedOrderDetails(null);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs py-2.5 rounded-lg transition-all text-center shadow"
                    >
                      ฉันได้รับสินค้าชิ้นนี้แล้ว (ยืนยันรับเงินโอน)
                    </button>
                  ) : (
                    <div className="text-center text-xs text-slate-400 bg-slate-100 py-2 rounded-lg">
                      ออเดอร์นี้เสร็จสิ้นแล้ว ขอบคุณสำหรับการซื้อสินค้า! 🎉
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
