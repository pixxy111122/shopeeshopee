/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';
import { X, Check, Trash2, Tag, ChevronRight, Truck, ShoppingBag, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartModalProps {
  cartItems: CartItem[];
  claimedCoupons: Coupon[];
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleSelectItem: (id: string) => void;
  onCheckout: (selectedItems: CartItem[], appliedCoupon: Coupon | null) => void;
}

export default function CartModal({
  cartItems,
  claimedCoupons,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelectItem,
  onCheckout
}: CartModalProps) {
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'congrats'>('cart');
  const [checkoutSummary, setCheckoutSummary] = useState({ itemsTotal: 0, discount: 0, finalTotal: 0 });

  // Filter claimed coupons (isCollected)
  const availableVouchers = claimedCoupons.filter(c => c.isCollected);

  // Calculate totals
  const selectedItems = cartItems.filter(item => item.selected);
  const itemsSubtotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Calculate discount based on active coupon
  const activeCoupon = availableVouchers.find(c => c.id === selectedCouponId);
  let discountAmount = 0;
  let couponError = '';

  if (activeCoupon) {
    // Parse minimum spend
    const minSpendMatch = activeCoupon.minSpendText.match(/\d+/);
    const minSpend = minSpendMatch ? parseInt(minSpendMatch[0], 10) : 0;

    if (itemsSubtotal < minSpend) {
      couponError = `ยอดซื้อไม่ถึงขั้นต่ำ ฿${minSpend} สำหรับคูปองนี้`;
    } else {
      // Calculate coupon discount
      if (activeCoupon.discountText.includes('%')) {
        const pctMatch = activeCoupon.discountText.match(/\d+%/);
        const maxMatch = activeCoupon.discountText.match(/สูงสุด ฿\d+/);
        
        const percentage = pctMatch ? parseInt(pctMatch[0].replace('%', ''), 10) : 0;
        const maxDiscount = maxMatch ? parseInt(maxMatch[0].replace('สูงสุด ฿', ''), 10) : 99999;

        const calculated = Math.floor(itemsSubtotal * (percentage / 100));
        discountAmount = Math.min(calculated, maxDiscount);
      } else {
        // Flat discount
        const flatMatch = activeCoupon.discountText.match(/ส่วนลด ฿\d+/);
        discountAmount = flatMatch ? parseInt(flatMatch[0].replace('ส่วนลด ฿', ''), 10) : 40; // fallback
      }
    }
  }

  const finalTotal = Math.max(0, itemsSubtotal - discountAmount);

  const handleCheckoutSubmit = () => {
    if (selectedItems.length === 0) return;
    setIsCheckingOut(true);

    // Record summary details to display on congratulations popup
    setCheckoutSummary({
      itemsTotal: itemsSubtotal,
      discount: discountAmount,
      finalTotal: finalTotal
    });

    // Simulate standard transaction settlement
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutStep('congrats');
      // Execute global checkout callback to clear state, add notifications, and increment balances
      onCheckout(selectedItems, activeCoupon || null);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center select-none">
      {/* Background close overlay */}
      <div className="absolute inset-0" onClick={checkoutStep === 'cart' ? onClose : undefined}></div>

      {/* Main Cart Panel frame */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white rounded-t-3xl w-full max-w-md p-4 pb-8 text-slate-800 shadow-2xl relative z-10 border-t border-slate-200"
      >
        <AnimatePresence mode="wait">
          {checkoutStep === 'cart' ? (
            /* CART CHECKOUT VIEW */
            <motion.div
              key="cart-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Header Title */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🛒</span>
                  <h3 className="font-extrabold text-sm text-slate-900">รถเข็นของฉัน ({cartItems.length})</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Products selection list */}
              <div id="cart-items-wrapper" className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <ShoppingBag className="w-10 h-10 opacity-30 mb-2.5" />
                    <p className="text-xs">รถเข็นของคุณว่างเปล่า</p>
                    <button
                      onClick={onClose}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow"
                    >
                      ช้อปสินค้าแนะนำต่อ
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex bg-slate-50 border border-slate-100 rounded-xl p-2.5 gap-2.5 items-center relative hover:border-slate-200 transition-colors"
                    >
                      {/* Selection checkbox */}
                      <button
                        onClick={() => onToggleSelectItem(item.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          item.selected
                            ? 'bg-red-600 border-red-600 text-white shadow-sm'
                            : 'bg-white border-slate-300 hover:border-slate-400'
                        }`}
                        aria-label={item.selected ? "Deselect item" : "Select item"}
                      >
                        {item.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Thumbnail photo */}
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      {/* Product identity details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate pr-4">
                          {item.product.title}
                        </h4>
                        {item.selectedVariant && (
                          <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block">
                            ตัวเลือก: {item.selectedVariant}
                          </span>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-red-600 font-extrabold text-xs">
                            ฿{item.product.price}
                          </span>

                          {/* Quantity control adjust buttons */}
                          <div className="flex items-center border border-slate-200 rounded bg-white">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(item.id, item.quantity - 1);
                                } else {
                                  onRemoveItem(item.id);
                                }
                              }}
                              className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-[10px] text-slate-800 font-bold bg-slate-50 border-x border-slate-100 py-0.5">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Delete trash action icon */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Vouchers Selection Area if cart not empty */}
              {cartItems.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-2">
                    <Tag className="w-4 h-4 text-orange-500" />
                    <span>ใช้คูปองส่วนลด / ช้อปปี้โค้ด (Vouchers)</span>
                  </div>

                  {availableVouchers.length === 0 ? (
                    <p className="text-[10px] text-slate-400">คุณยังไม่ได้กดเก็บคูปองใดๆ เข้าไปเก็บโค้ดได้ที่หน้า 'Mall'</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[12vh] overflow-y-auto">
                      {availableVouchers.map((coupon) => (
                        <div
                          key={coupon.id}
                          onClick={() => {
                            if (selectedCouponId === coupon.id) {
                              setSelectedCouponId(null);
                            } else {
                              setSelectedCouponId(coupon.id);
                            }
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            selectedCouponId === coupon.id
                              ? 'bg-red-50/50 border-red-500 text-red-700 font-semibold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                              {coupon.type === 'mall' ? 'Mall' : coupon.type.toUpperCase()}
                            </span>
                            <span className="truncate max-w-[180px]">{coupon.discountText} ({coupon.brandName})</span>
                          </div>
                          <span className="text-[9px] text-slate-400">{coupon.minSpendText}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {couponError && (
                    <div className="mt-2 text-[10px] text-red-500 flex items-center gap-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{couponError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Summary lists */}
              {selectedItems.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>ยอดรวมสินค้า ({selectedItems.length} ชิ้น):</span>
                    <span className="text-slate-800 font-bold">฿{itemsSubtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>ส่วนลดคูปอง ({activeCoupon?.brandName || 'แบรนด์'}):</span>
                      <span className="font-extrabold">-฿{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>ค่าจัดส่ง:</span>
                    <span className="text-teal-600 font-extrabold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> ส่งฟรี ฿0
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-50 pt-2">
                    <span>ยอดชำระสุทธิ:</span>
                    <span className="text-red-600 text-base">฿{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Primary action buttons */}
              {cartItems.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={selectedItems.length === 0 || isCheckingOut || !!couponError}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 active:scale-98 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs py-3 rounded-xl transition-all text-center shadow-lg flex items-center justify-center gap-2"
                  >
                    {isCheckingOut ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        <span>กำลังประมวลผลคำสั่งซื้อ...</span>
                      </>
                    ) : (
                      <>
                        <span>ทำการชำระเงิน (Checkout) ฿{finalTotal.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* CONGRATULATIONS CELEBRATION VIEW */
            <motion.div
              key="congrats-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto border-4 border-teal-50 shadow-md">
                <Check className="w-9 h-9 stroke-[3.5]" />
              </div>

              <div>
                <h3 className="font-black text-lg text-slate-800">สั่งซื้อสินค้าสำเร็จแล้ว! 🎉</h3>
                <p className="text-xs text-slate-400 mt-1">คลังเตรียมคัดแยกพัสดุและจัดส่งรอบพิเศษให้กับคุณทันที</p>
              </div>

              {/* Transaction Statement box */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between border-b border-slate-100 pb-1.5 mb-1 text-slate-400">
                  <span>สถานะความปลอดภัย:</span>
                  <span className="text-teal-600 font-bold">สำเร็จ (ชำระผ่านระบบ)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ยอดชำระด้วย ShopeePay:</span>
                  <span className="text-slate-800 font-bold">฿{checkoutSummary.finalTotal.toLocaleString()}</span>
                </div>
                {checkoutSummary.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>ใช้ส่วนลดเซฟคอยน์ไป:</span>
                    <span className="font-bold">-฿{checkoutSummary.discount.toLocaleString()}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 text-center pt-2.5 border-t border-slate-100 font-medium">
                  📝 พัสดุถูกย้ายไปที่แท็บ 'การแจ้งเตือน' และ 'ฉัน &gt; ที่ต้องจัดส่ง' เพื่อติดตามสถานะเรียบร้อยแล้ว
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-colors text-center"
                >
                  ตกลงและเลือกดูสินค้าต่อ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
