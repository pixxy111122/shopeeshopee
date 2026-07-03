/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Product, Coupon, NotificationItem, ChatSession, CartItem, OrderDetails, ChatMessage } from './types';
import {
  mockProducts,
  mockCoupons,
  mockNotifications,
  mockChatSessions
} from './mockData';
import HomeTab from './components/HomeTab';
import MallTab from './components/MallTab';
import OrderTab from './components/OrderTab';
import NotificationsTab from './components/NotificationsTab';
import MeTab from './components/MeTab';
import ProductDetail from './components/ProductDetail';
import CartModal from './components/CartModal';
import ChatModal from './components/ChatModal';
import LoginView from './components/LoginView';
import AdminPanel from './components/AdminPanel';
import SupportModal from './components/SupportModal';
import WalletModal from './components/WalletModal';
import { Home, ShoppingBag, Bell, User, ShoppingCart, MessageCircle, AlertCircle, Info, RefreshCw, Smartphone, ClipboardList, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- CORE APPLICATION STATES & AUTHENTICATION ---
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('shopee_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const [settings, setSettings] = useState<any>({
    siteName: 'Shopee',
    siteLogo: '',
    siteIcon: '',
    themeColor: '#ea580c',
    slides: []
  });

  // Dynamically update document title and favicon based on system settings
  useEffect(() => {
    if (settings) {
      document.title = settings.siteName || 'Shopee';
      if (settings.siteIcon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.siteIcon;
      }
    }
  }, [settings]);

  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  // Fetch settings and products from server backend on mount and poll in the background
  useEffect(() => {
    const fetchData = async () => {
      // Fetch settings (unless showAdminPanel is open to protect unsaved editing states)
      if (!showAdminPanel) {
        try {
          const response = await fetch('/api/settings');
          if (response.ok) {
            const data = await response.json();
            setSettings(data);
          }
        } catch (err) {
          console.error('Failed to load system settings:', err);
        }
      }

      // Fetch products dynamically to sync with server in real-time
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [showAdminPanel]);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(mockChatSessions);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [shopeeCoins, setShopeeCoins] = useState(150);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Home, 1: Mall, 2: Live, 3: Notifications, 4: Me

  // Sub-views overlays
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<'history' | 'withdraw'>('history');
  
  // Custom toast notification state
  const [globalToast, setGlobalToast] = useState<{ text: string; icon?: string } | null>(null);

  // My purchases counter state for Me Tab
  const [ordersCount, setOrdersCount] = useState({
    toPay: 1,
    toShip: 1,
    toReceive: 1,
    toRate: 4
  });

  // Calculate badges
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const chatUnreadCount = chatSessions.filter(s => s.unread).length;
  const notifUnreadCount = notifications.filter(n => !n.read).length;

  const lastTxsRef = useRef<any[]>([]);

  // Strictly filter notifications: keep only deposit, withdrawal, bonus, and level up notifications. Clear any others.
  useEffect(() => {
    const isAllowedNotification = (n: NotificationItem): boolean => {
      const title = (n.title || '').toLowerCase();
      const msg = (n.message || '').toLowerCase();
      const text = `${title} ${msg}`;
      return (
        text.includes('เติมเงิน') ||
        text.includes('ถอนเงิน') ||
        text.includes('ถอน') ||
        text.includes('โบนัส') ||
        text.includes('bonus') ||
        text.includes('เลเวล') ||
        text.includes('level')
      );
    };

    const filtered = notifications.filter(isAllowedNotification);
    if (filtered.length !== notifications.length) {
      setNotifications(filtered);
    }
  }, [notifications]);

  // Clear mock notifications for a logged-in user so they start fresh
  useEffect(() => {
    if (user?.phone) {
      setNotifications([]);
    } else {
      setNotifications(mockNotifications);
    }
  }, [user?.phone]);

  // Real-time polling of transaction updates (deposits & withdrawals) to push notifications
  useEffect(() => {
    const phone = user?.phone;
    if (!phone) {
      lastTxsRef.current = [];
      return;
    }

    const pollTransactions = async () => {
      try {
        const res = await fetch(`/api/transactions?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          const lastTxs = lastTxsRef.current;

          if (lastTxs.length > 0) {
            data.forEach((tx: any) => {
              const oldTx = lastTxs.find((t) => t.id === tx.id);
              if (!oldTx) {
                // New transaction created!
                const isDeposit = tx.type === 'deposit';
                const newTxNotif: NotificationItem = {
                  id: `notif-tx-new-${tx.id}-${Date.now()}`,
                  title: isDeposit ? 'คำขอเติมเงินได้รับการบันทึกแล้ว 💳' : 'ส่งคำขอถอนเงินสำเร็จ 💰',
                  statusText: 'การเงิน',
                  message: isDeposit 
                    ? `ระบบได้รับคำขอเติมเงินจำนวน ฿${tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ของคุณแล้วและกำลังอยู่ในระหว่างการตรวจสอบค่ะ`
                    : `ระบบได้รับคำขอถอนเงินจำนวน ฿${tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ของคุณแล้วและกำลังส่งเจ้าหน้าที่พิจารณาค่ะ`,
                  time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้',
                  type: 'finance',
                  read: false
                };
                setNotifications((prev) => [newTxNotif, ...prev]);
              } else if (oldTx.status !== tx.status) {
                // Transaction status changed (approved / rejected)!
                const isDeposit = tx.type === 'deposit';
                const isApproved = tx.status === 'approved';
                let title = '';
                let msg = '';
                if (isDeposit) {
                  title = isApproved ? 'ฝากเงิน (เติมเงิน) สำเร็จเรียบร้อย 💳' : 'คำขอเติมเงินไม่ผ่านการอนุมัติ ❌';
                  msg = isApproved 
                    ? `ยอดเงินฝากจำนวน ฿${tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ได้เติมเข้ากระเป๋าเงิน ShopeePay Wallet ของคุณเสร็จสมบูรณ์แล้วค่ะ!`
                    : `คำขอเติมเงินจำนวน ฿${tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ได้รับการปฏิเสธเนื่องจากข้อมูลไม่สอดคล้อง กรุณาติดต่อฝ่ายบริการลูกค้า`;
                } else {
                  title = isApproved ? 'ถอนเงินออกจากระบบสำเร็จเรียบร้อย 💰' : 'คำขอถอนเงินถูกปฏิเสธ ❌';
                  msg = isApproved
                    ? `การถอนเงินจำนวน ฿${tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ไปยังบัญชีธนาคารของคุณเสร็จสิ้นเรียบร้อยแล้วค่ะ!`
                    : `คำขอถอนเงินจำนวน ฿${tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ไม่สำเร็จเนื่องจากข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง`;
                }

                const txNotif: NotificationItem = {
                  id: `notif-tx-status-${tx.id}-${Date.now()}`,
                  title,
                  statusText: 'การเงิน',
                  message: msg,
                  time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้',
                  type: 'finance',
                  read: false
                };
                setNotifications((prev) => [txNotif, ...prev]);
              }
            });
          }
          lastTxsRef.current = data;
        }
      } catch (err) {
        console.error('Failed to poll transactions for notifications:', err);
      }
    };

    pollTransactions();
    const interval = setInterval(pollTransactions, 3000);
    return () => clearInterval(interval);
  }, [user?.phone]);

  // Realtime user profile polling from backend (updates frontend immediately in real-time)
  useEffect(() => {
    const phone = user?.phone;
    if (!phone) return;
    
    const pollProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile?phone=${encodeURIComponent(phone)}`);
        if (response.ok) {
          const fetchedUser = await response.json();

          // Verify if the user account is banned or blocked on the backend
          if (fetchedUser.isBanned || fetchedUser.isBlocked) {
            setUser(null);
            localStorage.removeItem('shopee_logged_in_user');
            setShowLoginScreen(true);
            triggerToast('บัญชีของคุณถูกระงับหรืออายัดบนระบบหลังบ้านเรียบร้อยแล้วค่ะ 🔒', '🔒');
            return;
          }

          // Check if any key properties have changed before updating state
          setUser((prevUser: any) => {
            if (!prevUser) return fetchedUser;
            const keysToCompare = [
              'username', 'phone', 'balance', 'commission', 'frozen', 'level', 
              'isBlocked', 'isBanned', 'role', 'realName', 'bankName', 'bankAccount', 
              'rawPassword', 'transactionPassword', 'country', 'accountCategory'
            ];
            const hasChanged = keysToCompare.some(k => prevUser[k] !== fetchedUser[k]);
            if (hasChanged) {
              // Trigger real-time level up notification if level increases
              if (prevUser.level !== undefined && fetchedUser.level !== undefined && fetchedUser.level > prevUser.level) {
                const newLvlNotif: NotificationItem = {
                  id: `notif-lvl-${Date.now()}`,
                  title: 'ยินดีด้วยกับการปรับเลเวลขึ้นสำเร็จ! 🚀',
                  statusText: 'ระดับเลเวล',
                  message: `บัญชีของคุณได้รับการปรับเลเวลขึ้นจาก Level ${prevUser.level === -1 ? 'Member' : prevUser.level} เป็น Level ${fetchedUser.level === -1 ? 'Member' : fetchedUser.level} เรียบร้อยแล้วค่ะ ปลดล็อกสิทธิ์ทำออเดอร์คอมมิชชั่นสูงขึ้นทันที!`,
                  time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้',
                  type: 'finance',
                  read: false
                };
                setNotifications((prev) => [newLvlNotif, ...prev]);
              }

              localStorage.setItem('shopee_logged_in_user', JSON.stringify(fetchedUser));
              return fetchedUser;
            }
            return prevUser;
          });
        } else if (response.status === 404 || response.status === 401) {
          // If user doesn't exist on the backend anymore, force logout immediately
          setUser(null);
          localStorage.removeItem('shopee_logged_in_user');
          setShowLoginScreen(true);
          triggerToast('ไม่พบบัญชีผู้ใช้ของคุณบนระบบหลังบ้าน กรุณาใช้บัญชีที่ได้รับอนุญาตเท่านั้นค่ะ 🔒', '🔒');
        }
      } catch (err) {
        console.error('Failed to poll user profile:', err);
      }
    };

    // Poll immediately, then every 3 seconds
    pollProfile();
    const interval = setInterval(pollProfile, 3000);
    return () => clearInterval(interval);
  }, [user?.phone]);

  // --- UTILITY HANDLERS & GUARDS ---

  const ensureUserLoggedIn = (action: () => void): boolean => {
    if (!user) {
      setShowLoginScreen(true);
      triggerToast('กรุณาเข้าสู่ระบบบัญชีผู้ใช้เพื่อใช้งานฟังก์ชันนี้ค่ะ 🔒', '🔒');
      return false;
    }
    action();
    return true;
  };

  const handleTabClick = (tabIdx: number) => {
    if (tabIdx === 0) {
      setActiveTab(0);
    } else {
      ensureUserLoggedIn(() => {
        setActiveTab(tabIdx);
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shopee_logged_in_user');
    setShowLoginScreen(true);
    triggerToast('ออกจากระบบเรียบร้อยแล้วค่ะ 👋', '👋');
  };

  const handleSyncUserBalances = async (balance: number, commission: number, ordersCompleted: number, frozen: number) => {
    if (!user) return;
    if (
      user.balance === balance &&
      user.commission === commission &&
      user.ordersCompleted === ordersCompleted &&
      user.frozen === frozen
    ) {
      return;
    }
    try {
      const response = await fetch('/api/users/sync-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          balance,
          commission,
          ordersCompleted,
          frozen
        })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('shopee_logged_in_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Error syncing balances:', err);
    }
  };

  const triggerToast = (text: string, icon = '✅') => {
    setGlobalToast({ text, icon });
    setTimeout(() => setGlobalToast(null), 3000);
  };

  // 1. Daily coins Check-In handler
  const handleCheckIn = () => {
    ensureUserLoggedIn(() => {
      if (hasCheckedInToday) return;
      setShopeeCoins((prev) => prev + 10);
      setHasCheckedInToday(true);
      triggerToast('เช็คอินสำเร็จ! +10 Coins 🪙', '🪙');

      // Push new activity update notification
      const newNotif: NotificationItem = {
        id: `notif-checkin-${Date.now()}`,
        title: 'ได้รับโบนัสเช็คอินประจำวันสำเร็จ 🪙',
        message: 'ยินดีด้วย! คุณได้รับโบนัส 10 Shopee Coins เข้าสู่กระเป๋าเงินเหรียญของคุณเรียบร้อยแล้ว พรุ่งนี้ห้ามลืมกลับมากดรับเหรียญสะสมเพิ่มอีกรอบนะ!',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้',
        type: 'finance',
        read: false
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });
  };

  // 2. Coupon Collection Claim handler
  const handleClaimCoupon = (couponId: string) => {
    ensureUserLoggedIn(() => {
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponId ? { ...c, isCollected: true } : c))
      );
      const claimed = coupons.find((c) => c.id === couponId);
      if (claimed) {
        triggerToast(`เก็บคูปองส่วนลดสำเร็จแล้ว!`, '🎟️');
      }
    });
  };

  // 3. Product adding to Cart handler
  const handleAddToCart = (product: Product, quantity: number, variant?: string) => {
    ensureUserLoggedIn(() => {
      const itemId = `${product.id}-${variant || ''}`;
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === itemId);
        if (existing) {
          return prev.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          return [...prev, { id: itemId, product, quantity, selectedVariant: variant, selected: true }];
        }
      });
      triggerToast(`เพิ่มสินค้าลงรถเข็นเรียบร้อย!`, '🛒');
    });
  };

  // 4. Product direct Buy Now checkout trigger
  const handleBuyNow = (product: Product, quantity: number, variant?: string) => {
    ensureUserLoggedIn(() => {
      const itemId = `${product.id}-${variant || ''}`;
      // Insert item to cart and select it, deselecting others
      setCartItems(() => [
        { id: itemId, product, quantity, selectedVariant: variant, selected: true }
      ]);
      setSelectedProduct(null);
      setIsCartOpen(true);
    });
  };

  // 5. Cart Quantity Modification
  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // 6. Cart item deletion
  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    triggerToast('ลบรายการสินค้าออกแล้ว', '🗑️');
  };

  // 7. Cart Select toggler
  const handleToggleSelectItem = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // 8. Interactive Cart Transaction checkout submit settlement
  const handleCheckout = (checkoutList: CartItem[], appliedCoupon: Coupon | null) => {
    // Remove checked-out items from cart
    const checkoutIds = new Set(checkoutList.map((item) => item.id));
    setCartItems((prev) => prev.filter((item) => !checkoutIds.has(item.id)));

    // Increment ordersCount: To Ship stage
    setOrdersCount((prev) => ({
      ...prev,
      toShip: prev.toShip + checkoutList.length
    }));

    // Generate dynamic tracking notification
    const orderNo = `SHP-${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;
    const productTitleStr = checkoutList.map((item) => item.product.title).join(', ');
    
    const newNotif: NotificationItem = {
      id: `notif-order-${Date.now()}`,
      title: 'ชำระเงินเรียบร้อยและสั่งซื้อสำเร็จ 📦',
      statusText: 'เตรียมจัดส่ง',
      message: `ขอบคุณที่สั่งซื้อ! หมายเลขคำสั่งซื้อของคุณคือ ${orderNo} ร้านค้าได้รับเงินโอนแล้วและกำลังแพ็กเกจห่อหุ้มสินค้าเพื่อเตรียมจัดส่งสินค้าเร็วที่สุด`,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้',
      type: 'order',
      read: false,
      order: {
        orderId: orderNo,
        status: 'to_ship',
        productName: checkoutList[0].product.title,
        productImage: checkoutList[0].product.image,
        price: checkoutList[0].product.price,
        quantity: checkoutList[0].quantity,
        variant: checkoutList[0].selectedVariant,
        date: '25-06-2026'
      }
    };

    setNotifications((prev) => [newNotif, ...prev]);
    triggerToast('สั่งซื้อสำเร็จ! รอการจัดส่งสินค้า', '🎉');
  };

  // 9. Notifications "Confirm Receipt" (สินค้าถูกจัดส่งแล้ว) order settlement
  const handleConfirmReceipt = (orderId: string) => {
    // Move count from To Receive to To Rate
    setOrdersCount((prev) => ({
      ...prev,
      toReceive: Math.max(0, prev.toReceive - 1),
      toRate: prev.toRate + 1
    }));

    // Grant Shopee Coins reward for final feedback confirmation
    setShopeeCoins((prev) => prev + 50);

    // Update notifications list statuses
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.order && n.order.orderId === orderId) {
          return {
            ...n,
            title: 'คำสั่งซื้อจัดส่งเสร็จสมบูรณ์แล้ว ✅',
            statusText: 'สำเร็จ',
            message: `ยืนยันรับคำสั่งซื้อเลขที่ ${orderId} สำเร็จแล้ว เงินโอนถูกปล่อยให้กับผู้ขายเรียบร้อย ได้รับโบนัส 50 Coins เรียบร้อย!`,
            order: { ...n.order, status: 'to_rate' }
          };
        }
        return n;
      })
    );

    triggerToast('ยืนยันรับสินค้าสำเร็จ! ได้รับ +50 Coins 🪙', '🪙');
  };

  // 10. Open Chat directly with specific shops
  const handleOpenChatWithShop = (shopName: string, shopLogo: string) => {
    setSelectedProduct(null);
    setIsChatOpen(true);
    // Find or create chat session
    const existing = chatSessions.find((s) => s.shopName === shopName);
    if (existing) {
      setActiveChatSessionId(existing.id);
    } else {
      const newSessionId = `chat-session-${Date.now()}`;
      const newSession: ChatSession = {
        id: newSessionId,
        shopName,
        shopLogo,
        lastMessage: 'แชทเริ่มต้นใหม่ของคุณ',
        unread: false,
        onlineStatus: 'กำลังออนไลน์',
        messages: [
          { id: 'start', sender: 'shop', text: `สวัสดีค่ะคุณลูกค้า ยินดีต้อนรับสู่แชททางร้านค้าทางการนะคะ สามารถสอบถามสั่งซื้อสินค้าตัวช่วยจัดส่งไวได้ค่ะ ✨`, time: '12:00' }
        ]
      };
      setChatSessions((prev) => [newSession, ...prev]);
      setActiveChatSessionId(newSessionId);
    }
  };

  // 11. Send Chat message and mark as read
  const handleSendMessage = (sessionId: string, text: string) => {
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const sender = s.messages[s.messages.length - 1]?.sender === 'user' ? 'shop' : 'user';
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: sender, // Alternate based on last sender or handle user input manually
            text,
            time: '25-06-2026 ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          };
          return {
            ...s,
            messages: [...s.messages, newMsg],
            lastMessage: text,
            unread: sender === 'shop' // Unread only if shop replies
          };
        }
        return s;
      })
    );
  };

  // User input messaging logic wrapper
  const handleUserSendMessage = (sessionId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text,
      time: '25-06-2026 ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [...s.messages, newMsg],
            lastMessage: text,
            unread: false
          };
        }
        return s;
      })
    );
  };

  const handleMarkChatRead = (sessionId: string) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, unread: false } : s))
    );
  };

  const handleOrderTabAddHistory = (product: Product, quantity: number, price: number, commission: number) => {
    // Increment ship order count in profile tab
    setOrdersCount(prev => ({
      ...prev,
      toShip: prev.toShip + 1
    }));

    // Trigger toast
    triggerToast(`สั่งซื้อเรียบร้อย! ได้รับ +฿${commission.toFixed(2)}`, '🎉');

    // Create a new order notification so it appears in "การแจ้งเตือน" tab
    const newNotif: NotificationItem = {
      id: `notif-order-${Date.now()}`,
      title: 'ออเดอร์จับคู่สำเร็จและได้รับการชำระเงิน',
      statusText: 'สถานะสั่งซื้อ',
      message: `คุณได้ทำรายการสั่งซื้อสินค้า "${product.title}" สำเร็จแล้ว ระบบหักเงินสุทธิ ฿${price} และป้อนผลตอบแทนคอมมิชชั่นสะสม +฿${commission.toFixed(2)} เข้ากระเป๋าเรียบร้อยแล้วค่ะ`,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' วันนี้',
      image: product.image,
      type: 'order',
      read: false,
      order: {
        orderId: `ORD-${Math.floor(Math.random() * 90000000000) + 10000000000}`,
        status: 'to_ship',
        productName: product.title,
        productImage: product.image,
        price: price,
        quantity: quantity,
        variant: product.variants?.[0] || 'คละแบบ',
        date: new Date().toLocaleDateString('th-TH')
      }
    };
    
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleProductClick = (product: Product) => {
    ensureUserLoggedIn(() => {
      // Do NOT set selected product to prevent opening product details view
      // setSelectedProduct(product);
      const url = product.productLink || `https://shopee.co.th/search?keyword=${encodeURIComponent(product.title)}`;
      try {
        window.open(url, '_blank');
      } catch (e) {
        console.error('Failed to open product link:', e);
      }
    });
  };

  // --- DUMMY RESET RE-INITIALIZER ---
  const handleResetData = () => {
    setCartItems([]);
    setShopeeCoins(150);
    setHasCheckedInToday(false);
    setCoupons(mockCoupons);
    setNotifications(mockNotifications);
    setChatSessions(mockChatSessions);
    setOrdersCount({
      toPay: 1,
      toShip: 1,
      toReceive: 1,
      toRate: 4
    });
    triggerToast('รีเซ็ตข้อมูลระบบ Shopee เรียบร้อยแล้ว!', '🔄');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col select-none relative overflow-x-hidden">
      
      {/* MAIN PORTAL VIEWPORT - Fluidly responsive and full screen for Laptop, Tablet, and Smartphone */}
      <div className="w-full flex-1 flex flex-col relative min-h-screen">
        
        {/* ACTIVE MAIN TAB CONTROLLER ROUTER WITH LOGIN & ADMIN GUARDS */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-24 scrollbar-none">
          {showLoginScreen ? (
            <LoginView
              settings={settings}
              onSettingsUpdate={setSettings}
              isAdmin={user?.role === 'admin'}
              onLoginSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                localStorage.setItem('shopee_logged_in_user', JSON.stringify(loggedInUser));
                setShowLoginScreen(false);
                triggerToast(`ยินดีต้อนรับกลับ คุณ ${loggedInUser.username}! 👋`, '👋');
              }}
              onClose={() => setShowLoginScreen(false)}
            />
          ) : showAdminPanel && user?.role === 'admin' ? (
            <AdminPanel
              currentUser={user}
              onBack={() => setShowAdminPanel(false)}
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings(newSettings)}
              onRefreshProducts={fetchProducts}
            />
          ) : (
            <>
              {activeTab === 0 && (
                <HomeTab
                  products={products}
                  cartCount={cartCount}
                  chatUnreadCount={chatUnreadCount}
                  shopeeCoins={shopeeCoins}
                  onProductClick={handleProductClick}
                  onCheckIn={handleCheckIn}
                  onOpenCart={() => setIsCartOpen(true)}
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onOpenChat={() => setIsChatOpen(true)}
                  onSearch={(q) => console.log('Searching: ', q)}
                  hasCheckedInToday={hasCheckedInToday}
                  settings={settings}
                  onOpenWallet={(tab) => {
                    setWalletTab(tab || 'withdraw');
                    setIsWalletOpen(true);
                  }}
                />
              )}

              {activeTab === 1 && (
                <MallTab
                  products={products}
                  coupons={coupons}
                  cartCount={cartCount}
                  onClaimCoupon={handleClaimCoupon}
                  onProductClick={handleProductClick}
                  onOpenCart={() => setIsCartOpen(true)}
                  onOpenSupport={() => setIsSupportOpen(true)}
                />
              )}

              {activeTab === 2 && (
                <OrderTab
                  onProductClick={handleProductClick}
                  onAddOrderToHistory={handleOrderTabAddHistory}
                  user={user}
                  onSyncUserBalances={handleSyncUserBalances}
                  onOpenWallet={(tab) => {
                    setWalletTab(tab || 'withdraw');
                    setIsWalletOpen(true);
                  }}
                  products={products}
                />
              )}

              {activeTab === 3 && (
                <NotificationsTab
                  notifications={notifications}
                  cartCount={cartCount}
                  chatUnreadCount={chatUnreadCount}
                  onConfirmReceipt={handleConfirmReceipt}
                  onOpenCart={() => setIsCartOpen(true)}
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onOpenChat={() => setIsChatOpen(true)}
                />
              )}

              {activeTab === 4 && (
                <MeTab
                  shopeeCoins={shopeeCoins}
                  cartCount={cartCount}
                  chatUnreadCount={chatUnreadCount}
                  onOpenCart={() => setIsCartOpen(true)}
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onOpenChat={() => setIsChatOpen(true)}
                  ordersCount={ordersCount}
                  onCheckIn={handleCheckIn}
                  hasCheckedInToday={hasCheckedInToday}
                  onSelectTab={(idx) => handleTabClick(idx)}
                  user={user}
                  onLogout={handleLogout}
                  onOpenAdminPanel={() => setShowAdminPanel(true)}
                  onOpenWallet={() => {
                    setWalletTab('history');
                    setIsWalletOpen(true);
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* FLOATING PERSISTENT BOTTOM TAB MENU RAIL BAR (Pure high fidelity Shopee) */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 px-4 py-2.5 flex items-center justify-around z-40 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          
          {/* หน้าแรก (Home) */}
          <button
            onClick={() => handleTabClick(0)}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors ${activeTab === 0 && !showLoginScreen && !showAdminPanel ? 'text-red-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Home className="w-5.5 h-5.5" />
            <span className="text-[9px]">หน้าแรก</span>
          </button>

          {/* Mall */}
          <button
            onClick={() => handleTabClick(1)}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors ${activeTab === 1 && !showLoginScreen && !showAdminPanel ? 'text-red-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShoppingBag className="w-5.5 h-5.5" />
            <span className="text-[9px]">Mall</span>
          </button>

          {/* Order */}
          <button
            onClick={() => handleTabClick(2)}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors ${activeTab === 2 && !showLoginScreen && !showAdminPanel ? 'text-red-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ClipboardList className="w-5.5 h-5.5" />
            <span className="text-[9px]">Order</span>
          </button>

          {/* การแจ้งเตือน (Notifications) */}
          <button
            onClick={() => handleTabClick(3)}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors relative ${activeTab === 3 && !showLoginScreen && !showAdminPanel ? 'text-red-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Bell className="w-5.5 h-5.5" />
            <span className="text-[9px]">การแจ้งเตือน</span>
            {notifUnreadCount > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                {notifUnreadCount}
              </span>
            )}
          </button>

          {/* ฉัน (Me) */}
          <button
            onClick={() => handleTabClick(4)}
            className={`flex flex-col items-center gap-0.5 w-14 transition-colors ${activeTab === 4 && !showLoginScreen && !showAdminPanel ? 'text-red-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[9px]">ฉัน</span>
          </button>
        </div>

        {/* OVERLAYS SYSTEM ROUTER MODALS */}
        <AnimatePresence>
          {/* A. Product details modal card slide-over (DISABLED by request to prevent opening product details) */}
          {/* {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onOpenChatWithShop={handleOpenChatWithShop}
            />
          )} */}

          {/* B. Cart Drawer bottom modal */}
          {isCartOpen && (
            <CartModal
              cartItems={cartItems}
              claimedCoupons={coupons}
              onClose={() => setIsCartOpen(false)}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onToggleSelectItem={handleToggleSelectItem}
              onCheckout={handleCheckout}
            />
          )}

          {/* C. Interactive Live Chat system modal */}
          {isChatOpen && (
            <ChatModal
              sessions={chatSessions}
              onClose={() => {
                setIsChatOpen(false);
                setActiveChatSessionId(null);
              }}
              onSendMessage={handleUserSendMessage}
              onMarkRead={handleMarkChatRead}
              activeSessionId={activeChatSessionId}
              onSelectSession={(id) => setActiveChatSessionId(id)}
            />
          )}

          {/* D. Interactive Support Modal */}
          {isSupportOpen && (
            <SupportModal
              settings={settings}
              onClose={() => setIsSupportOpen(false)}
            />
          )}

          {/* D2. ShopeePay Wallet Modal */}
          {isWalletOpen && (
            <WalletModal
              isOpen={isWalletOpen}
              onClose={() => setIsWalletOpen(false)}
              initialTab={walletTab}
              user={user}
              onSyncUser={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem('shopee_logged_in_user', JSON.stringify(updatedUser));
              }}
            />
          )}

          {/* E. Global Slide-in Bottom Notification Toast Alert */}
          {globalToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white border border-slate-800 shadow-2xl backdrop-blur-md px-4 py-2 rounded-xl text-center flex items-center gap-2.5 z-50 text-xs min-w-[200px]"
            >
              <span>{globalToast.icon}</span>
              <span className="font-bold leading-tight">{globalToast.text}</span>
            </motion.div>
          )}
          {/* F. Dynamic Branding style block override */}
          <style>{`
            :root {
              --theme-color-primary: ${settings?.themeColor || '#ea580c'};
            }
            .text-theme-primary {
              color: var(--theme-color-primary) !important;
            }
            .bg-theme-primary {
              background-color: var(--theme-color-primary) !important;
            }
            .border-theme-primary {
              border-color: var(--theme-color-primary) !important;
            }
            /* Override tab highlights and primary buttons */
            .text-red-600 {
              color: var(--theme-color-primary) !important;
            }
            .bg-gradient-to-r.from-red-600.to-orange-500 {
              background: var(--theme-color-primary) !important;
            }
            .bg-orange-500 {
              background-color: var(--theme-color-primary) !important;
            }
            .text-orange-500 {
              color: var(--theme-color-primary) !important;
            }
            .text-orange-600 {
              color: var(--theme-color-primary) !important;
            }
            .border-orange-500 {
              border-color: var(--theme-color-primary) !important;
            }
          `}</style>
        </AnimatePresence>
      </div>
    </div>
  );
}
