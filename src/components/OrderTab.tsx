/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { mockProducts } from '../mockData';
import { Shield, Zap, Headphones, Clock, Play, Coins, Lock, ClipboardList, Wallet, Sparkles, AlertCircle, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTabProps {
  onProductClick: (product: Product) => void;
  onAddOrderToHistory?: (product: Product, quantity: number, price: number, commission: number) => void;
  user: any;
  onSyncUserBalances: (balance: number, commission: number, ordersCompleted: number, frozen: number) => void;
  onOpenWallet?: (tab?: 'history' | 'withdraw') => void;
  products: Product[];
}

export default function OrderTab({ onProductClick, onAddOrderToHistory, user, onSyncUserBalances, onOpenWallet, products }: OrderTabProps) {
  // --- STATE FOR ORDER SIMULATOR ---
  const [commission, setCommission] = useState(() => {
    if (user) return user.commission;
    const saved = localStorage.getItem('order_sim_commission');
    return saved ? parseFloat(saved) : 0.00;
  });

  const [frozenAmount, setFrozenAmount] = useState(() => {
    if (user) return user.frozen;
    const saved = localStorage.getItem('order_sim_frozen');
    return saved ? parseFloat(saved) : 0.00;
  });

  const [ordersCount, setOrdersCount] = useState(() => {
    if (user) return user.ordersCompleted;
    const saved = localStorage.getItem('order_sim_orders_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [availableBalance, setAvailableBalance] = useState(() => {
    if (user) return user.balance;
    const saved = localStorage.getItem('order_sim_balance');
    return saved ? parseFloat(saved) : 0.00;
  });

  // --- INTERACTIVE MATCHING STATES ---
  const [isMatching, setIsMatching] = useState(false);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(() => {
    const saved = localStorage.getItem('order_sim_matched_product');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showResultModal, setShowResultModal] = useState(() => {
    const saved = localStorage.getItem('order_sim_matched_product');
    return !!saved;
  });
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [earnedCommissionNow, setEarnedCommissionNow] = useState<number>(() => {
    const saved = localStorage.getItem('order_sim_earned_commission');
    return saved ? parseFloat(saved) : 0;
  });

  const [usedProductIds, setUsedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('order_sim_used_product_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [usedProductIdsByLevel, setUsedProductIdsByLevel] = useState<Record<number, string[]>>(() => {
    try {
      const saved = localStorage.getItem('order_sim_used_product_ids_by_level');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // --- SAVE STATES TO LOCAL STORAGE & SYNC BACKEND ---
  useEffect(() => {
    if (user) {
      setCommission(user.commission);
      setFrozenAmount(user.frozen);
      setOrdersCount(user.ordersCompleted);
      setAvailableBalance(user.balance);
    }
  }, [user?.balance, user?.commission, user?.ordersCompleted, user?.frozen]);

  useEffect(() => {
    localStorage.setItem('order_sim_commission', commission.toString());
    onSyncUserBalances(availableBalance, commission, ordersCount, frozenAmount);
  }, [commission]);

  useEffect(() => {
    return () => {
      if ((window as any)._matchPollInterval) {
        clearInterval((window as any)._matchPollInterval);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('order_sim_frozen', frozenAmount.toString());
    onSyncUserBalances(availableBalance, commission, ordersCount, frozenAmount);
  }, [frozenAmount]);

  useEffect(() => {
    localStorage.setItem('order_sim_orders_count', ordersCount.toString());
    onSyncUserBalances(availableBalance, commission, ordersCount, frozenAmount);
  }, [ordersCount]);

  useEffect(() => {
    localStorage.setItem('order_sim_balance', availableBalance.toString());
    onSyncUserBalances(availableBalance, commission, ordersCount, frozenAmount);
  }, [availableBalance]);

  // --- UTILS & HELPERS ---
  const currentLevel = user?.level ?? -1;

  const getLevelLabel = (lvl: number): string => {
    if (lvl === -1) return 'Member';
    return `Level ${lvl}`;
  };

  const getTargetOrdersByLevel = (lvl: number): number => {
    if (lvl === 0) return 20;
    if (lvl === 1) return 30;
    if (lvl === 2) return 40;
    if (lvl === 3) return 50;
    if (lvl === 4) return 60;
    if (lvl === 5) return 70;
    if (lvl === 6) return 80;
    if (lvl === 7) return 90;
    return 0; // Member
  };

  const getMaxPriceByLevel = (lvl: number): number => {
    if (lvl === 0) return 500;
    if (lvl === 1) return 1000;
    if (lvl === 2) return 2000;
    if (lvl === 3) return 3000;
    if (lvl === 4) return 5000;
    if (lvl === 5) return 10000;
    if (lvl === 6) return 20000;
    if (lvl === 7) return 50000;
    return 0; // Member
  };

  const getPriceRangeByLevel = (lvl: number): { min: number; max: number } => {
    if (lvl === 0) return { min: 300, max: 500 };
    if (lvl === 1) return { min: 800, max: 1000 };
    if (lvl === 2) return { min: 1500, max: 2000 };
    if (lvl === 3) return { min: 2500, max: 3000 };
    if (lvl === 4) return { min: 4000, max: 5000 };
    if (lvl === 5) return { min: 9000, max: 10000 };
    if (lvl === 6) return { min: 18000, max: 20000 };
    if (lvl === 7) return { min: 40000, max: 50000 };
    return { min: 0, max: 0 };
  };

  const totalOrdersLimit = getTargetOrdersByLevel(currentLevel);
  // และหลอด% ให้แสดงตามจำนวนสินค้าที่ซื้อตั้งแต่0ชิ้น แต่กำหนดสูงสุด 90ชิ้น
  const progressPercentage = Math.min(100, Math.floor((ordersCount / 90) * 100));

  // --- RESET SIMULATOR HANDLER ---
  const handleResetSimulator = () => {
    if (window.confirm('คุณต้องการรีเซ็ตยอดคงเหลือและปริมาณคำสั่งซื้อของระบบพาร์ตเนอร์ใช่หรือไม่?')) {
      setCommission(0.00);
      setFrozenAmount(0.00);
      setOrdersCount(0);
      setAvailableBalance(user?.balance ?? 0.00);
    }
  };

  // --- MATCHING FLOW ACTION ---
  const handleStartMatching = (customDelay?: number) => {
    if (!products || products.length === 0) {
      alert('สินค้าหมด');
      return;
    }

    if (currentLevel === -1) {
      alert('บัญชีของคุณอยู่ในระดับ Member (Level -1) ไม่สามารถสุ่มจับคู่สินค้าได้ กรุณาเติมเงินเพื่ออัปเกรดระดับเลเวลก่อนเริ่มทำรายการค่ะ 💳');
      return;
    }

    if (ordersCount >= totalOrdersLimit) {
      alert(`คุณทำออเดอร์ครบตามจำนวนโควตารวมสำหรับ เลเวล ${currentLevel} ทั้งหมด ${totalOrdersLimit} รายการเรียบร้อยแล้วค่ะ!`);
      return;
    }
    
    setIsMatching(true);

    const userPhone = user?.phone || '0888888888';
    const userName = user?.username || 'ผู้ใช้จำลอง';

    // Register match request on server
    fetch('/api/order/match-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userName,
        phone: userPhone
      })
    })
    .then(res => res.json())
    .then(() => {
      if ((window as any)._matchPollInterval) {
        clearInterval((window as any)._matchPollInterval);
      }

      // Start polling the server to check if admin assigned a product
      const interval = setInterval(() => {
        fetch(`/api/order/check-match?phone=${userPhone}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 'assigned' && data.assignedProduct) {
              clearInterval(interval);
              setIsMatching(false);
              setMatchedProduct(data.assignedProduct);
              localStorage.setItem('order_sim_matched_product', JSON.stringify(data.assignedProduct));
              
              // Add to used product ids to maintain duplicate checking if possible
              if (data.assignedProduct.id) {
                setUsedProductIdsByLevel(prev => {
                  const currentUsedList = prev[currentLevel] || [];
                  const nextList = currentUsedList.includes(data.assignedProduct.id) ? currentUsedList : [...currentUsedList, data.assignedProduct.id];
                  const next = {
                    ...prev,
                    [currentLevel]: nextList
                  };
                  localStorage.setItem('order_sim_used_product_ids_by_level', JSON.stringify(next));
                  return next;
                });
              }

              // Calculate commission: 0.22% of product price
              const calculatedComm = parseFloat((data.assignedProduct.price * 0.0022).toFixed(2));
              setEarnedCommissionNow(calculatedComm);
              localStorage.setItem('order_sim_earned_commission', calculatedComm.toString());
              setShowResultModal(true);
              
              // Complete / remove match request from queue
              fetch('/api/order/match-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: userPhone })
              }).catch(err => console.error(err));
            }
          })
          .catch(err => console.error('Error checking match:', err));
      }, 1000);

      (window as any)._matchPollInterval = interval;
    })
    .catch(err => {
      console.error('Error initiating match request:', err);
    });

    const matchDelay = customDelay !== undefined ? customDelay : 1500;

    // Fallback/Auto-matching if not manually assigned by admin within matchDelay
    setTimeout(() => {
      // Check if we are still matching
      setIsMatching(currentMatchingState => {
        if (currentMatchingState) {
          // Get products from homepage (real existing products) matching level price range
          const range = getPriceRangeByLevel(currentLevel);
          let availableTemplates = products.filter(p => p.price >= range.min && p.price <= range.max);

          if (availableTemplates.length === 0) {
            // Fallback to all homepage products if none are within range
            availableTemplates = products;
          }
          
          // Filter out used products of this specific level
          const levelUsedIds = usedProductIdsByLevel[currentLevel] || [];
          let unusedTemplates = availableTemplates.filter(p => !levelUsedIds.includes(p.id));

          if (unusedTemplates.length === 0 && availableTemplates.length > 0) {
            // Reset used products of this level to keep matching if all have been used
            const nextUsedByLevel = {
              ...usedProductIdsByLevel,
              [currentLevel]: []
            };
            setUsedProductIdsByLevel(nextUsedByLevel);
            localStorage.setItem('order_sim_used_product_ids_by_level', JSON.stringify(nextUsedByLevel));
            unusedTemplates = availableTemplates;
          }

          const selected = unusedTemplates.length > 0 
            ? unusedTemplates[Math.floor(Math.random() * unusedTemplates.length)]
            : products[0] || mockProducts[0]; // fallback safety

          // Mark as used for this specific level
          if (selected && selected.id) {
            const currentUsedList = usedProductIdsByLevel[currentLevel] || [];
            const nextList = currentUsedList.includes(selected.id) ? currentUsedList : [...currentUsedList, selected.id];
            const nextUsedByLevel = {
              ...usedProductIdsByLevel,
              [currentLevel]: nextList
            };
            setUsedProductIdsByLevel(nextUsedByLevel);
            localStorage.setItem('order_sim_used_product_ids_by_level', JSON.stringify(nextUsedByLevel));
          }

          setMatchedProduct(selected);
          localStorage.setItem('order_sim_matched_product', JSON.stringify(selected));
          const calculatedComm = parseFloat((selected.price * 0.0022).toFixed(2));
          setEarnedCommissionNow(calculatedComm);
          localStorage.setItem('order_sim_earned_commission', calculatedComm.toString());
          setShowResultModal(true);

          if ((window as any)._matchPollInterval) {
            clearInterval((window as any)._matchPollInterval);
          }
          // Also complete match request
          fetch('/api/order/match-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: userPhone })
          }).catch(err => console.error(err));
        }
        return false;
      });
    }, matchDelay);
  };

  // --- CONFIRM TRANSACTION SETTLEMENT ---
  const handleConfirmOrder = () => {
    if (!matchedProduct) return;

    if (availableBalance < matchedProduct.price) {
      alert('ยอดคงเหลือที่มีอยู่ของคุณไม่เพียงพอสำหรับการสั่งซื้อรายการนี้ กรุณารีเซ็ตข้อมูลหรือรับเงินทุนเพิ่ม');
      return;
    }

    // Process Transaction:
    // ยอดเงินคงเหลือสะสมอยู่ให้ล็อคค่าเงินจากการเติมใว้เท่านั้นและเพิ่มค่าคอมตามที่ได้รับเมื่อซื้อสินค้าเสร็จ
    setAvailableBalance(prev => parseFloat((prev + earnedCommissionNow).toFixed(2)));
    // Add commission
    setCommission(prev => parseFloat((prev + earnedCommissionNow).toFixed(2)));
    // Increment order count
    const nextOrdersCount = ordersCount + 1;
    setOrdersCount(nextOrdersCount);

    // Close matched product view and show beautiful overlay confirmation
    setMatchedProduct(null);
    localStorage.removeItem('order_sim_matched_product');
    localStorage.removeItem('order_sim_earned_commission');
    setShowResultModal(false);
    setShowSuccessAnim(true);

    // Also trigger onAddOrderToHistory if provided in parent App
    if (onAddOrderToHistory) {
      onAddOrderToHistory(matchedProduct, 1, matchedProduct.price, earnedCommissionNow);
    }

    setTimeout(() => {
      setShowSuccessAnim(false);
      
      // และเมื่อซื้อสินค้าตามที่กำหนดตามชิ้นระดับเลเวลนั้นครบแล้วจะบังคับให้ไปหน้าถอนเงินในshopeepay walletทันที
      if (nextOrdersCount >= totalOrdersLimit) {
        alert(`🎉 ยินดีด้วยค่ะ! คุณทำรายการสั่งซื้อครบตามจำนวนโควตาทั้งหมด ${totalOrdersLimit} รายการสำหรับ เลเวล ${currentLevel} เรียบร้อยแล้วค่ะ\nระบบกำลังพาท่านไปยังหน้าถอนเงินใน ShopeePay Wallet เพื่อทำรายการถอนเงินทุนและกำไรทั้งหมดค่ะ 💰`);
        if (onOpenWallet) {
          onOpenWallet('withdraw');
        }
      } else {
        // และเมื่อกดยืนยันส่งออเดอร์แล้ว ให้แสดงสินค้าที่สุ่มใหม่ขึ้นมาได้เลยภายใน1วิ
        handleStartMatching(400); // 400ms delay in startMatching + 500ms success delay = 900ms (within 1 second!)
      }
    }, 500);
  };

  return (
    <div id="order-tab-container" className="flex flex-col bg-slate-50 min-h-full pb-24 select-none">
      
      {/* 1. Header Box with Orange/Red Gradient (Exact UI Clone) */}
      <div id="order-header" className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white pt-5 pb-8 px-5 rounded-b-[2rem] shadow-lg relative">
        
        {/* Top bar controls */}
        <div id="order-top-controls" className="flex items-center justify-between mb-5">
          {/* Badge Level */}
          <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[11px] font-black text-orange-600 shadow-sm border border-orange-100">
            <span className="text-sm">👑</span>
            <span>{getLevelLabel(currentLevel)}</span>
          </div>

          {/* Reset button simulator */}
          <button 
            onClick={handleResetSimulator}
            className="bg-white/20 hover:bg-white/35 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>รีเซ็ตยอด</span>
          </button>
        </div>

        {/* Level & Amount Display columns */}
        <div id="order-amount-columns" className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span className="text-orange-100 text-[10px] font-medium uppercase tracking-wide block">ยอดเติมรอบล่าสุด (ShopeePay Wallet)</span>
            <span className="text-xl font-extrabold tracking-tight text-white block mt-0.5">
              {(user?.latestDepositAmount ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">THB</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-orange-100 text-[10px] font-medium uppercase tracking-wide block">จำนวนการสั่งซื้อสะสม</span>
            <span className="text-base font-extrabold text-white block mt-0.5">{ordersCount} / {totalOrdersLimit} <span className="text-xs font-normal">ชิ้น</span></span>
          </div>
        </div>

        {/* Slider progress bar */}
        <div id="order-progress-slider" className="mt-5">
          <div className="w-full h-2 bg-black/15 rounded-full overflow-hidden border border-white/10 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-white h-full rounded-full shadow-inner"
            ></motion.div>
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] text-orange-100 font-bold">
            <span>ความคืบหน้า (สูงสุด 90 ชิ้น)</span>
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Stats Panel White Card */}
      <div id="order-stats-card" className="mx-4 -mt-5 bg-white rounded-[20px] shadow-md border border-slate-100 p-5 relative z-10">
        
        {/* 2x2 grid stats */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 pb-4 border-b border-dashed border-slate-100">
          
          {/* Stat 1: Earned Commission */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
              <Coins className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">รับค่าคอมมิชชั่น</span>
              <span className="text-sm font-black text-slate-800 block mt-0.5">{commission.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Stat 2: Frozen */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-150">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">อายัด</span>
              <span className="text-sm font-black text-slate-800 block mt-0.5">{frozenAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Stat 3: Order Amount Volume */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">ปริมาณการสั่งซื้อ</span>
              <span className="text-sm font-black text-slate-800 block mt-0.5">{ordersCount} / {totalOrdersLimit}</span>
            </div>
          </div>

          {/* Stat 4: Remaining Balance (Red color as seen on photo) */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-red-500 border border-rose-100">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block leading-tight">ยอดคงเหลือที่มีอยู่</span>
              <span className="text-sm font-black text-red-500 block mt-0.5">{availableBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>

        {/* Commission percentage banner */}
        <div className="flex items-center justify-between py-3 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <span className="text-orange-500 font-bold">%</span> อัตราคอมมิชชั่นต่อรายการ
          </span>
          <span className="font-extrabold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100/40">
            0.22% / รายการ
          </span>
        </div>

        {/* BIG AUTOMATIC MATCHING TRIGGER BUTTON */}
        <div className="mt-2">
          <button
            onClick={handleStartMatching}
            disabled={isMatching || ordersCount >= totalOrdersLimit}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-sm py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isMatching ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>ระบบกำลังจับคู่พาร์ตเนอร์ออเดอร์...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white stroke-[3]" />
                <span>เริ่มทำรายการ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Safety Badges Row */}
      <div className="grid grid-cols-3 gap-2 mx-4 mt-4">
        
        {/* Safety 1 */}
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-2">ปลอดภัย</span>
          <span className="text-[9px] text-slate-400 mt-0.5 font-sans leading-none">เข้ารหัส 256-bit</span>
        </div>

        {/* Safety 2 */}
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-2">รวดเร็ว</span>
          <span className="text-[9px] text-slate-400 mt-0.5 font-sans leading-none">โอนทันที</span>
        </div>

        {/* Safety 3 */}
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
            <Headphones className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-2">ซัพพอร์ต</span>
          <span className="text-[9px] text-slate-400 mt-0.5 font-sans leading-none">24 ชั่วโมง</span>
        </div>

      </div>

      {/* 4. Business Hours Info bar */}
      <div className="mx-4 mt-3 bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">เวลาทำการของระบบ</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">เปิดให้บริการ 08:00 - 21:00 น. ทุกวัน</span>
          </div>
        </div>

        <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-100 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
          <span>เปิดอยู่</span>
        </span>
      </div>

      {/* ======================================================== */}
      {/* 5. MATCHED ORDER DETAILED MODAL POPUP */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showResultModal && matchedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
            
            {/* Background block clickable overlay close */}
            <div className="absolute inset-0" onClick={() => {
              if (availableBalance < matchedProduct.price) {
                setShowResultModal(false);
              } else {
                alert('กรุณากด "ยืนยันส่งออเดอร์" เพื่อทำรายการสั่งซื้อและรับค่าคอมมิชชั่นค่ะ');
              }
            }}></div>

            {/* Modal Card content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl relative z-10 border border-slate-100"
            >
              {/* Ribbon matched header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-center text-white">
                <span className="text-xs font-black tracking-widest uppercase block">จับคู่รายการออเดอร์สำเร็จ! 🎉</span>
              </div>

              {/* Product Match detail */}
              <div className="p-4 space-y-4">
                
                {/* Product brief layout */}
                <div
                  onClick={() => onProductClick(matchedProduct)}
                  className="flex gap-3 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-150 cursor-pointer transition-colors"
                  title="คลิกเพื่อดูสินค้าบน Shopee"
                >
                  <img
                    src={matchedProduct.image}
                    alt={matchedProduct.title}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{matchedProduct.title}</h4>
                    <span className="text-[9.5px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-extrabold mt-1.5 inline-block">
                      พาร์ตเนอร์: {matchedProduct.shopName || 'Shopee Shop'}
                    </span>
                  </div>
                </div>

                {/* Settlement table */}
                <div className="space-y-2 border-t border-b border-dashed border-slate-150 py-3 text-xs">
                  
                  {/* Row 1: Product Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">ราคาจำหน่ายสินค้า:</span>
                    <span className="font-extrabold text-slate-800">฿{matchedProduct.price.toLocaleString()}</span>
                  </div>

                  {/* Row 2: Commission rate */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">อัตราผลตอบแทนคอมมิชชั่น:</span>
                    <span className="font-extrabold text-orange-500">0.22%</span>
                  </div>

                  {/* Row 3: Commissions Earned */}
                  <div className="flex justify-between items-center bg-amber-50/60 p-2 rounded-lg border border-amber-100/40">
                    <span className="text-slate-500 font-bold">รับค่าคอมมิชชั่นหลังเสร็จสิ้น:</span>
                    <span className="font-black text-amber-600 text-sm flex items-center gap-0.5">
                      + ฿{earnedCommissionNow.toFixed(2)}
                    </span>
                  </div>

                </div>

                {/* Account balance flow calculations */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px] text-slate-500 font-sans">
                  <div className="flex justify-between">
                    <span>ยอดเงินในบัญชีของคุณ:</span>
                    <span className="font-bold text-slate-700">฿{availableBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>หักยอดชำระสั่งซื้อ:</span>
                    <span>- ฿{matchedProduct.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>คืนทุนพร้อมค่าคอมมิชชันทันที:</span>
                    <span>+ ฿{(matchedProduct.price + earnedCommissionNow).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-teal-600 font-bold border-t border-slate-200/60 pt-1.5">
                    <span>ยอดเงินคงเหลือหลังทำรายการเสร็จสิ้น:</span>
                    <span className="text-teal-600 font-extrabold">
                      ฿{(availableBalance + earnedCommissionNow).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {availableBalance < matchedProduct.price && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 items-start text-[11px] text-red-600 leading-normal">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <span className="font-bold block">ยอดเงินของคุณไม่เพียงพอทำรายการนี้</span>
                      <span>กรุณาคลิกปุ่มรีเซ็ตยอดเงินทุนเพื่อทำรายการต่อค่ะ</span>
                    </div>
                  </div>
                )}

                {/* Actions buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  {availableBalance < matchedProduct.price ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResetSimulator}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                        <span>รีเซ็ตยอดเงินทุน</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMatchedProduct(null);
                          localStorage.removeItem('order_sim_matched_product');
                          setShowResultModal(false);
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs py-2.5 rounded-xl transition-all text-center border border-slate-200 cursor-pointer"
                      >
                        ปิดหน้านี้ก่อน
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={handleConfirmOrder}
                        className="flex-auto bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-500 hover:to-orange-600 text-white font-black text-sm py-3 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>ยืนยันส่งออเดอร์</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMatchedProduct(null);
                          localStorage.removeItem('order_sim_matched_product');
                          setShowResultModal(false);
                        }}
                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs py-3 rounded-xl transition-all text-center border border-slate-200 cursor-pointer"
                      >
                        ปิด
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 6. GLOBAL SUCCESS CONFIRMATION ANIMATED OVERLAY */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showSuccessAnim && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[24px] p-6 text-center max-w-xs shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="w-16 h-16 bg-teal-50 border-4 border-teal-100 rounded-full flex items-center justify-center text-teal-500 mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9 fill-current" />
              </div>

              <div>
                <h3 className="font-black text-base text-slate-800">ส่งคำสั่งซื้อสำเร็จแล้ว! 🎉</h3>
                <p className="text-[11.5px] text-slate-400 mt-1 leading-normal">
                  ระบบได้อนุมัติทำรายการสั่งซื้อและปล่อยค่าคอมมิชชั่นให้กับบัญชีของคุณเรียบร้อยแล้วค่ะ
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-medium">ค่าคอมมิชชั่นสะสมเข้ากระเป๋า:</span>
                <span className="text-amber-500 text-sm font-black">+ ฿{earnedCommissionNow.toFixed(2)}</span>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * ตรวจสอบยอดเงินอัปเดตแบบเรียลไทม์ได้ในหน้าแดชบอร์ด
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const LEVEL_PRODUCTS: Record<number, Product[]> = {
  0: [
    {
      id: 'lvl0-p1',
      title: 'ไส้กรองเครื่องฟอกอากาศ Xiaomi Air Purifier HEPA Filter กำจัดฝุ่น PM2.5 และสารก่อภูมิแพ้',
      price: 310,
      originalPrice: 690,
      discount: '-55%',
      salesText: 'ขายแล้ว 3.2พัน+',
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 1540,
      description: 'ไส้กรองคุณภาพสูง แผ่นกรอง 3 ชั้น สามารถกรองอนุภาคขนาดเล็ก 0.3 ไมครอนได้ถึง 99.97% รวมถึงฝุ่นละออง PM2.5 กลิ่นไม่พึงประสงค์ และฟอร์มาลดีไฮด์',
      shopName: 'Xiaomi Smart Life'
    },
    {
      id: 'lvl0-p2',
      title: 'หูฟังบลูทูธไร้สาย TWS Earbuds Bluetooth 5.3 เสียงดี เบสแน่น ตัดเสียงรบกวนอัจฉริยะ',
      price: 350,
      originalPrice: 890,
      discount: '-60%',
      salesText: 'ขายแล้ว 12พัน+',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.8,
      reviewsCount: 8900,
      description: 'ระบบควบคุมแบบสัมผัส แบตเตอรี่ยาวนาน 24 ชั่วโมงพร้อมกล่องชาร์จ กันน้ำกันเหงื่อระดับ IPX5 เหมาะสำหรับออกกำลังกายและใช้งานทั่วไป',
      shopName: 'SoundWave Thailand'
    },
    {
      id: 'lvl0-p3',
      title: 'โคมไฟตั้งโต๊ะ LED ถนอมสายตา ปรับระดับความสว่างและอุณหภูมิสีได้ 3 โหมด ดีไซน์พับเก็บได้',
      price: 380,
      originalPrice: 790,
      discount: '-51%',
      salesText: 'ขายแล้ว 4.8พัน+',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'สมุทรปราการ',
      rating: 4.7,
      reviewsCount: 3200,
      description: 'แสงนุ่มนวลไม่มีแสงกะพริบ ปลอดภัยต่อดวงตาขณะอ่านหนังสือหรือทำงาน ช่องเสียบสาย USB ชาร์จไฟในตัวประหยัดพลังงาน',
      shopName: 'HomeDecor Hub'
    },
    {
      id: 'lvl0-p4',
      title: 'เบาะรองนั่งเพื่อสุขภาพ Ergonomic Seat Cushion เมมโมรี่โฟมแท้บรรเทาอาการปวดหลังคอและสะโพก',
      price: 420,
      originalPrice: 950,
      discount: '-55%',
      salesText: 'ขายแล้ว 6.5พัน+',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'ปทุมธานี',
      rating: 4.9,
      reviewsCount: 4500,
      description: 'เหมาะสำหรับพนักงานออฟฟิศที่ต้องนั่งทำงานเป็นเวลานาน เมมโมรี่โฟมความหนาแน่นสูง คืนตัวได้ดี ไม่ยุบตัวง่าย ปลอกถอดซักได้',
      shopName: 'Wellness Comfort Store'
    },
    {
      id: 'lvl0-p5',
      title: 'กาต้มน้ำไฟฟ้าสแตนเลสความร้อนเร็ว 1.8 ลิตร ตัดไฟอัตโนมัติเมื่อเดือด ปลอดภัยไร้กังวล',
      price: 450,
      originalPrice: 990,
      discount: '-54%',
      salesText: 'ขายแล้ว 15พัน+',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.8,
      reviewsCount: 12400,
      description: 'ทำความร้อนรวดเร็วทันใจภายใน 3 นาที ตัวเครื่องสแตนเลสเกรด 304 ปลอดภัยไร้สารเคมีตกค้าง แข็งแรงทนทาน ล้างทำความสะอาดง่าย',
      shopName: 'KitchenPro'
    },
    {
      id: 'lvl0-p6',
      title: 'คีย์บอร์ดไร้สายสีพาสเทลสุดน่ารัก Bluetooth Wireless Keyboard 84 คีย์ รองรับทุกระบบปฏิบัติการ',
      price: 490,
      originalPrice: 1200,
      discount: '-59%',
      salesText: 'ขายแล้ว 8.3พัน+',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'นนทบุรี',
      rating: 4.8,
      reviewsCount: 6200,
      description: 'เชื่อมต่อสะดวก ดีไซน์ปุ่มกดทรงกลมสัมผัสสบายมือ น้ำหนักเบาพกพาสะดวก ใช้ร่วมกับไอแพด แท็บเล็ต มือถือ และคอมพิวเตอร์ได้ดี',
      shopName: 'Gadget Mania'
    }
  ],
  1: [
    {
      id: 'lvl1-p1',
      title: 'เครื่องปั่นน้ำผลไม้พกพา Portable USB Blender 6 ใบมีดสแตนเลส พลังแรง ปั่นละเอียดใน 30 วินาที',
      price: 820,
      originalPrice: 1850,
      discount: '-55%',
      salesText: 'ขายแล้ว 2.4พัน+',
      image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 1320,
      description: 'ขวดปั่นวัสดุ Tritan ปลอดสาร BPA แบตเตอรี่ชาร์จ USB ในตัว พกพาสะดวกสำหรับคนรักสุขภาพ ปั่นน้ำผักผลไม้ โปรตีนเชคได้ทุกที่ทุกเวลา',
      shopName: 'Healthy Lifestyle'
    },
    {
      id: 'lvl1-p2',
      title: 'เตาไฟฟ้าอเนกประสงค์ Mini Electric Cooker เคลือบเซรามิกกันติด ไม่ติดกระทะ ต้ม ผัด แกง ทอด ครบในเครื่องเดียว',
      price: 850,
      originalPrice: 1990,
      discount: '-57%',
      salesText: 'ขายแล้ว 3.8พัน+',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'สมุทรปราการ',
      rating: 4.8,
      reviewsCount: 2200,
      description: 'ขนาดความจุ 1.5 ลิตร ปรับความร้อนได้ 2 ระดับ เหมาะสำหรับเด็กหอหรือห้องครัวขนาดกะทัดรัด ตัวหม้อสองชั้นกันร้อน ปลอดภัยสูง',
      shopName: 'Smart Kitchen'
    },
    {
      id: 'lvl1-p3',
      title: 'เครื่องชั่งน้ำหนักอัจฉริยะ Smart Body Composition Scale วัดมวลไขมัน มวลกล้ามเนื้อ เชื่อมต่อแอปมือถือละเอียด',
      price: 890,
      originalPrice: 1690,
      discount: '-47%',
      salesText: 'ขายแล้ว 10พัน+',
      image: 'https://images.unsplash.com/photo-1574269664601-e940e603822a?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'ปทุมธานี',
      rating: 4.9,
      reviewsCount: 7800,
      description: 'วิเคราะห์องค์ประกอบร่างกายได้ถึง 13 รายการรวมถึงดัชนีมวลกาย (BMI), มวลน้ำ, มวลกระดูก และอัตราการเผาผลาญพื้นฐาน แผงกระจกเทมเปอร์หรูหรา',
      shopName: 'Health Metrics'
    },
    {
      id: 'lvl1-p4',
      title: 'กระเป๋าเป้สะพายหลังกันน้ำดีไซน์สปอร์ต Waterproof Sports Backpack ช่องใส่ของเยอะ แล็ปท็อป 15.6 นิ้ว',
      price: 920,
      originalPrice: 1800,
      discount: '-48%',
      salesText: 'ขายแล้ว 1.9พัน+',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'นนทบุรี',
      rating: 4.7,
      reviewsCount: 950,
      description: 'วัสดุผ้า Oxford เกรดพิเศษ กันน้ำและรอยขีดข่วน มีช่องระบายความร้อนด้านหลัง ดีไซน์ทันสมัยเหมาะทั้งสะพายทำงาน ท่องเที่ยว หรือเดินป่า',
      shopName: 'Active Gear'
    },
    {
      id: 'lvl1-p5',
      title: 'คีย์บอร์ดเกมมิ่งปุ่มแมคคานิคอลไร้สาย Mechanical Gaming Keyboard ไฟ RGB สวิตช์ปรับเปลี่ยนได้ Hot Swappable',
      price: 950,
      originalPrice: 2290,
      discount: '-58%',
      salesText: 'ขายแล้ว 5.4พัน+',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 3800,
      description: 'ตอบสนองไวสูงสุด แสงไฟ RGB ปรับแต่งได้ 18 โหมด สวิตช์กดสัมผัสแน่นแม่นยำ เหมาะสำหรับการเล่มเกมสตรีมเมอร์และเขียนโปรแกรม',
      shopName: 'Cyber Esports'
    },
    {
      id: 'lvl1-p6',
      title: 'ชุดคีย์บอร์ดและเมาส์ไฟเรืองแสง RGB Desk Mat & Wired Gaming Mouse Bundle เซ็ตสุดคุ้มสำหรับคนรักคอม',
      price: 990,
      originalPrice: 2100,
      discount: '-52%',
      salesText: 'ขายแล้ว 2.1พัน+',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'ชลบุรี',
      rating: 4.8,
      reviewsCount: 1100,
      description: 'แผ่นรองเมาส์ขนาดใหญ่พิเศษไฟ RGB รอบแผ่นพร้อมเซ็ตเมาส์ความละเอียด 7200 DPI ปรับสปีดได้ เพิ่มความสว่างตระการตาให้โต๊ะคอมของคุณ',
      shopName: 'Retro Studio'
    }
  ],
  2: [
    {
      id: 'lvl2-p1',
      title: 'เครื่องดูดฝุ่นไร้สายพกพา Cordless Handheld Vacuum Cleaner น้ำหนักเบา พลังดูดไซโคลน 12000Pa',
      price: 1550,
      originalPrice: 3200,
      discount: '-51%',
      salesText: 'ขายแล้ว 1.5พัน+',
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.8,
      reviewsCount: 780,
      description: 'หัวแปรงเปลี่ยนได้หลากหลาย ทำความสะอาดได้ทุกซอกมุมของบ้านและภายในรถยนต์ แผ่นกรองล้างน้ำซ้ำได้ แบตเตอรี่ลิเธียมความจุสูง',
      shopName: 'CleanHome Pro'
    },
    {
      id: 'lvl2-p2',
      title: 'กล้องถ่ายภาพด่วน Instant Camera ถ่ายปุ๊บได้รูปปั๊บ สีพาสเทลสวยงาม ใช้งานง่าย คลาสสิกยอดนิยม',
      price: 1690,
      originalPrice: 3500,
      discount: '-51%',
      salesText: 'ขายแล้ว 2.2พัน+',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'สมุทรปราการ',
      rating: 4.9,
      reviewsCount: 1240,
      description: 'กล้องอินสแตนท์รุ่นยอดฮิตพร้อมระบบปรับแสงอัตโนมัติ ถ่ายเซลฟี่ระยะใกล้ได้คมชัด เก็บทุกช่วงเวลาแห่งความประทับใจลงบนแผ่นฟิล์มทันที',
      shopName: 'Camera Classic'
    },
    {
      id: 'lvl2-p3',
      title: 'เครื่องโกนหนวดไฟฟ้าผู้ชายระดับพรีเมียม Premium Waterproof Electric Shaver 3 หัวโกนอิสระ 3D โกนเรียบเนียน',
      price: 1750,
      originalPrice: 3900,
      discount: '-55%',
      salesText: 'ขายแล้ว 1.8พัน+',
      image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'ปทุมธานี',
      rating: 4.8,
      reviewsCount: 880,
      description: 'กันน้ำมาตรฐาน IPX7 สามารถโกนได้ทั้งแบบแห้งและเปียก ชาร์จเร็วด้วยพอร์ต Type-C ใบมีดสแตนเลสลับคมในตัวทนทานยาวนาน',
      shopName: 'Men Grooming Store'
    },
    {
      id: 'lvl2-p4',
      title: 'หม้อทอดไร้น้ำมันขนาดใหญ่ Air Fryer 4.5L ควบคุมอุณหภูมิสม่ำเสมอ อบกรอบโดยไม่ใช้น้ำมันเพื่อสุขภาพดี',
      price: 1850,
      originalPrice: 4200,
      discount: '-55%',
      salesText: 'ขายแล้ว 5.9พัน+',
      image: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 4100,
      description: 'ระบบหมุนเวียนลมร้อนความเร็วสูง 360 องศา ทำให้อาหารกรอบนอกนุ่มใน ตะกร้าทอดเคลือบสารกันติดถอดล้างทำความสะอาดง่าย',
      shopName: 'Kitchen Creation'
    },
    {
      id: 'lvl2-p5',
      title: 'นาฬิกาสมาร์ทวอทช์ติดตามสุขภาพ Fitness Tracker Smartwatch กันน้ำลึก จอ AMOLED แจ้งเตือนภาษาไทยครบ',
      price: 1920,
      originalPrice: 3990,
      discount: '-51%',
      salesText: 'ขายแล้ว 4.2พัน+',
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.8,
      reviewsCount: 2900,
      description: 'ตรวจวัดการเต้นของหัวใจตลอด 24 ชม., ตรวจจับความเข้มข้นของออกซิเจนในเลือด (SpO2) และติดตามคุณภาพการนอนหลับ รองรับการออกกำลังกาย 100+ โหมด',
      shopName: 'Smart wearables'
    },
    {
      id: 'lvl2-p6',
      title: 'ลำโพงบลูทูธพกพาเสียงดีพลังขับแน่น Premium Wireless Bluetooth Speaker กันน้ำ IPX7 เหมาะแค้มปิ้งท่องเที่ยว',
      price: 1990,
      originalPrice: 4500,
      discount: '-55%',
      salesText: 'ขายแล้ว 3.1พัน+',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'ปทุมธานี',
      rating: 4.9,
      reviewsCount: 1840,
      description: 'เสียงสเตอริโอรอบทิศทาง 360 องศา เสียงเบสลึกกระหึ่มสะใจ แบตเตอรี่อึดทนนานเล่นต่อเนื่องได้ 15 ชั่วโมง มีหูหิ้วพกพาง่ายแข็งแรง',
      shopName: 'Acoustic Sound'
    }
  ],
  3: [
    {
      id: 'lvl3-p1',
      title: 'เก้าอี้เพื่อสุขภาพ Ergonomic Office Chair พนักพิงระบายอากาศปรับระดับองศาได้ รองรับสรีระเต็มประสิทธิภาพ',
      price: 2550,
      originalPrice: 5900,
      discount: '-56%',
      salesText: 'ขายแล้ว 1.1พัน+',
      image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'นนทบุรี',
      rating: 4.8,
      reviewsCount: 650,
      description: 'ออกแบบตามหลักสรีรศาสตร์ช่วยลดแรงกดทับสะสมที่กระดูกสันหลังและหลังส่วนล่าง เบาะฟองน้ำหนานุ่มระบายอากาศ นั่งทำงานได้ทั้งวันไม่เมื่อยล้า',
      shopName: 'Office Ergonomics'
    },
    {
      id: 'lvl3-p2',
      title: 'กริ่งประตูอัจฉริยะแบบไร้สายพร้อมกล้อง Smart Video Doorbell ความคมชัดระดับ HD คุยโต้ตอบผ่านแอปมือถือเรียลไทม์',
      price: 2690,
      originalPrice: 5500,
      discount: '-51%',
      salesText: 'ขายแล้ว 890+',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 420,
      description: 'เซ็นเซอร์ตรวจจับความเคลื่อนไหวอัจฉริยะอินฟราเรด ไนท์วิชั่น คมชัดแม้ในยามค่ำคืน บันทึกภาพเหตุการณ์ผ่านระบบคลาวด์ เพิ่มความปลอดภัยระดับสิบ',
      shopName: 'SmartHome Security'
    },
    {
      id: 'lvl3-p3',
      title: 'หูฟังบลูทูธระดับไฮเอนด์ Wireless Noise-Cancelling Earbuds ตัดเสียงรบกวนภายนอกได้เงียบสนิท ไดรเวอร์เสียงเทพ',
      price: 2750,
      originalPrice: 6200,
      discount: '-55%',
      salesText: 'ขายแล้ว 2.4พัน+',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 1540,
      description: 'ระบบไมโครโฟนรอบทิศทาง 6 ตัวเพื่อการโทรที่คมชัดเป็นพิเศษ ไฮไฟออดิโอเบสลึกนุ่มนวล สวมใส่เบาสบายหูไม่หลุดหล่นง่ายขณะเคลื่อนไหว',
      shopName: 'Elite Audio'
    },
    {
      id: 'lvl3-p4',
      title: 'เครื่องฉายโปรเจคเตอร์พกพา HD Portable Smart Projector ระบบแอนดรอยด์ในตัว เชื่อมต่อ Wi-Fi และลำโพงฟรีกระเป๋า',
      price: 2850,
      originalPrice: 6900,
      discount: '-58%',
      salesText: 'ขายแล้ว 1.2พัน+',
      image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'สมุทรปราการ',
      rating: 4.8,
      reviewsCount: 680,
      description: 'เพลิดเพลินกับความบันเทิงระดับโรงภาพยนตร์ที่บ้าน ฉายจอขนาดใหญ่ได้ถึง 120 นิ้ว รองรับ Netflix, YouTube ในตัวพกพาสะดวกสำหรับกิจกรรมกลางแจ้ง',
      shopName: 'Cinema Dream'
    },
    {
      id: 'lvl3-p5',
      title: 'หม้อแรงดันอเนกประสงค์อัจฉริยะ Instant Pressure Cooker 6L จอแสดงผลดิจิตอลทำอาหารอร่อยรวดเร็วรักษาคุณค่า',
      price: 2950,
      originalPrice: 6500,
      discount: '-54%',
      salesText: 'ขายแล้ว 1.7พัน+',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'ปทุมธานี',
      rating: 4.9,
      reviewsCount: 920,
      description: 'ประกอบอาหารได้ถึง 10 ประเภทในเครื่องเดียว ประหยัดเวลาทำอาหารได้ถึง 70% รักษาคุณค่าสารอาหารและรสชาติอันเข้มข้น มีระบบเซฟตี้ล็อค 10 ชั้นปลอดภัย',
      shopName: 'Kitchen Elite'
    },
    {
      id: 'lvl3-p6',
      title: 'เครื่องเป่าผมทรงพลังถนอมสายผมอัจฉริยะ Professional Hair Dryer ลมแรงแห้งไวไม่เสียความชุ่มชื้นไอออนลบหนาแน่น',
      price: 2990,
      originalPrice: 6800,
      discount: '-56%',
      salesText: 'ขายแล้ว 3.3พัน+',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 1980,
      description: 'ความเร็วมอเตอร์รอบสูงมาก ลมแรงช่วยให้ผมแห้งสนิทรวดเร็วพร้อมปล่อยไอออนลบประจุนับล้านเพื่อปกป้องเส้นผมจากการสูญเสียความชุ่มชื้นและชี้ฟู',
      shopName: 'Hair Care Beauty'
    }
  ],
  4: [
    {
      id: 'lvl4-p1',
      title: 'เครื่องชงกาแฟสดอิตาเลียนเอสเปรสโซ Espresso Coffee Machine แรงดัน 15 บาร์ ทำโฟมนมเนื้อเนียนละเอียดหนานุ่ม',
      price: 4100,
      originalPrice: 8900,
      discount: '-53%',
      salesText: 'ขายแล้ว 890+',
      image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.8,
      reviewsCount: 420,
      description: 'ระบบทำความร้อนรวดเร็วทันใจชงกาแฟเอสเปรสโซ่รสชาติเข้มข้นสไตล์คาเฟ่ได้ทุกวัน พร้อมหัวพ่นไอน้ำสำหรับตีฟองนมคาปูชิโน่และลาเต้ศิลปะ',
      shopName: 'Barista Choice'
    },
    {
      id: 'lvl4-p2',
      title: 'ชุดกล้องวงจรปิดอัจฉริยะบันทึกภาพตลอด 24 ชม. Smart Security Camera Kit ความละเอียดระดับ 4K ดูผ่านมือถือปลอดภัยสูง',
      price: 4250,
      originalPrice: 9500,
      discount: '-55%',
      salesText: 'ขายแล้ว 650+',
      image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 310,
      description: 'เซ็ตกล้องวงจรปิดทนแดดทนฝนใช้งานภายนอกอาคารได้ดี คมชัดระดับ Ultra HD พร้อมระบบบันทึกเสียงและแจ้งเตือนเข้าแอปพลิเคชันมือถือทันทีเมื่อตรวจพบผู้บุกรุก',
      shopName: 'Secure Shield'
    },
    {
      id: 'lvl4-p3',
      title: 'ฮาร์ดไดรฟ์ภายนอกความเร็วสูง External SSD 2TB Ultra-Speed ถ่ายโอนไฟล์ใหญ่รวดเร็วทันใจป้องกันการตกกระแทกดีเยี่ยม',
      price: 4490,
      originalPrice: 9900,
      discount: '-54%',
      salesText: 'ขายแล้ว 1.2พัน+',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 750,
      description: 'ความจุสูงถึง 2 เทราไบต์ อ่านเขียนข้อมูลไวสูงสุดถึง 1050MB/s ดีไซน์ขอบยางซิลิโคนพรีเมียมกันกระแทก แข็งแรงทนทาน ถ่ายไฟล์วิดีโอใหญ่ราบรื่นไม่สะดุด',
      shopName: 'Data Storage Store'
    },
    {
      id: 'lvl4-p4',
      title: 'หน้าจอคอมพิวเตอร์ดีไซน์สวยไร้ขอบ 24" IPS borderless Monitor อัตราส่วนรีเฟรช 100Hz ภาพสีสันสดใสสมจริงคมชัดกว้าง',
      price: 4650,
      originalPrice: 9800,
      discount: '-52%',
      salesText: 'ขายแล้ว 1.5พัน+',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'สมุทรปราการ',
      rating: 4.8,
      reviewsCount: 880,
      description: 'หน้าจอถนอมสายตาสีสันคมชัดสมจริง ขอบจอบางพิเศษสามด้านเพิ่มมุมมองกว้างเต็มตา อัตราคอนทราสต์สูง เหมาะใช้งานทั้งเอกสาร แต่งภาพ และเล่นเกมไหลลื่น',
      shopName: 'Visual Tech'
    },
    {
      id: 'lvl4-p5',
      title: 'เครื่องควบคุมความชื้นแบบไฮบริดพรีเมียม Hybrid Humidifier ควบคุมกระจายไอน้ำอัจฉริยะเงียบสนิทผ่อนคลายดั่งธรรมชาติ',
      price: 4800,
      originalPrice: 9990,
      discount: '-51%',
      salesText: 'ขายแล้ว 430+',
      image: 'https://images.unsplash.com/photo-1519642918688-7e43d191c2d6?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'ปทุมธานี',
      rating: 4.9,
      reviewsCount: 190,
      description: 'เพิ่มประสิทธิภาพความชื้นอากาศ ป้องกันผิวแห้งกร้าน คอแห้งระคายเคือง แผงควบคุมเซ็นเซอร์อัตโนมัติรักษาระดับความชื้นคงที่สม่ำเสมอ ผสานน้ำมันหอมระเหยผ่อนคลาย',
      shopName: 'Nature Fresh Air'
    },
    {
      id: 'lvl4-p6',
      title: 'เตาอบไมโครเวฟสไตล์วินเทจดีไซน์เก๋ Retro style Microwave Oven ความจุ 20 ลิตร ฟังก์ชันอุ่นอบย่างสารพัดประโยชน์ครบ',
      price: 4950,
      originalPrice: 11000,
      discount: '-55%',
      salesText: 'ขายแล้ว 720+',
      image: 'https://images.unsplash.com/photo-1574269664601-e940e603822a?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.8,
      reviewsCount: 340,
      description: 'เพิ่มความโดดเด่นน่ารักให้กับห้องครัวด้วยดีไซน์ย้อนยุคสีครีมพาสเทล ควบคุมง่ายด้วยแป้นหมุนคลาสสิก ปรับกำลังไฟได้ 5 ระดับละลายน้ำแข็งรวดเร็วแม่นยำ',
      shopName: 'Kitchen Retro'
    }
  ],
  5: [
    {
      id: 'lvl5-p1',
      title: 'หุ่นยนต์ดูดฝุ่นถูพื้นอัจฉริยะ Robot Vacuum Cleaner ระบบทิ้งฝุ่นอัตโนมัติ แผนที่เลเซอร์แม่นยำจัดบ้านสะอาดกริบ',
      price: 9100,
      originalPrice: 19900,
      discount: '-54%',
      salesText: 'ขายแล้ว 320+',
      image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 180,
      description: 'มาพร้อมแท่นเก็บฝุ่นขนาดใหญ่จุได้นาน 60 วันโดยไม่ต้องสัมผัสขยะ ระบบสแกนแบบ LiDAR คำนวณแผนที่ห้องรวดเร็ว หลบสิ่งกีดขวางแม่นยำถูพื้นสะอาดสะอาด',
      shopName: 'AI Home Robotics'
    },
    {
      id: 'lvl5-p2',
      title: 'หูฟังตัดเสียงรบกวนครอบหูไร้สายระดับพรีเมียม Noise Cancelling Over-ear Headphones เสียงระดับสตูดิโอใส่สบายไม่กดทับหู',
      price: 9350,
      originalPrice: 18900,
      discount: '-50%',
      salesText: 'ขายแล้ว 510+',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 290,
      description: 'ระบบตัดเสียงรบกวนภายนอกยอดเยี่ยมเงียบกริบดั่งในอวกาศ คืนรายละเอียดดนตรีครบถ้วนมีชีวิตชีวา แบตเตอรี่ยาวนาน 40 ชั่วโมงสัมผัสวัสดุหนังหรูหรา',
      shopName: 'Audio Studio Master'
    },
    {
      id: 'lvl5-p3',
      title: 'แท็บเล็ตหน้าจอสีสันสดใสขนาด 10.4 นิ้ว Smart Tablet จอถนอมสายตา ความจำเครื่องสูง แบตอึดเล่นเกมความบันเทิงลื่นไหล',
      price: 9500,
      originalPrice: 19500,
      discount: '-51%',
      salesText: 'ขายแล้ว 840+',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'ปทุมธานี',
      rating: 4.8,
      reviewsCount: 410,
      description: 'หน้าจอกว้างความละเอียดคมชัด ลำโพงสี่ตัวมอบพลังเสียงสเตอริโอตระการตา เหมาะมากสำหรับการเรียนออนไลน์ ทำงานพรีเซนต์ ดูซีรีส์ เล่นเกม และวาดเขียนภาพ',
      shopName: 'Tablet Specialist'
    },
    {
      id: 'lvl5-p4',
      title: 'สถานีจ่ายพลังงานไฟฟ้าพกพาความจุใหญ่พิเศษ Portable Power Station สำหรับแคมปิ้ง เดินทางไกล ชาร์จพาวเวอร์ครอบจักรวาล',
      price: 9750,
      originalPrice: 21000,
      discount: '-53%',
      salesText: 'ขายแล้ว 210+',
      image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'สมุทรปราการ',
      rating: 4.9,
      reviewsCount: 94,
      description: 'แหล่งจ่ายพลังงานไฟฟ้าขนาดพกพาที่อัดแน่นด้วยช่องเสียบไฟบ้าน AC และ USB สำหรับใช้แคมป์ปิ้ง อุปกรณ์กลางแจ้ง ชาร์จโน้ตบุ๊ก มือถือ และยามฉุกเฉินไฟดับปลอดภัยสูง',
      shopName: 'Power Hub'
    },
    {
      id: 'lvl5-p5',
      title: 'เก้าอี้นวดตัวหนังแท้ระบบนวดจุดแบบอัจฉริยะ Executive Leather Massage Chair สัมผัสนุ่มนอนนวดสบายลดอาการออฟฟิศซินโดรม',
      price: 9900,
      originalPrice: 22000,
      discount: '-55%',
      salesText: 'ขายแล้ว 150+',
      image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 68,
      description: 'ผ่อนคลายเต็มรูปแบบด้วยเบาะหนังนุ่มเกรดพรีเมียม ดีไซน์สวยงามประดับห้องรับแขกหรูหรา พร้อมลูกกลิ้งนวดลึกอัจฉริยะตามจุด คอ บ่า ไหล่ และหลังส่วนล่างสบายขั้นสุด',
      shopName: 'Comfort Master'
    },
    {
      id: 'lvl5-p6',
      title: 'ไม้กอล์ฟหัวไดรเวอร์ไฮเทคทำจากคาร์บอนไฟเบอร์ Premium Carbon Driver Golf Club หน้าเด้งเพิ่มระยะการไดรฟ์ตรงแม่นยำสะใจ',
      price: 9990,
      originalPrice: 23000,
      discount: '-56%',
      salesText: 'ขายแล้ว 180+',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.8,
      reviewsCount: 75,
      description: 'หัวไม้ขนาดใหญ่พิเศษใช้วัสดุคาร์บอนเกรดคุณภาพระดับแข่งขัน ออกแบบจุดศูนย์ถ่วงต่ำมาก ช่วยเพิ่มสปินคงที่ ตีลูกโด่งขึ้นลอยไกล ยิงตรงเข้าแฟร์เวย์แม่นยำ',
      shopName: 'Pro Golf Equipment'
    }
  ],
  6: [
    {
      id: 'lvl6-p1',
      title: 'แท็บเล็ต Apple iPad Air หน้าจอกว้างคมชัดชิปทรงพลัง บางเบาพกพาสะดวกประสิทธิภาพสูงยอดนิยมอันดับหนึ่ง',
      price: 18200,
      originalPrice: 23900,
      discount: '-23%',
      salesText: 'ขายแล้ว 1.1พัน+',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 840,
      description: 'สัมผัสความเร็วอันทรงพลังด้วยชิประดับท็อป หน้าจอขอบบางคมชัดสุดตระการตา สีสันอิ่มสวยสดใส รองรับปากกาและคีย์บอร์ดพกพาสำหรับงานสร้างสรรค์อย่างไร้ขีดจำกัด',
      shopName: 'Apple Authorized Store'
    },
    {
      id: 'lvl6-p2',
      title: 'เครื่องเล่นเกมคอนโซลยอดฮิต PlayStation 5 Slim Digital Edition สีขาวสะอาดดีไซน์บางเฉียบระบบประมวลภาพคมชัดสมจริงสุดยอด',
      price: 18500,
      originalPrice: 21900,
      discount: '-15%',
      salesText: 'ขายแล้ว 940+',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 650,
      description: 'ก้าวเข้าสู่ยุคใหม่แห่งการเล่นเกมสมจริงด้วยกราฟิกระดับพระกาฬ โหลดแมปฉับไวเป็นพิเศษด้วย SSD ความเร็วสูงพิเศษ สัมผัสจอยควบคุมตอบสนองสั่นสมจริงในมือคุณ',
      shopName: 'PlayStation Elite Shop'
    },
    {
      id: 'lvl6-p3',
      title: 'ชุดเครื่องเล่นเกมพกพา Nintendo Switch OLED Model สลับต่อภาพเข้าทีวีความคมชัดสูงพร้อมแผ่นเกมยอดนิยมเซ็ตสุดคุ้ม',
      price: 18900,
      originalPrice: 24500,
      discount: '-22%',
      salesText: 'ขายแล้ว 1.2พัน+',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'สมุทรปราการ',
      rating: 4.8,
      reviewsCount: 780,
      description: 'หน้าจอสัมผัส OLED ขนาด 7 นิ้วแสดงสีสันสดใสจัดจ้านดูลื่นสบายตา ขาตั้งปรับระดับได้กว้างขึ้นพกพาสนุกเล่นเกมร่วมกับเพื่อนและครอบครัวได้ทุกที่ทุกเวลา',
      shopName: 'Nintendo Town'
    },
    {
      id: 'lvl6-p4',
      title: 'เครื่องฉายโปรเจคเตอร์สมาท 4K Smart Gaming Projector ปรับสมดุลภาพอัจฉริยะจอใหญ่เต็มตาสตรีมมิ่งความบันเทิงครบวงจร',
      price: 19200,
      originalPrice: 28900,
      discount: '-33%',
      salesText: 'ขายแล้ว 340+',
      image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 120,
      description: 'รับชมภาพยนตร์และเล่นเกมสะใจเต็มผนังบ้านคมชัดระดับ 4K ฉายภาพขนาดใหญ่ถึง 150 นิ้วสีสมจริง คอนทราสต์สูงมาก มีลำโพงเซอร์ราวนด์ในตัวกระหึ่มประทับใจ',
      shopName: 'Cinema Projection'
    },
    {
      id: 'lvl6-p5',
      title: 'โดรนถ่ายภาพและวิดีโอจากมุมสูงอัจฉริยะ DJI Mini Fly More Combo ขนาดเล็กกะทัดรัดน้ำหนักเบาถ่ายภาพสวยกันสั่นยอดเยี่ยม',
      price: 19500,
      originalPrice: 25000,
      discount: '-22%',
      salesText: 'ขายแล้ว 420+',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'ปทุมธานี',
      rating: 4.9,
      reviewsCount: 210,
      description: 'โดรนขนาดจิ๋วพกพาสะดวก บินได้นานถึง 31 นาทีต่อก้อน ถ่ายภาพและวิดีโอสวยสะกดสายตาคมชัด มีกิมบอลกันสั่น 3 แกน ลมพัดแรงแค่ไหนภาพก็ยังสมูทนิ่งสงบ',
      shopName: 'DJI Official Hub'
    },
    {
      id: 'lvl6-p6',
      title: 'ไดร์เป่าผมพรีเมียม Dyson Supersonic Hair Dryer เทคโนโลยีควบคุมความร้อนอัจฉริยะเพื่อผมสวยไม่แห้งเสียเซ็ตหัวเป่าห้าแบบครบ',
      price: 19900,
      originalPrice: 22900,
      discount: '-13%',
      salesText: 'ขายแล้ว 1.5พัน+',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 940,
      description: 'นวัตกรรมไดร์เป่าผมลมหมุนความเร็วสูงเป่าผมแห้งรวดเร็ว ป้องกันความร้อนสูงสะสมไม่ให้ทำลายเซลล์ผมเพื่อเส้นผมประกายเงางาม นุ่มลื่น มีสไตล์เรียงตัวสวยงาม',
      shopName: 'Dyson Premium Store'
    }
  ],
  7: [
    {
      id: 'lvl7-p1',
      title: 'สมาร์ทโฟน Apple iPhone 15 Pro 128GB ตัวเครื่องไทเทเนียมบางเบาแข็งแรงชิปเซ็ตประมวลผลไวที่สุดภาพคมชัดระดับสตูดิโอ',
      price: 41000,
      originalPrice: 48900,
      discount: '-16%',
      salesText: 'ขายแล้ว 2.4พัน+',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 1420,
      description: 'ดีไซน์วัสดุไทเทเนียมเกรดเดียวกับที่ใช้ในอุตสาหกรรมอวกาศน้ำหนักเบาและทนทาน กล้องโปรความละเอียดสูงซูมภาพชัดเจน ชาร์จพอร์ตสากล Type-C ยุคใหม่ลื่นไหล',
      shopName: 'Apple Direct Store'
    },
    {
      id: 'lvl7-p2',
      title: 'กล้องฟูลเฟรมมิเรอร์เลสระดับโปร Sony Alpha Full-frame Mirrorless Camera เลนส์คุณภาพเยี่ยมภาพคมชัดมิติสวยระดับพระกาฬ',
      price: 42900,
      originalPrice: 52000,
      discount: '-17%',
      salesText: 'ขายแล้ว 310+',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 110,
      description: 'เซ็นเซอร์รับแสงฟูลเฟรมให้มิติภาพโดดเด่น ถ่ายในที่แสงน้อยได้เนียนใสไม่มีสัญญาณรบกวน ระบบโฟกัสติดตามดวงตาและใบหน้าอัจฉริยะรวดเร็วแม่นยำถ่ายวิดีโอ 4K สวยงาม',
      shopName: 'Sony Pro Camera Shop'
    },
    {
      id: 'lvl7-p3',
      title: 'ทีวีหน้าจอยักษ์ภาพสมจริง 55" LG OLED 4K Smart TV สีดำดำสนิทคอนทราสต์อพาร์ทเมนต์ตระการตาแผงควบคุมอัจฉริยะเสียงแน่นโฮมเธียเตอร์',
      price: 44500,
      originalPrice: 59900,
      discount: '-25%',
      salesText: 'ขายแล้ว 420+',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'นนทบุรี',
      rating: 4.9,
      reviewsCount: 180,
      description: 'พิกเซลส่องสว่างในตัวทำให้ได้ระดับสีดำลึกสนิทสมบูรณ์แบบ ไร้แสงสะท้อน มิติภาพตื้นลึกสะกดสายตา ระบบเสียงดอลบี้สเตอริโอรอบทิศทางสร้างมิติเสียงโรงหนังที่บ้านคุณ',
      shopName: 'LG Premium TV Hub'
    },
    {
      id: 'lvl7-p4',
      title: 'โน้ตบุ๊กเกมมิ่งสเปกแรงอลังการ ASUS ROG Strix Gaming Laptop จอภาพลื่นไหลระบายความร้อนเทพเล่นเกมสตรีมกราฟิกโหดนิ่งเสถียร',
      price: 46900,
      originalPrice: 56900,
      discount: '-17%',
      salesText: 'ขายแล้ว 210+',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'ปทุมธานี',
      rating: 4.8,
      reviewsCount: 95,
      description: 'ขุมพลังกราฟิกขั้นเทพพร้อมหน่วยความจำเครื่องขนาดใหญ่มาก อัตราการรีเฟรชหน้าจอสูงปรี๊ด 240Hz ภาพคมชัดรวดเร็ว ระบบระบายความร้อนเทคโนโลยีลิควิดเมทัลนิ่งเย็นเสถียร',
      shopName: 'ASUS Republic of Gamers'
    },
    {
      id: 'lvl7-p5',
      title: 'จักรยานเสือหมอบคาร์บอนระดับแข่งขัน Professional Carbon Road Bike น้ำหนักเบาหวิวขี่สปีดสูงลู่ลมทรงพลังสำหรับสายแข่ง',
      price: 48500,
      originalPrice: 62000,
      discount: '-21%',
      salesText: 'ขายแล้ว 150+',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80',
      deliveryTime: 'พรุ่งนี้',
      location: 'สมุทรปราการ',
      rating: 4.9,
      reviewsCount: 54,
      description: 'เฟรมและตะเกียบทำจากคาร์บอนไฟเบอร์เกรดพิเศษลู่ลมยอดเยี่ยม ลดแรงสั่นสะเทือนปั่นนุ่มสบาย ชุดเกียร์สเปกสูงเปลี่ยนเกียร์สมูทคล่องตัวทุกสภาพเส้นทางภูเขาและทางเรียบ',
      shopName: 'Cycle Pro Shop'
    },
    {
      id: 'lvl7-p6',
      title: 'โน้ตบุ๊กทำงานระดับโปรสูงสุด MacBook Pro 14" Apple M3 ชิปเซ็ตประมวลผลอัจฉริยะ หน้าจอสมจริงแบตเตอรี่ยาวนานทำงานกราฟิกเทพ',
      price: 49900,
      originalPrice: 59900,
      discount: '-16%',
      salesText: 'ขายแล้ว 680+',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
      deliveryTime: '< 2 วัน',
      location: 'กรุงเทพมหานคร',
      rating: 4.9,
      reviewsCount: 320,
      description: 'คอมพิวเตอร์พกพายอดนิยมสำหรับมืออาชีพและคอนเทนต์ครีเอเตอร์ ชิปประมวลผลความเร็วสูงประหยัดพลังงาน แบตเตอรี่ยาวนานสูงสุด 22 ชั่วโมงต่อการชาร์จครั้งเดียวจอสุดตระการตา',
      shopName: 'Apple Authorized Store'
    }
  ]
};
