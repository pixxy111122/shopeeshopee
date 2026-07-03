/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Edit2,
  Search,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Ban,
  Key,
  Landmark,
  DollarSign,
  Award,
  Save,
  X,
  Palette,
  Layers,
  Image,
  Plus,
  Trash2,
  Sliders,
  Check,
  Globe,
  Settings,
  Phone,
  User,
  Activity,
  Info,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  onBack: () => void;
  currentUser: any;
  settings: any;
  onUpdateSettings: (newSettings: any) => void;
  onRefreshProducts?: () => void;
}

// 100 beautiful color palette for extreme control, grouped by style hues
const SWATCHES_100 = [
  // Red & Ruby
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#fee2e2', '#fca5a5', '#f87171', '#ef4444', '#dc2626',
  // Orange & Coral
  '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316',
  // Amber & Yellow
  '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b',
  // Green & Lime
  '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399',
  // Emerald & Teal
  '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf',
  // Blue & Sky
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#172554', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6',
  // Indigo & Violet
  '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1',
  // Purple & Fuchsia
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa',
  // Pink & Rose
  '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899',
  // Slate & Charcoal
  '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'
];

export default function AdminPanel({ onBack, currentUser, settings, onUpdateSettings, onRefreshProducts }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'admins' | 'settings' | 'home_products' | 'activity_products' | 'customer_orders' | 'deposit' | 'withdraw' | 'deposit_history' | 'withdraw_history'>('members');
  
  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<'all' | 'Thailand' | 'Laos'>('all');
  
  // Modals States
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);

  // Form fields for creating user
  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCountry, setNewCountry] = useState<'Thailand' | 'Laos'>('Thailand');
  const [newAccountCategory, setNewAccountCategory] = useState<'customer' | 'merchant'>('customer');

  // Form fields for creating admin
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');

  // Settings modification states
  const [siteName, setSiteName] = useState(settings?.siteName || 'Shopee');
  const [siteLogo, setSiteLogo] = useState(settings?.siteLogo || '');
  const [siteIcon, setSiteIcon] = useState(settings?.siteIcon || '');
  const [themeColor, setThemeColor] = useState(settings?.themeColor || '#ea580c');
  const [slides, setSlides] = useState<any[]>(settings?.slides || []);
  const [lineUrl, setLineUrl] = useState(settings?.lineUrl || '');
  const [whatsappUrl, setWhatsappUrl] = useState(settings?.whatsappUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(settings?.facebookUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(settings?.tiktokUrl || '');

  // Custom Buttons States
  const [shopeefoodLogo, setShopeefoodLogo] = useState(settings?.shopeefoodLogo || '');
  const [shopeefoodUrl, setShopeefoodUrl] = useState(settings?.shopeefoodUrl || '');
  const [shopeefoodLabel, setShopeefoodLabel] = useState(settings?.shopeefoodLabel || '');
  const [shopeefoodSubLabel, setShopeefoodSubLabel] = useState(settings?.shopeefoodSubLabel || '');

  const [freeshippingLogo, setFreeshippingLogo] = useState(settings?.freeshippingLogo || '');
  const [freeshippingUrl, setFreeshippingUrl] = useState(settings?.freeshippingUrl || '');
  const [freeshippingLabel, setFreeshippingLabel] = useState(settings?.freeshippingLabel || '');
  const [freeshippingSubLabel, setFreeshippingSubLabel] = useState(settings?.freeshippingSubLabel || '');

  const [paydayLogo, setPaydayLogo] = useState(settings?.paydayLogo || '');
  const [paydayUrl, setPaydayUrl] = useState(settings?.paydayUrl || '');
  const [paydayLabel, setPaydayLabel] = useState(settings?.paydayLabel || '');
  const [paydaySubLabel, setPaydaySubLabel] = useState(settings?.paydaySubLabel || '');

  const [instantLogo, setInstantLogo] = useState(settings?.instantLogo || '');
  const [instantUrl, setInstantUrl] = useState(settings?.instantUrl || '');
  const [instantLabel, setInstantLabel] = useState(settings?.instantLabel || '');
  const [instantSubLabel, setInstantSubLabel] = useState(settings?.instantSubLabel || '');

  const [flashdealLogo, setFlashdealLogo] = useState(settings?.flashdealLogo || '');
  const [flashdealUrl, setFlashdealUrl] = useState(settings?.flashdealUrl || '');
  const [flashdealLabel, setFlashdealLabel] = useState(settings?.flashdealLabel || '');
  const [flashdealSubLabel, setFlashdealSubLabel] = useState(settings?.flashdealSubLabel || '');

  // Slide creation state
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideDesc, setSlideDesc] = useState('');
  const [slideDiscount, setSlideDiscount] = useState('');
  const [slideBg, setSlideBg] = useState('from-orange-500 via-red-600 to-pink-600');
  const [slideImage, setSlideImage] = useState('');

  // Products, Activity Products, and Matching states
  const [homeProducts, setHomeProducts] = useState<any[]>([]);
  const [activityProducts, setActivityProducts] = useState<any[]>([]);
  const [matchRequests, setMatchRequests] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Custom Delete confirmation modal states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmMode, setDeleteConfirmMode] = useState<'home' | 'activity' | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState<string>('');

  // Modal and Form states for Products (Home & Activity)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productMode, setProductMode] = useState<'home' | 'activity'>('home'); // 'home' or 'activity'
  
  // Product Form Fields
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOriginalPrice, setPOriginalPrice] = useState('');
  const [pDiscount, setPDiscount] = useState('');
  const [pSalesText, setPSalesText] = useState('');
  const [pImage, setPImage] = useState('');
  const [pDeliveryTime, setPDeliveryTime] = useState('พรุ่งนี้');
  const [pLocation, setPLocation] = useState('จังหวัดกรุงเทพมหานคร');
  const [pDescription, setPDescription] = useState('');
  const [pIsMall, setPIsMall] = useState(false);
  const [pIsHot, setPIsHot] = useState(false);
  const [pIsLive, setPIsLive] = useState(false);
  const [pShopName, setPShopName] = useState('Shopee Official Shop');
  const [pVariants, setPVariants] = useState(''); // Comma separated
  const [pImages, setPImages] = useState<string[]>([]); // Multiple product images
  const [pProductLink, setPProductLink] = useState(''); // Product external link

  // Assign Order Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMatchRequest, setSelectedMatchRequest] = useState<any | null>(null);

  // Global feedbacks
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  // --- WALLET & TRANSACTIONS ADMINISTRATIVE STATES ---
  const [txSearchPhone, setTxSearchPhone] = useState('');
  const [txTargetUser, setTxTargetUser] = useState<any | null>(null);
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [txSearchHistoryPhone, setTxSearchHistoryPhone] = useState('');
  const [txActionNote, setTxActionNote] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setAllTransactions(data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleSearchUserByPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setTxTargetUser(null);

    if (!txSearchPhone || txSearchPhone.trim().length === 0) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ที่ต้องการค้นหาค่ะ');
      return;
    }

    setTxLoading(true);
    try {
      const response = await fetch(`/api/users/profile?phone=${txSearchPhone.trim()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ไม่พบผู้ใช้นี้ในระบบหลังบ้านค่ะ');
      }
      setTxTargetUser(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี');
    } finally {
      setTxLoading(false);
    }
  };

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!txTargetUser) {
      setErrorMsg('กรุณาค้นหาเบอร์โทรศัพท์และเลือกผู้ใช้งานก่อนค่ะ');
      return;
    }

    const numAmount = parseFloat(txAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณากรอกจำนวนเงินให้ถูกต้องค่ะ');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: txTargetUser.phone,
          amount: numAmount,
          note: txNote,
          isAdmin: true
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถเติมเงินให้ผู้ใช้นี้ได้');
      }
      setSuccessMsg(`เติมเงินสำเร็จเข้าบัญชี ${txTargetUser.username} จำนวน ฿${numAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} แล้วค่ะ`);
      setTxAmount('');
      setTxNote('');
      setTxTargetUser(data.user);
      fetchTransactions();
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการทำรายการ');
    } finally {
      setUpdating(false);
    }
  };

  const handleExecuteWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!txTargetUser) {
      setErrorMsg('กรุณาค้นหาเบอร์โทรศัพท์และเลือกผู้ใช้งานก่อนค่ะ');
      return;
    }

    const numAmount = parseFloat(txAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณากรอกจำนวนเงินให้ถูกต้องค่ะ');
      return;
    }

    if (txTargetUser.balance < numAmount) {
      setErrorMsg('ยอดคงเหลือในบัญชีของผู้ใช้นี้ไม่เพียงพอสำหรับการหักหรือถอนเงินค่ะ');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: txTargetUser.phone,
          amount: numAmount,
          note: txNote,
          isAdmin: true
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถถอนเงินออกจากผู้ใช้นี้ได้');
      }
      setSuccessMsg(`หักเงินสำเร็จออกจากบัญชี ${txTargetUser.username} จำนวน ฿${numAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} แล้วค่ะ`);
      setTxAmount('');
      setTxNote('');
      setTxTargetUser(data.user);
      fetchTransactions();
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการทำรายการ');
    } finally {
      setUpdating(false);
    }
  };

  const handleTransactionAction = async (id: string, action: 'approve' | 'reject') => {
    setErrorMsg('');
    setSuccessMsg('');
    setUpdating(true);
    try {
      const response = await fetch('/api/transactions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          note: txActionNote
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถดำเนินการกับรายการนี้ได้');
      }
      setSuccessMsg(action === 'approve' ? 'อนุมัติรายการและปรับปรุงยอดเงินสำเร็จเรียบร้อยค่ะ' : 'ปฏิเสธรายการสำเร็จและโอนเงินคืนคลังเสร็จสิ้นค่ะ');
      setTxActionNote('');
      fetchTransactions();
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setUpdating(false);
    }
  };

  // Load members
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ค่ะ');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดรายชื่อสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setHomeProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchActivityProducts = async () => {
    setLoadingActivity(true);
    try {
      const response = await fetch('/api/activity-products');
      if (response.ok) {
        const data = await response.json();
        setActivityProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchMatchRequests = async () => {
    setLoadingMatches(true);
    try {
      const response = await fetch('/api/admin/match-requests');
      if (response.ok) {
        const data = await response.json();
        setMatchRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'home_products') {
      fetchHomeProducts();
    } else if (activeTab === 'activity_products') {
      fetchActivityProducts();
    } else if (activeTab === 'customer_orders') {
      fetchMatchRequests();
      fetchActivityProducts();
    } else if (['deposit', 'withdraw', 'deposit_history', 'withdraw_history'].includes(activeTab)) {
      fetchTransactions();
    }
  }, [activeTab]);

  useEffect(() => {
    let interval: any = null;
    if (activeTab === 'customer_orders') {
      interval = setInterval(() => {
        fetchMatchRequests();
      }, 3000);
    } else if (['deposit', 'withdraw'].includes(activeTab)) {
      // Real-time background polling for transactions and users
      const pollData = async () => {
        try {
          // Poll transactions silently to prevent screen blocking / spinner flickering
          const txRes = await fetch('/api/transactions');
          if (txRes.ok) {
            const data = await txRes.json();
            setAllTransactions(data);
          }
          
          // Poll users silently to keep user balances updated in the UI
          const usersRes = await fetch('/api/admin/users');
          if (usersRes.ok) {
            const data = await usersRes.json();
            setUsers(data);
            
            // If the admin has searched for a target user, update their details in real-time
            setTxTargetUser((prevTarget: any) => {
              if (!prevTarget) return null;
              const updated = data.find((u: any) => u.phone === prevTarget.phone);
              return updated || prevTarget;
            });
          }
        } catch (err) {
          console.error('Failed to silent background poll transactions:', err);
        }
      };
      interval = setInterval(pollData, 3000);
    } else if (activeTab === 'members') {
      // Poll members list in real-time
      const pollMembers = async () => {
        try {
          const usersRes = await fetch('/api/admin/users');
          if (usersRes.ok) {
            const data = await usersRes.json();
            setUsers(data);
          }
        } catch (err) {
          console.error('Failed to silent background poll members:', err);
        }
      };
      interval = setInterval(pollMembers, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  const handleOpenProductModal = (product: any | null, mode: 'home' | 'activity') => {
    setProductMode(mode);
    setEditingProduct(product);
    if (product) {
      setPTitle(product.title || '');
      setPPrice(product.price !== undefined ? product.price.toString() : '');
      setPOriginalPrice(product.originalPrice !== undefined ? product.originalPrice.toString() : '');
      setPDiscount(product.discount || '');
      setPSalesText(product.salesText || '');
      setPImage(product.image || '');
      setPImages(product.images || (product.image ? [product.image] : []));
      setPProductLink(product.productLink || '');
      setPDeliveryTime(product.deliveryTime || 'พรุ่งนี้');
      setPLocation(product.location || 'จังหวัดกรุงเทพมหานคร');
      setPDescription(product.description || '');
      setPIsMall(!!product.isMall);
      setPIsHot(!!product.isHot);
      setPIsLive(!!product.isLive);
      setPShopName(product.shopName || 'Shopee Official Shop');
      setPVariants(product.variants ? product.variants.join(', ') : '');
    } else {
      setPTitle('');
      setPPrice('');
      setPOriginalPrice('');
      setPDiscount('');
      setPSalesText('ขายแล้ว 0 ชิ้น');
      setPImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80');
      setPImages(['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80']);
      setPProductLink('');
      setPDeliveryTime('พรุ่งนี้');
      setPLocation('จังหวัดกรุงเทพมหานคร');
      setPDescription('');
      setPIsMall(false);
      setPIsHot(false);
      setPIsLive(false);
      setPShopName('Shopee Official Shop');
      setPVariants('ตัวเลือกมาตรฐาน');
    }
    setShowProductModal(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPImages((prev) => {
          const updated = [...prev, base64String];
          return updated;
        });
        // If there's no primary image, or if it is just a default Unsplash placeholder,
        // we can set this new image as primary.
        setPImage((prevImg) => {
          if (!prevImg || prevImg.includes('unsplash.com')) {
            return base64String;
          }
          return prevImg;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImageIndex = (idxToRemove: number) => {
    setPImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== idxToRemove);
      if (prev[idxToRemove] === pImage && updated.length > 0) {
        setPImage(updated[0]);
      }
      return updated;
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pPrice || !pImage) {
      alert('กรุณากรอกชื่อสินค้า ราคาสินค้า และลิงก์รูปภาพสินค้าค่ะ');
      return;
    }

    const payload = {
      id: editingProduct?.id,
      title: pTitle,
      price: parseFloat(pPrice),
      originalPrice: pOriginalPrice ? parseFloat(pOriginalPrice) : undefined,
      discount: pDiscount,
      salesText: pSalesText,
      image: pImage,
      images: pImages.length > 0 ? pImages : [pImage],
      productLink: pProductLink,
      deliveryTime: pDeliveryTime,
      location: pLocation,
      description: pDescription,
      isMall: pIsMall,
      isHot: pIsHot,
      isLive: pIsLive,
      shopName: pShopName,
      variants: pVariants.split(',').map(v => v.trim()).filter(v => v !== '')
    };

    const endpoint = productMode === 'home'
      ? (editingProduct ? '/api/admin/products/update' : '/api/admin/products/create')
      : (editingProduct ? '/api/admin/activity-products/update' : '/api/admin/activity-products/create');

    setUpdating(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (response.ok) {
        alert(resData.message || 'บันทึกสำเร็จเรียบร้อยค่ะ');
        setShowProductModal(false);
        if (productMode === 'home') {
          fetchHomeProducts();
          if (onRefreshProducts) onRefreshProducts();
        } else {
          fetchActivityProducts();
        }
      } else {
        alert(resData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเซฟข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId: string, mode: 'home' | 'activity') => {
    const endpoint = mode === 'home' ? '/api/admin/products/delete' : '/api/admin/activity-products/delete';
    try {
      setUpdating(true);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId })
      });
      const resData = await response.json();
      if (response.ok) {
        alert(resData.message || 'ลบสินค้าสำเร็จเรียบร้อยค่ะ');
        setDeleteConfirmId(null);
        setDeleteConfirmMode(null);
        setDeleteConfirmTitle('');
        if (mode === 'home') {
          fetchHomeProducts();
          if (onRefreshProducts) onRefreshProducts();
        } else {
          fetchActivityProducts();
        }
      } else {
        alert(resData.error || 'ไม่สามารถลบสินค้าได้');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดทางเทคนิคในการลบสินค้า');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignProduct = async (phone: string, productId: string) => {
    try {
      const response = await fetch('/api/admin/match-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, productId })
      });
      const resData = await response.json();
      if (response.ok) {
        alert('ส่งมอบออเดอร์กิจกรรมไปยังบัญชีลูกค้าเรียบร้อยแล้วค่ะ! 🚀');
        setShowAssignModal(false);
        fetchMatchRequests();
      } else {
        alert(resData.error || 'เกิดข้อผิดพลาดในการให้ออเดอร์');
      }
    } catch (err) {
      console.error(err);
      alert('เชื่อมต่อล้มเหลว');
    }
  };

  useEffect(() => {
    fetchUsers();
    // Refresh local state from prop settings
    if (settings) {
      setSiteName(settings.siteName || 'Shopee');
      setSiteLogo(settings.siteLogo || '');
      setSiteIcon(settings.siteIcon || '');
      setThemeColor(settings.themeColor || '#ea580c');
      setSlides(settings.slides || []);
      setLineUrl(settings.lineUrl || '');
      setWhatsappUrl(settings.whatsappUrl || '');
      setFacebookUrl(settings.facebookUrl || '');
      setTiktokUrl(settings.tiktokUrl || '');

      setShopeefoodLogo(settings.shopeefoodLogo || '');
      setShopeefoodUrl(settings.shopeefoodUrl || '');
      setShopeefoodLabel(settings.shopeefoodLabel || '');
      setShopeefoodSubLabel(settings.shopeefoodSubLabel || '');

      setFreeshippingLogo(settings.freeshippingLogo || '');
      setFreeshippingUrl(settings.freeshippingUrl || '');
      setFreeshippingLabel(settings.freeshippingLabel || '');
      setFreeshippingSubLabel(settings.freeshippingSubLabel || '');

      setPaydayLogo(settings.paydayLogo || '');
      setPaydayUrl(settings.paydayUrl || '');
      setPaydayLabel(settings.paydayLabel || '');
      setPaydaySubLabel(settings.paydaySubLabel || '');

      setInstantLogo(settings.instantLogo || '');
      setInstantUrl(settings.instantUrl || '');
      setInstantLabel(settings.instantLabel || '');
      setInstantSubLabel(settings.instantSubLabel || '');

      setFlashdealLogo(settings.flashdealLogo || '');
      setFlashdealUrl(settings.flashdealUrl || '');
      setFlashdealLabel(settings.flashdealLabel || '');
      setFlashdealSubLabel(settings.flashdealSubLabel || '');
    }
  }, [settings]);

  // System Refresh logic
  const handleSystemRefresh = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchUsers();
      // Fetch latest settings too
      const res = await fetch('/api/settings');
      if (res.ok) {
        const latestSettings = await res.json();
        onUpdateSettings(latestSettings);
      }
      setSuccessMsg('รีเฟรชระบบสำเร็จ ข้อมูลได้รับการตรวจสอบและซิงโครไนซ์ตรงกันแล้วค่ะ 🔄');
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการดึงข้อมูลจากเซิร์ฟเวอร์หลัก');
    } finally {
      setLoading(false);
    }
  };

  // Create member direct
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPhone.trim() || !newPassword.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลส่วนตัวสำหรับสมาชิกใหม่ให้ครบถ้วนค่ะ');
      return;
    }
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          phone: newPhone.trim(),
          password: newPassword.trim(),
          country: newCountry,
          accountCategory: newAccountCategory
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างสมาชิก');
      }

      setSuccessMsg(`สร้างสมาชิกใหม่ "${newUsername}" ประจำประเภทบัญชี ${newCountry === 'Laos' ? 'ลาว (lo4385)' : 'ไทย (th3585)'} สำเร็จเรียบร้อยแล้วค่ะ`);
      
      // Reset form
      setNewUsername('');
      setNewPhone('');
      setNewPassword('');
      setShowCreateUserModal(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถลงทะเบียนผู้ใช้ใหม่ผ่านหลังบ้านได้');
    } finally {
      setUpdating(false);
    }
  };

  // Update member
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: editingUser.phone,
          balance: parseFloat(editingUser.balance) || 0,
          commission: parseFloat(editingUser.commission) || 0,
          frozen: parseFloat(editingUser.frozen) || 0,
          level: parseInt(editingUser.level, 10),
          isBlocked: editingUser.isBlocked || false,
          isBanned: editingUser.isBanned || false,
          role: editingUser.role || 'customer',
          username: editingUser.username,
          realName: editingUser.realName,
          bankName: editingUser.bankName,
          bankAccount: editingUser.bankAccount,
          rawPassword: editingUser.rawPassword,
          transactionPassword: editingUser.transactionPassword || '999999',
          accountCategory: editingUser.accountCategory || 'customer',
          country: editingUser.country || 'Thailand',
          latestDepositAmount: parseFloat(editingUser.latestDepositAmount) || 0
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลสมาชิก');
      }

      setSuccessMsg(`บันทึกการแก้ไขข้อมูลของ "${editingUser.username}" เรียบร้อยแล้วค่ะ`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'ล้มเหลวในการส่งข้อมูลแก้ไขสมาชิก');
    } finally {
      setUpdating(false);
    }
  };

  // Quick action freeze account
  const handleToggleBlock = async (user: any) => {
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const targetState = !user.isBlocked;
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          isBlocked: targetState
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccessMsg(`${targetState ? 'ระงับบัญชีผู้ใช้ชั่วคราว (อายัด)' : 'ปลดการระงับบัญชีผู้ใช้'} ของ "${user.username}" สำเร็จ`);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'ดำเนินการล้มเหลว');
    } finally {
      setUpdating(false);
    }
  };

  // Quick action ban account
  const handleToggleBan = async (user: any) => {
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const targetState = !user.isBanned;
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          isBanned: targetState
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccessMsg(`${targetState ? 'แบนตลอดชีพเรียบร้อยแล้ว' : 'ปลดแบนสำเร็จ'} สำหรับ "${user.username}"`);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'ดำเนินการล้มเหลว');
    } finally {
      setUpdating(false);
    }
  };

  // Admin management update
  const handleAdminAction = async (action: 'create' | 'edit', targetPhone?: string) => {
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const body: any = {
        actorPhone: currentUser.phone,
        action,
      };

      if (action === 'create') {
        body.newPhone = adminPhone.trim();
        body.newPassword = adminPassword.trim();
        body.newUsername = adminName.trim();
      } else {
        if (!editingAdmin) return;
        body.targetPhone = targetPhone;
        body.newPhone = editingAdmin.phone;
        body.newPassword = editingAdmin.passwordHash;
        body.newUsername = editingAdmin.username;
      }

      const response = await fetch('/api/admin/admins/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ดูแลระบบ');
      }

      setSuccessMsg(data.message || 'ดำเนินการสำเร็จเรียบร้อยค่ะ');
      
      // Reset forms
      setAdminPhone('');
      setAdminPassword('');
      setAdminName('');
      setShowCreateAdminModal(false);
      setEditingAdmin(null);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'จัดสรรข้อมูลผู้ดูแลระบบล้มเหลว');
    } finally {
      setUpdating(false);
    }
  };

  // Save System Settings
  const handleSaveSettings = async (customSlides?: any[]) => {
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorPhone: currentUser?.phone,
          siteName: siteName.trim(),
          siteLogo: siteLogo,
          siteIcon: siteIcon,
          themeColor: themeColor,
          slides: customSlides || slides,
          lineUrl: lineUrl.trim(),
          whatsappUrl: whatsappUrl.trim(),
          facebookUrl: facebookUrl.trim(),
          tiktokUrl: tiktokUrl.trim(),

          shopeefoodLogo: shopeefoodLogo.trim(),
          shopeefoodUrl: shopeefoodUrl.trim(),
          shopeefoodLabel: shopeefoodLabel.trim(),
          shopeefoodSubLabel: shopeefoodSubLabel.trim(),

          freeshippingLogo: freeshippingLogo.trim(),
          freeshippingUrl: freeshippingUrl.trim(),
          freeshippingLabel: freeshippingLabel.trim(),
          freeshippingSubLabel: freeshippingSubLabel.trim(),

          paydayLogo: paydayLogo.trim(),
          paydayUrl: paydayUrl.trim(),
          paydayLabel: paydayLabel.trim(),
          paydaySubLabel: paydaySubLabel.trim(),

          instantLogo: instantLogo.trim(),
          instantUrl: instantUrl.trim(),
          instantLabel: instantLabel.trim(),
          instantSubLabel: instantSubLabel.trim(),

          flashdealLogo: flashdealLogo.trim(),
          flashdealUrl: flashdealUrl.trim(),
          flashdealLabel: flashdealLabel.trim(),
          flashdealSubLabel: flashdealSubLabel.trim()
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ล้มเหลว');
      }

      setSuccessMsg('บันทึกการตั้งค่าระบบ, โลโก้, โทนสี 100 จานสี และลิงก์ช่องทางติดต่อแอดมินเรียบร้อยแล้วค่ะ! 🎨✨');
      onUpdateSettings(data.settings);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกค่าระบบหลัก');
    } finally {
      setUpdating(false);
    }
  };

  // Helper to upload image to /api/upload
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64,
              fileName: file.name
            })
          });
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'การอัปโหลดไฟล์ล้มเหลว');
          }
          const data = await response.json();
          resolve(data.url);
        } catch (err: any) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Read File and convert to base64 or upload to server
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    setErrorMsg('');
    try {
      const url = await uploadImage(file);
      setSiteLogo(url);
      setSuccessMsg('อัปโหลดโลโก้สำเร็จเรียบร้อยค่ะ');
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการอัปโหลดโลโก้: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    setErrorMsg('');
    try {
      const url = await uploadImage(file);
      setSiteIcon(url);
      setSuccessMsg('อัปโหลดไอคอนเว็บไซต์สำเร็จเรียบร้อยค่ะ');
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการอัปโหลดไอคอนเว็บไซต์: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    setErrorMsg('');
    try {
      const url = await uploadImage(file);
      setSlideImage(url);
      setSuccessMsg('อัปโหลดรูปสไลด์สำเร็จเรียบร้อยค่ะ');
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการอัปโหลดรูปสไลด์: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Add a promotion slide
  const handleAddSlide = () => {
    if (!slideTitle.trim()) {
      setErrorMsg('กรุณากรอกหัวข้อสไลด์โปรโมชั่นค่ะ');
      return;
    }
    const newSlide = {
      id: `c_${Date.now()}`,
      title: slideTitle.trim(),
      desc: slideDesc.trim(),
      discount: slideDiscount.trim(),
      btnText: 'ช้อปเลย >',
      bg: slideBg,
      image: slideImage
    };

    const updated = [...slides, newSlide];
    setSlides(updated);
    
    // Clear forms
    setSlideTitle('');
    setSlideDesc('');
    setSlideDiscount('');
    setSlideImage('');
    setShowAddSlide(false);

    // Save directly to backend
    handleSaveSettings(updated);
  };

  // Remove a promotion slide
  const handleRemoveSlide = (id: string) => {
    const updated = slides.filter(s => s.id !== id);
    setSlides(updated);
    handleSaveSettings(updated);
  };

  // Filter users based on query and country
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const matchSearch = (
      user.username.toLowerCase().includes(query) ||
      user.phone.includes(query) ||
      (user.realName && user.realName.toLowerCase().includes(query))
    );

    const matchCountry = countryFilter === 'all' || user.country === countryFilter;

    // Filter out standard admin roles under normal member view to prevent clutter
    const isRegularMember = user.role !== 'admin' || user.phone === '0909090909';

    return matchSearch && matchCountry && isRegularMember;
  });

  // Extract all super_admin / admin accounts
  const adminAccounts = users.filter(user => user.role === 'admin');

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      
      {/* 1. Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">{settings?.siteName || 'Shopee'} Control Center</h1>
                <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                  <Shield className="w-2.5 h-2.5 fill-current" /> ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-bold">
                แผงควบคุมหลักสำหรับบริหารจัดสรรข้อมูลหน้าร้าน (Front-End) และระบบหลังร้าน (Back-End)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSystemRefresh}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Tabs Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-wrap">
          <button
            onClick={() => { setActiveTab('members'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'members' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Users className="w-4 h-4" />
            <span>จัดการสมาชิก</span>
          </button>
          <button
            onClick={() => { setActiveTab('admins'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'admins' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Shield className="w-4 h-4" />
            <span>แอดมิน</span>
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'settings' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่าระบบ</span>
          </button>
          <button
            onClick={() => { setActiveTab('home_products'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'home_products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Layers className="w-4 h-4" />
            <span>สินค้าหน้าแรก</span>
          </button>
          <button
            onClick={() => { setActiveTab('activity_products'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'activity_products' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Activity className="w-4 h-4" />
            <span>สินค้ากิจกรรม</span>
          </button>
          <button
            onClick={() => { setActiveTab('customer_orders'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'customer_orders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Award className="w-4 h-4" />
            <span>ให้ออเดอร์ลูกค้า</span>
          </button>
          <button
            onClick={() => { setActiveTab('deposit'); setErrorMsg(''); setSuccessMsg(''); setTxTargetUser(null); setTxSearchPhone(''); setTxAmount(''); setTxNote(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'deposit' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>ฝากเงิน & ประวัติ</span>
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setErrorMsg(''); setSuccessMsg(''); setTxTargetUser(null); setTxSearchPhone(''); setTxAmount(''); setTxNote(''); }}
            className={`flex-1 min-w-[120px] py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'withdraw' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Landmark className="w-4 h-4 text-red-500" />
            <span>ถอนเงิน & ประวัติ</span>
          </button>
        </div>
      </div>

      {/* 3. Alerts */}
      <div className="max-w-4xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-bold flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- TAB CONTENT: MEMBERS MANAGEMENT --- */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            
            {/* Filter controls, search, and direct add button */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                {/* Search query input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นด้วย ชื่อ, เบอร์โทร, หรือ ID สมาชิก..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Country Filter Swappable */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setCountryFilter('all')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${countryFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setCountryFilter('Thailand')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${countryFilter === 'Thailand' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Globe className="w-3 h-3" /> ประเทศไทย (th3585)
                  </button>
                  <button
                    onClick={() => setCountryFilter('Laos')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${countryFilter === 'Laos' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Globe className="w-3 h-3" /> ประเทศลาว (lo4385)
                  </button>
                </div>

                {/* Register direct customer button */}
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1 shadow transition-all active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>สมัครสมาชิกระบบ</span>
                </button>

              </div>
            </div>

            {/* Members table card */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>รายชื่อสมาชิกที่จัดสรรในระบบ ({filteredUsers.length})</span>
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs font-semibold">
                    ไม่พบข้อมูลผู้ใช้ในระบบเลยค่ะ ลองเพิ่มบัญชีด้านบนนี้ดูสิคะ 💖
                  </div>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <div key={`member-${user.phone}-${idx}`} className="p-4 sm:p-5 hover:bg-slate-55 transition-colors flex flex-col md:flex-row justify-between gap-4">
                      
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">{user.username}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-slate-950 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                            {user.role === 'admin' ? 'ผู้ดูแลระบบสูงสุด' : 'ลูกค้า'}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${user.country === 'Laos' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {user.country === 'Laos' ? '🇱🇦 สมาชิก สปป. ลาว' : '🇹🇭 สมาชิก ประเทศไทย'}
                          </span>
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                            {user.accountCategory === 'merchant' ? '🏬 บัญชีร้านค้า (Merchant)' : '👤 บัญชีลูกค้า (Customer)'}
                          </span>
                          
                          {user.isBlocked && (
                            <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Ban className="w-2.5 h-2.5" /> บัญชีถูกอายัด
                            </span>
                          )}
                          {user.isBanned && (
                            <span className="bg-red-650 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Ban className="w-2.5 h-2.5" /> แบนตลอดชีพ
                            </span>
                          )}
                        </div>

                        {/* Account properties */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-500 font-bold font-mono">
                          <span>📱 เบอร์: <strong className="text-slate-800">{user.phone}</strong></span>
                          <span>🔑 รหัสผ่าน: <strong className="text-slate-800">{user.rawPassword || 'ไม่มี'}</strong></span>
                          <span>🔒 รหัสทุรกรรม: <strong className="text-slate-800">{user.transactionPassword || '999999'}</strong></span>
                          <span>🎟️ รหัสเชิญ: <strong className="text-purple-600">{user.invitationCode || 'ไม่มี'}</strong></span>
                          
                          <span className="col-span-2">👤 ชื่อรับโอน: <strong className="text-slate-800 font-sans">{user.realName || 'ไม่ระบุ'}</strong></span>
                          <span className="col-span-2">🏦 {user.bankName || 'ธนาคาร'} - <strong className="text-slate-800">{user.bankAccount || 'ไม่มี'}</strong></span>
                        </div>

                        {/* Balances details */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                            💰 ยอดเงินคงเหลือ: ฿{user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">
                            🎁 คอมมิชชั่นสะสม: ฿{user.commission?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-black bg-red-50 text-red-700 px-2 py-1 rounded-lg border border-red-100">
                            🔒 อายัดเงิน: ฿{user.frozen?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded-lg">
                            👑 {user.level === -1 || user.level === undefined ? 'ระดับ Member' : `ระดับ Level ${user.level}`}
                          </span>
                          <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100">
                            💳 เติมล่าสุด: ฿{(user.latestDepositAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Member management actions */}
                      <div className="flex flex-row md:flex-col items-stretch justify-center gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                        <button
                          onClick={() => setEditingUser({ ...user })}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> แก้ไขข้อมูลหลัก
                        </button>

                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${user.isBlocked ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{user.isBlocked ? 'ปลดอายัดบัญชี' : 'อายัดบัญชี (Freeze)'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleBan(user)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${user.isBanned ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-700 text-white hover:bg-red-800'}`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{user.isBanned ? 'ปลดแบนตลอดชีพ' : 'แบนตลอดชีพ'}</span>
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB CONTENT: ADMIN MANAGEMENT (Webmaster restricted) --- */}
        {activeTab === 'admins' && (
          <div className="space-y-4">
            
            {/* Restriction warning if they are not the top dog */}
            {currentUser.phone !== '0909090909' ? (
              <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm text-center space-y-3">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <Shield className="w-8 h-8 fill-current" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">เฉพาะบัญชีผู้ดูแลระบบสูงสุด (Webmaster) เท่านั้นที่มีสิทธิ์</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  เบอร์โทร <strong className="text-slate-800 font-mono">0909090909</strong> เท่านั้นที่สามารถจัดสรรสิทธิ์ผู้บริหารแอดมินคนอื่นๆ ได้ค่ะ สิทธิ์ปัจจุบันของท่านจำกัดไว้เฉพาะการแก้ไขข้อมูลลูกค้าทั่วไป
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Control Panel to create Admin */}
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <span>เพิ่มแอดมินระดับสูงสุดรายใหม่</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">แอดมินใหม่ที่ถูกจัดสรรจะมีสิทธิ์จัดการระบบและดูสถิติหลังบ้านทั้งหมด</p>
                  </div>

                  <button
                    onClick={() => setShowCreateAdminModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>สร้างบัญชีแอดมินระดับสูง</span>
                  </button>
                </div>

                {/* Admins listing */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-black text-slate-700 uppercase">รายชื่อบัญชีแอดมินผู้ดูแลระบบสูงสุด</h4>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {adminAccounts.map((admin, idx) => (
                      <div key={`admin-${admin.phone}-${idx}`} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-800">{admin.username}</span>
                            {admin.phone === '0909090909' ? (
                              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                บัญชีผู้สร้างสูงสุด (Creator)
                              </span>
                            ) : (
                              <span className="bg-slate-900 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                แอดมินร่วมระดับสูง (Admin Partner)
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 font-bold">
                            <span>เบอร์ล็อกอิน: <strong className="text-slate-800">{admin.phone}</strong></span>
                            <span>รหัสผ่าน: <strong className="text-orange-600">{admin.rawPassword || admin.passwordHash || '12345678'}</strong></span>
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => setEditingAdmin({ ...admin, passwordHash: admin.rawPassword || admin.passwordHash })}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                          >
                            แก้ไขบัญชีแอดมิน
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* --- TAB CONTENT: SYSTEM CONFIGURATION --- */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            
            {/* Logo, Name, Custom color layout */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Palette className="w-4 h-4 text-orange-500" />
                <span>แบรนด์ดิ้งภาพลักษณ์แอปพลิเคชัน (Branding Settings)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Website Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">ชื่อเว็บไซต์แอปพลิเคชัน (Login & Home Title)</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="เช่น Shopee Premium"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-orange-500 focus:bg-white"
                  />
                  <p className="text-[9px] text-slate-400 font-medium">ชื่อนี้จะเปลี่ยนบนหน้าจอล็อกอินและทุกส่วนหัวของหน้าบ้านทั้งหมดทันทีค่ะ</p>
                </div>

                {/* Upload Logo File */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">เปลี่ยนโลโก้แอป (อัปโหลดรูปภาพ)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      id="logo-file-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-file-input"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer transition-colors border border-slate-200 flex items-center gap-1"
                    >
                      <Image className="w-3.5 h-3.5" /> เลือกไฟล์จากเครื่อง
                    </label>

                    {siteLogo ? (
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5">
                        <img src={siteLogo} alt="Logo preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setSiteLogo('')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">ใช้โลโก้ Shopee แสตนดาร์ด</span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">อัปโหลดรูปภาพโลโก้แบรนด์ของท่านเองได้ทันที</p>
                </div>

                {/* Upload Icon File */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">เปลี่ยนไอคอนเว็บไซต์ (Web Favicon / Icon)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      id="icon-file-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="icon-file-input"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer transition-colors border border-slate-200 flex items-center gap-1"
                    >
                      <Image className="w-3.5 h-3.5" /> เลือกไฟล์จากเครื่อง
                    </label>

                    {siteIcon ? (
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5">
                        <img src={siteIcon} alt="Icon preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setSiteIcon('')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">ยังไม่ได้ระบุไอคอน</span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">อัปโหลดรูปภาพไอคอนแถบแท็บบราวเซอร์เพื่อแสดงแบรนด์ออนไลน์</p>
                </div>

              </div>

              {/* ช่องทางติดต่อแอดมิน (Customer Support Social Links) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  <span>จัดการลิงก์ช่องทางติดต่อแอดมิน (Customer Support Links)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LINE Official Link */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">ลิงก์ LINE Official Account (ปุ่มที่ 1)</label>
                    <input
                      type="url"
                      value={lineUrl}
                      onChange={(e) => setLineUrl(e.target.value)}
                      placeholder="เช่น https://line.me/R/ti/p/@yourid"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                    <p className="text-[9px] text-slate-400 font-medium">เมื่อผู้ใช้กดปุ่ม LINE Official ระบบจะเปิดลิงก์นี้ทันทีโดยไม่แสดง URL ให้เห็น</p>
                  </div>

                  {/* WhatsApp Link */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">ลิงก์ WhatsApp Chat (ปุ่มที่ 2)</label>
                    <input
                      type="url"
                      value={whatsappUrl}
                      onChange={(e) => setWhatsappUrl(e.target.value)}
                      placeholder="เช่น https://wa.me/66900000000"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-green-500 focus:bg-white transition-colors"
                    />
                    <p className="text-[9px] text-slate-400 font-medium">เมื่อผู้ใช้กดปุ่ม WhatsApp ระบบจะเปิดแชทติดต่อตามลิงก์นี้ทันที</p>
                  </div>

                  {/* Facebook Fanpage Link */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">ลิงก์ Facebook Fanpage (ปุ่มที่ 3)</label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="เช่น https://facebook.com/yourpage"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                    <p className="text-[9px] text-slate-400 font-medium">ลิงก์เชื่อมต่อไปยังแฟนเพจ Facebook หรือ Messenger ติดต่อเจ้าหน้าที่</p>
                  </div>

                  {/* TikTok Link */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">ลิงก์ช่อง TikTok Support (ปุ่มที่ 4)</label>
                    <input
                      type="url"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="เช่น https://tiktok.com/@youraccount"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-slate-900 focus:bg-white transition-colors"
                    />
                    <p className="text-[9px] text-slate-400 font-medium">ลิงก์สำหรับโปรโมตช่องหรือวิดีโอคู่มือการใช้งานบนแพลตฟอร์ม TikTok</p>
                  </div>
                </div>
              </div>

              {/* 100-Color Palette Grid Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 block">โทนสีหลักของเว็บไซต์แอป (100 จานสีสีพรีเมียมและเฉดสีต่างๆ)</label>
                  <span className="text-[11px] text-orange-600 font-extrabold flex items-center gap-1 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                    สีปัจจุบัน: <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-200" style={{ backgroundColor: themeColor }} /> {themeColor}
                  </span>
                </div>
                
                {/* Scrollable grid representing 100 premium color circles */}
                <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 max-h-40 overflow-y-auto">
                  {SWATCHES_100.map((color, idx) => (
                    <button
                      key={`${color}-${idx}`}
                      type="button"
                      onClick={() => setThemeColor(color)}
                      className="aspect-square rounded-full border border-white hover:scale-115 transition-transform cursor-pointer relative flex items-center justify-center text-white"
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {themeColor === color && (
                        <Check className="w-2.5 h-2.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 font-medium">คลิกเลือกปุ่มสีจานสีด้านบนเพื่อเปลี่ยนชุดธีมสีของแอปพลิเคชันทั้งหมด (ปุ่ม, แบนเนอร์, แถบเมนูด้านล่าง, ฟอนต์ไฮไลต์หลัก และอื่นๆ)</p>
              </div>

              {/* Save main config */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={updating}
                  className="bg-slate-950 hover:bg-slate-850 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updating ? 'กำลังบันทึก...' : 'บันทึกภาพลักษณ์และจานสี'}</span>
                </button>
              </div>

            </div>

            {/* Custom Buttons Logo & Link Configuration Panel */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Layers className="w-4 h-4 text-orange-500" />
                <span>จัดการปุ่มบริการหน้าแรก (Home Buttons Customizer - Realtime)</span>
              </h3>

              <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-2xl text-[10px] text-orange-800 font-bold leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <strong>ระบบจัดการปุ่มแบบเรียลไทม์:</strong> ท่านสามารถเปลี่ยนภาพโลโก้ ชื่อปุ่ม คำบรรยายพิเศษ และลิงก์เชื่อมต่อของทั้ง 5 ปุ่มได้ตามใจชอบ โดยอัปโหลดไฟล์จากเครื่อง หรือป้อนเป็น URL รูปภาพได้ทันที เมื่อกดบันทึก ข้อมูลจะอัปเดตออนไลน์ทันทีโดยไม่ต้องรีโหลดค่ะ! ✨
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. ShopeeFood */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
                      {shopeefoodLogo ? (
                        <img src={shopeefoodLogo} alt="Preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">Default</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">1. ปุ่ม ShopeeFood</h4>
                      <p className="text-[8px] text-slate-400">ปุ่มแรกของเมนูบริการทางเลือก</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ชื่อปุ่มบริการ</label>
                      <input
                        type="text"
                        value={shopeefoodLabel}
                        onChange={(e) => setShopeefoodLabel(e.target.value)}
                        placeholder="ShopeeFood"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">คำอธิบายใต้ปุ่ม (Sub-Label)</label>
                      <input
                        type="text"
                        value={shopeefoodSubLabel}
                        onChange={(e) => setShopeefoodSubLabel(e.target.value)}
                        placeholder="เช่น ไทยช่วยไทย (ว่างได้)"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ลิงก์ปลายทาง (Redirect Link)</label>
                      <input
                        type="url"
                        value={shopeefoodUrl}
                        onChange={(e) => setShopeefoodUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">โลโก้ (อัปโหลดรูปภาพ หรือใส่ URL)</label>
                      <input
                        type="text"
                        value={shopeefoodLogo}
                        onChange={(e) => setShopeefoodLogo(e.target.value)}
                        placeholder="URL ของรูปภาพ..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono outline-none focus:border-orange-500 mb-1"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setShopeefoodLogo(reader.result as string);
                                e.target.value = '';
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          id="shopeefood-file-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="shopeefood-file-upload"
                          className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-md border border-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Image className="w-3 h-3 text-orange-500" /> อัปโหลดไฟล์รูป
                        </label>
                        {shopeefoodLogo && (
                          <button
                            type="button"
                            onClick={() => setShopeefoodLogo('')}
                            className="text-[9px] font-bold text-red-500 hover:underline animate-fade-in"
                          >
                            รีเซ็ตโลโก้
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Free Shipping */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
                      {freeshippingLogo ? (
                        <img src={freeshippingLogo} alt="Preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">Truck Default</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">2. ปุ่ม ส่งฟรี</h4>
                      <p className="text-[8px] text-slate-400">ปุ่มที่สองเมนูบริการ</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ชื่อปุ่มบริการ</label>
                      <input
                        type="text"
                        value={freeshippingLabel}
                        onChange={(e) => setFreeshippingLabel(e.target.value)}
                        placeholder="ส่งฟรี* +"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">คำอธิบายใต้ปุ่ม (Sub-Label)</label>
                      <input
                        type="text"
                        value={freeshippingSubLabel}
                        onChange={(e) => setFreeshippingSubLabel(e.target.value)}
                        placeholder="โค้ดลดทั้งแอป"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ลิงก์ปลายทาง (Redirect Link)</label>
                      <input
                        type="url"
                        value={freeshippingUrl}
                        onChange={(e) => setFreeshippingUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">โลโก้ (อัปโหลดรูปภาพ หรือใส่ URL)</label>
                      <input
                        type="text"
                        value={freeshippingLogo}
                        onChange={(e) => setFreeshippingLogo(e.target.value)}
                        placeholder="URL ของรูปภาพ..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono outline-none focus:border-teal-500 mb-1"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFreeshippingLogo(reader.result as string);
                                e.target.value = '';
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          id="freeshipping-file-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="freeshipping-file-upload"
                          className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-md border border-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Image className="w-3 h-3 text-teal-500" /> อัปโหลดไฟล์รูป
                        </label>
                        {freeshippingLogo && (
                          <button
                            type="button"
                            onClick={() => setFreeshippingLogo('')}
                            className="text-[9px] font-bold text-red-500 hover:underline animate-fade-in"
                          >
                            รีเซ็ตโลโก้
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. PAY DAY */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
                      {paydayLogo ? (
                        <img src={paydayLogo} alt="Preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">Gift Default</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">3. ปุ่ม PAY DAY</h4>
                      <p className="text-[8px] text-slate-400">ปุ่มที่สามเมนูบริการ</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ชื่อปุ่มบริการ</label>
                      <input
                        type="text"
                        value={paydayLabel}
                        onChange={(e) => setPaydayLabel(e.target.value)}
                        placeholder="PAY DAY"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">คำอธิบายใต้ปุ่ม (Sub-Label)</label>
                      <input
                        type="text"
                        value={paydaySubLabel}
                        onChange={(e) => setPaydaySubLabel(e.target.value)}
                        placeholder="6.25 ช้อปเลย"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ลิงก์ปลายทาง (Redirect Link)</label>
                      <input
                        type="url"
                        value={paydayUrl}
                        onChange={(e) => setPaydayUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">โลโก้ (อัปโหลดรูปภาพ หรือใส่ URL)</label>
                      <input
                        type="text"
                        value={paydayLogo}
                        onChange={(e) => setPaydayLogo(e.target.value)}
                        placeholder="URL ของรูปภาพ..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono outline-none focus:border-pink-500 mb-1"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPaydayLogo(reader.result as string);
                                e.target.value = '';
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          id="payday-file-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="payday-file-upload"
                          className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-md border border-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Image className="w-3 h-3 text-pink-500" /> อัปโหลดไฟล์รูป
                        </label>
                        {paydayLogo && (
                          <button
                            type="button"
                            onClick={() => setPaydayLogo('')}
                            className="text-[9px] font-bold text-red-500 hover:underline animate-fade-in"
                          >
                            รีเซ็ตโลโก้
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. สั่งปุ๊บ ส่งปั๊บ */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
                      {instantLogo ? (
                        <img src={instantLogo} alt="Preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">Zap Default</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">4. ปุ่ม สั่งปุ๊บ ส่งปั๊บ</h4>
                      <p className="text-[8px] text-slate-400">ปุ่มที่สี่เมนูบริการ</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ชื่อปุ่มบริการ</label>
                      <input
                        type="text"
                        value={instantLabel}
                        onChange={(e) => setInstantLabel(e.target.value)}
                        placeholder="สั่งปุ๊บ ส่งปั๊บ"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">คำอธิบายใต้ปุ่ม (Sub-Label)</label>
                      <input
                        type="text"
                        value={instantSubLabel}
                        onChange={(e) => setInstantSubLabel(e.target.value)}
                        placeholder="รับทันที"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ลิงก์ปลายทาง (Redirect Link)</label>
                      <input
                        type="url"
                        value={instantUrl}
                        onChange={(e) => setInstantUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">โลโก้ (อัปโหลดรูปภาพ หรือใส่ URL)</label>
                      <input
                        type="text"
                        value={instantLogo}
                        onChange={(e) => setInstantLogo(e.target.value)}
                        placeholder="URL ของรูปภาพ..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono outline-none focus:border-blue-500 mb-1"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setInstantLogo(reader.result as string);
                                e.target.value = '';
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          id="instant-file-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="instant-file-upload"
                          className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-md border border-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Image className="w-3 h-3 text-blue-500" /> อัปโหลดไฟล์รูป
                        </label>
                        {instantLogo && (
                          <button
                            type="button"
                            onClick={() => setInstantLogo('')}
                            className="text-[9px] font-bold text-red-500 hover:underline animate-fade-in"
                          >
                            รีเซ็ตโลโก้
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Flash Deal */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-200">
                      {flashdealLogo ? (
                        <img src={flashdealLogo} alt="Preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">Flame Default</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">5. ปุ่ม Flash Deal</h4>
                      <p className="text-[8px] text-slate-400">ปุ่มที่ห้าเมนูบริการ</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ชื่อปุ่มบริการ</label>
                      <input
                        type="text"
                        value={flashdealLabel}
                        onChange={(e) => setFlashdealLabel(e.target.value)}
                        placeholder="Flash Deal"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">คำอธิบายใต้ปุ่ม (Sub-Label)</label>
                      <input
                        type="text"
                        value={flashdealSubLabel}
                        onChange={(e) => setFlashdealSubLabel(e.target.value)}
                        placeholder="ดีลเด็ดด่วน"
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">ลิงก์ปลายทาง (Redirect Link)</label>
                      <input
                        type="url"
                        value={flashdealUrl}
                        onChange={(e) => setFlashdealUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 block">โลโก้ (อัปโหลดรูปภาพ หรือใส่ URL)</label>
                      <input
                        type="text"
                        value={flashdealLogo}
                        onChange={(e) => setFlashdealLogo(e.target.value)}
                        placeholder="URL ของรูปภาพ..."
                        className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono outline-none focus:border-amber-500 mb-1"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFlashdealLogo(reader.result as string);
                                e.target.value = '';
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          id="flashdeal-file-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="flashdeal-file-upload"
                          className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-md border border-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Image className="w-3 h-3 text-amber-500" /> อัปโหลดไฟล์รูป
                        </label>
                        {flashdealLogo && (
                          <button
                            type="button"
                            onClick={() => setFlashdealLogo('')}
                            className="text-[9px] font-bold text-red-500 hover:underline animate-fade-in"
                          >
                            รีเซ็ตโลโก้
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Save system settings */}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={updating}
                  className="bg-slate-950 hover:bg-slate-850 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-orange-400" />
                  <span>{updating ? 'กำลังบันทึกข้อมูลเรียลไทม์...' : 'บันทึกการปรับแต่งปุ่มทั้งหมด'}</span>
                </button>
              </div>
            </div>

            {/* Promotion slides panel */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-orange-500" />
                  <span>จัดการสไลด์โปรโมชั่นหน้าราคาสินค้า (Promotion Slides)</span>
                </h3>
                
                <button
                  onClick={() => { setShowAddSlide(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่มสไลด์โปรโมชั่น
                </button>
              </div>

              {/* Recommended size spec banner */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-bold flex items-start gap-1.5 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <strong>ขนาดที่แนะนำสำหรับรูปสไลด์ในระบบ:</strong> 1200 x 400 พิกเซล (อัตราส่วนสไลด์แบนเนอร์ 3:1)<br />
                  เป็นขนาดมาตรฐานที่สามารถแสดงผลได้อย่างคมชัด สมส่วนสวยงาม ไม่ยืดหรือหดสัดส่วนบนทุกหน้าจออุปกรณ์สมาร์ตโฟน แท็บเล็ต และคอมพิวเตอร์ค่ะ
                </div>
              </div>

              {/* Slide management form overlay popup */}
              {showAddSlide && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800">เพิ่มสไลด์โปรโมชั่นใหม่</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 block mb-1">หัวข้อสไลด์ (Campaign Title)</label>
                      <input
                        type="text"
                        value={slideTitle}
                        onChange={(e) => setSlideTitle(e.target.value)}
                        placeholder="เช่น PAY DAY"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 block mb-1">รายละเอียดแคมเปญ (Description)</label>
                      <input
                        type="text"
                        value={slideDesc}
                        onChange={(e) => setSlideDesc(e.target.value)}
                        placeholder="เช่น เงินออกช้อปเลยลดคุ้ม"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 block mb-1">ข้อเสนอส่วนลด (Discount Highlight)</label>
                      <input
                        type="text"
                        value={slideDiscount}
                        onChange={(e) => setSlideDiscount(e.target.value)}
                        placeholder="เช่น ส่วนลด 50%"
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 block mb-1">อัปโหลดรูปภาพพื้นหลังสไลด์</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSlideImageUpload}
                        className="w-full bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs"
                      />
                      {slideImage && <span className="text-[9px] text-emerald-600 font-bold block mt-1">อัปโหลดรูปภาพสำเร็จ</span>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSlide(false)}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-lg"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-1.5 rounded-lg"
                    >
                      บันทึกสไลด์
                    </button>
                  </div>
                </div>
              )}

              {/* Slides Grid View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {slides.map((slide, idx) => (
                  <div key={`slide-${slide.id || idx}-${idx}`} className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between space-y-3 relative group">
                    
                    {/* Delete slide button absolute top */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(slide.id)}
                      className="absolute top-2.5 right-2.5 bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-full transition-colors opacity-80 hover:opacity-100 cursor-pointer"
                      title="ลบสไลด์นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Preview of gradient or uploaded image */}
                    <div className="h-20 rounded-xl overflow-hidden shadow-sm relative flex items-center justify-center text-white p-2">
                      {slide.image ? (
                        <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg || 'from-orange-500 to-red-500'}`}></div>
                      )}
                      
                      <div className="relative z-10 text-center">
                        <span className="bg-yellow-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                          {slide.title}
                        </span>
                        <p className="text-[10px] font-extrabold mt-1">{slide.desc}</p>
                        <p className="text-xs font-black text-yellow-300">{slide.discount}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-slate-800">{slide.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{slide.desc || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                      <div className="flex justify-between items-center pt-1.5 text-[9px] text-slate-500 font-bold border-t border-slate-100">
                        <span>สไลด์ที่ {idx + 1}</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">สัดส่วน 3:1</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* --- TAB CONTENT: HOME PRODUCTS MANAGEMENT --- */}
        {activeTab === 'home_products' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">จัดการสินค้าหน้าแรก</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">เพิ่ม ลบ หรือแก้ไขข้อมูลสินค้าที่จะปรากฏบนหน้าแรกของแอปพลิเคชัน</p>
              </div>
              <button
                onClick={() => handleOpenProductModal(null, 'home')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มสินค้าในหน้าแรก</span>
              </button>
            </div>

            {loadingProducts ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-xs text-slate-500 font-bold">กำลังโหลดรายการสินค้า...</span>
              </div>
            ) : homeProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold">ยังไม่มีสินค้าในหน้าแรกค่ะ กรุณาเพิ่มสินค้าใหม่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeProducts.map((prod, idx) => (
                  <div key={`home-prod-${prod.id}-${idx}`} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex gap-4">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-24 h-24 rounded-2xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {prod.isMall && <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">Mall</span>}
                          {prod.isHot && <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">ฮอต</span>}
                          {prod.isLive && <span className="bg-pink-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">Live</span>}
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded">{prod.location}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{prod.title}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5 line-clamp-2">{prod.description || 'ไม่มีรายละเอียดสินค้า'}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                        <div>
                          <span className="text-xs font-black text-orange-600">฿{prod.price}</span>
                          {prod.originalPrice && <span className="text-[9px] text-slate-400 line-through ml-1.5">฿{prod.originalPrice}</span>}
                          {prod.discount && <span className="text-[9px] text-red-500 font-bold ml-1">{prod.discount}</span>}
                          <p className="text-[9px] text-slate-400 font-semibold">{prod.salesText || 'ขายแล้ว 0 ชิ้น'}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenProductModal(prod, 'home')}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(prod.id);
                              setDeleteConfirmMode('home');
                              setDeleteConfirmTitle(prod.title);
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB CONTENT: ACTIVITY PRODUCTS MANAGEMENT --- */}
        {activeTab === 'activity_products' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">จัดการสินค้ากิจกรรม</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">เพิ่ม ลบ หรือแก้ไขสินค้าที่แอดมินสามารถดึงไปจัดสรรให้ออเดอร์กับลูกค้า</p>
              </div>
              <button
                onClick={() => handleOpenProductModal(null, 'activity')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มสินค้ากิจกรรม</span>
              </button>
            </div>

            {loadingActivity ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-xs text-slate-500 font-bold">กำลังโหลดรายการสินค้ากิจกรรม...</span>
              </div>
            ) : activityProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold">ยังไม่มีสินค้ากิจกรรมในระบบหลังบ้านค่ะ กรุณาเพิ่มสินค้ากิจกรรมใหม่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activityProducts.map((prod, idx) => (
                  <div key={`act-prod-${prod.id}-${idx}`} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex gap-4">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-24 h-24 rounded-2xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {prod.isMall && <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">Mall</span>}
                          {prod.isHot && <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">ฮอต</span>}
                          {prod.isLive && <span className="bg-pink-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">Live</span>}
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded">{prod.location}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{prod.title}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5 line-clamp-2">{prod.description || 'ไม่มีรายละเอียดสินค้า'}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                        <div>
                          <span className="text-xs font-black text-orange-600">฿{prod.price}</span>
                          {prod.originalPrice && <span className="text-[9px] text-slate-400 line-through ml-1.5">฿{prod.originalPrice}</span>}
                          {prod.discount && <span className="text-[9px] text-red-500 font-bold ml-1">{prod.discount}</span>}
                          <p className="text-[9px] text-slate-400 font-semibold">{prod.salesText || 'ขายแล้ว 0 ชิ้น'}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenProductModal(prod, 'activity')}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(prod.id);
                              setDeleteConfirmMode('activity');
                              setDeleteConfirmTitle(prod.title);
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB CONTENT: CUSTOMER MATCHING & ASSIGNMENTS --- */}
        {activeTab === 'customer_orders' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800">จัดการคำขอจับคู่ & จัดสรรสินค้ากิจกรรม</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                รายชื่อสมาชิกที่กดปุ่ม <strong className="text-orange-500">"เริ่มทำรายการ"</strong> ในหน้าสั่งซื้อ (Order Tab) ในขณะนี้ แอดมินสามารถคลิกให้ออเดอร์โดยการเลือกเฉพาะสินค้ากิจกรรมเพื่อส่งไปยังหน้าสั่งซื้อของพวกเขาได้ทันที
              </p>
            </div>

            {loadingMatches && matchRequests.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-xs text-slate-500 font-bold">กำลังซิงค์และตรวจสอบคิวลูกค้าระยะเวลาจริง...</span>
              </div>
            ) : matchRequests.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold">ขณะนี้ไม่มีลูกค้าที่กำลังรอรับการจับคู่ออเดอร์ค่ะ</p>
                <p className="text-[10px] text-slate-300 font-semibold">เมื่อลูกค้าหน้าแอปพลิเคชันกดปุ่ม "เริ่มทำรายการ" รายชื่อจะปรากฏที่นี่โดยอัตโนมัติค่ะ</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="p-4">ชื่อลูกค้า</th>
                        <th className="p-4">เบอร์โทรศัพท์</th>
                        <th className="p-4">สถานะคิว</th>
                        <th className="p-4">สินค้าจัดสรร</th>
                        <th className="p-4 text-right">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matchRequests.map((req, idx) => (
                        <tr key={`match-req-${req.phone || 'none'}-${req.timestamp || idx}-${idx}`} className="hover:bg-slate-50/50 transition-colors text-xs font-semibold text-slate-700">
                          <td className="p-4 font-extrabold text-slate-900">{req.username}</td>
                          <td className="p-4 font-mono text-slate-500">{req.phone}</td>
                          <td className="p-4">
                            {req.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-amber-100 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                รอจัดสรรออเดอร์
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                จัดสรรแล้ว
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {req.assignedProduct ? (
                              <div className="flex items-center gap-2">
                                <img src={req.assignedProduct.image} alt="" className="w-6 h-6 rounded-md object-cover bg-slate-100" referrerPolicy="no-referrer" />
                                <span className="text-[10px] text-slate-800 line-clamp-1 max-w-[150px]">{req.assignedProduct.title}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">ยังไม่มี</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedMatchRequest(req);
                                setShowAssignModal(true);
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>ให้ออเดอร์สินค้า</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB CONTENT: DEPOSIT (เติมเงิน / ฝากเงิน) --- */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span>เมนูฝากเงิน / เติมเงินให้บัญชีผู้ใช้</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                ค้นหาเบอร์โทรศัพท์ของผู้ใช้งานที่คุณต้องการเติมเงินเข้าสู่กระเป๋าเงิน ShopeePay Wallet โดยตรงได้ที่นี่ค่ะ
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <form onSubmit={handleSearchUserByPhone} className="flex gap-2.5">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยเบอร์โทรศัพท์ผู้ใช้ (เช่น 088xxxxxxx)"
                    value={txSearchPhone}
                    onChange={(e) => setTxSearchPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-hidden transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={txLoading}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{txLoading ? 'กำลังค้นหา...' : 'ค้นหาบัญชี'}</span>
                </button>
              </form>

              {/* Show Target User Profile if Found */}
              {txTargetUser ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-black">
                        {txTargetUser.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">
                          {txTargetUser.realName || txTargetUser.username}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          เบอร์โทรศัพท์: {txTargetUser.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded">
                        บัญชีเปิดใช้งานอยู่
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">ยอดคงเหลือในกระเป๋า</span>
                      <strong className="text-sm font-black text-slate-800">
                        ฿{txTargetUser.balance?.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">ประเภทประเภทบัญชี</span>
                      <strong className="text-xs font-black text-slate-800 capitalize">
                        {txTargetUser.accountCategory === 'merchant' ? 'ร้านค้า (Merchant)' : 'ลูกค้าทั่วไป (Customer)'}
                      </strong>
                    </div>
                  </div>

                  {/* Submit Deposit Form */}
                  <form onSubmit={handleExecuteDeposit} className="border-t border-slate-200/60 pt-3 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 block">ระบุจำนวนเงินที่ต้องการฝาก/เติม (บาท) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">฿</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2 pl-7 pr-4 text-xs font-black text-slate-800 outline-hidden"
                          required
                          min="1"
                          step="any"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 block">หมายเหตุ / บันทึกช่วยจำ (ไม่บังคับ)</label>
                      <input
                        type="text"
                        placeholder="เช่น โอนเงินสดโดยแอดมิน, ปรับปรุงยอดเงินหลังบ้าน"
                        value={txNote}
                        onChange={(e) => setTxNote(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                    >
                      {updating ? 'กำลังบันทึกรายการ...' : 'ยืนยันฝากเงินเข้าสู่กระเป๋าผู้ใช้'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 font-bold text-xs">
                  กรุณาพิมพ์เบอร์โทรศัพท์ผู้ใช้งานด้านบน แล้วกด "ค้นหาบัญชี" เพื่อทำรายการฝากเงินค่ะ
                </div>
              )}
            </div>

            {/* DEPOSIT HISTORY IN THE SAME TAB */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap justify-between items-center gap-3 mt-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <RefreshCw className="w-5 h-5 text-teal-600" />
                  <span>ประวัติรายการฝากเงินทั้งหมด</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  แสดงบันทึกและสถานะของการเติมเงิน/ฝากเงินเข้าของลูกค้าทุกบัญชีค่ะ
                </p>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วยเบอร์โทรศัพท์..."
                  value={txSearchHistoryPhone}
                  onChange={(e) => setTxSearchHistoryPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl py-1.5 pl-8 pr-3 text-xs font-bold outline-hidden"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black">
                    <tr>
                      <th className="p-4">เวลาทำรายการ</th>
                      <th className="p-4">สมาชิก</th>
                      <th className="p-4">เบอร์โทรศัพท์</th>
                      <th className="p-4">จำนวนเงิน</th>
                      <th className="p-4">หมายเหตุ</th>
                      <th className="p-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {allTransactions
                      .filter(t => t.type === 'deposit')
                      .filter(t => !txSearchHistoryPhone || t.phone.includes(txSearchHistoryPhone))
                      .length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                            ไม่มีประวัติข้อมูลการเติมเงินตามคำที่ระบุค่ะ
                          </td>
                        </tr>
                      ) : (
                        allTransactions
                          .filter(t => t.type === 'deposit')
                          .filter(t => !txSearchHistoryPhone || t.phone.includes(txSearchHistoryPhone))
                          .map((tx, idx) => (
                            <tr key={`dep-tx-${tx.id || 'none'}-${idx}`} className="hover:bg-slate-50/50">
                              <td className="p-4 text-slate-400 font-medium">
                                {new Date(tx.createdAt).toLocaleString('th-TH')}
                              </td>
                              <td className="p-4 text-slate-800 font-extrabold">{tx.username}</td>
                              <td className="p-4 text-slate-500 font-medium">{tx.phone}</td>
                              <td className="p-4 text-teal-600 font-black">
                                +฿{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-4 text-slate-500 font-semibold max-w-[200px] truncate">
                                {tx.note || <span className="text-slate-300 italic">-</span>}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${tx.status === 'approved' ? 'bg-teal-100 text-teal-800' : tx.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                  {tx.status === 'approved' ? 'สำเร็จ' : tx.status === 'pending' ? 'รออนุมัติ' : 'ปฏิเสธ'}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: WITHDRAW (ถอนเงิน / หักยอด) --- */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Landmark className="w-5 h-5 text-red-500" />
                <span>เมนูถอนเงิน / หักยอดเงิน & จัดการคิวถอนเงิน</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                คุณสามารถหักเงินออกจากบัญชีผู้ใช้ใดๆ ได้โดยตรง หรือดำเนินการอนุมัติ/ปฏิเสธคำขอถอนเงินที่ส่งมาจากผู้ใช้ได้ที่ด้านล่างค่ะ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manual Withdrawal Column */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-700 border-b border-slate-50 pb-1.5">
                  1. ค้นหาและถอนเงิน (หักยอดโดยตรง)
                </h4>
                
                <form onSubmit={handleSearchUserByPhone} className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="เบอร์โทรผู้ใช้"
                      value={txSearchPhone}
                      onChange={(e) => setTxSearchPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-1.5 pl-8 pr-3 text-xs font-bold outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={txLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-3 rounded-xl cursor-pointer transition-colors"
                  >
                    ค้นหา
                  </button>
                </form>

                {txTargetUser ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2.5">
                    <div className="text-[11px] font-bold text-slate-800">
                      👤 {txTargetUser.realName || txTargetUser.username} ({txTargetUser.phone})
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/50 flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>ยอดคงเหลือในบัญชี:</span>
                      <span className="text-red-500">฿{txTargetUser.balance?.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <form onSubmit={handleExecuteWithdraw} className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 block">จำนวนเงินที่จะหัก/ถอน (บาท) *</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-lg py-1.5 px-2.5 text-xs font-black text-slate-800 outline-hidden"
                          required
                          min="1"
                          step="any"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 block">หมายเหตุการถอน (ไม่บังคับ)</label>
                        <input
                          type="text"
                          placeholder="เช่น แอดมินถอนออกให้, ปรับปรุงยอด"
                          value={txNote}
                          onChange={(e) => setTxNote(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-lg py-1.5 px-2.5 text-xs font-bold text-slate-700 outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updating || txTargetUser.balance <= 0}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-[10px] py-2 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                      >
                        {updating ? 'กำลังหักยอด...' : 'หักยอด/ถอนเงินบัญชีนี้'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 font-bold text-[10px]">
                    พิมพ์เบอร์โทรและค้นหาเพื่อหักเงินโดยตรงค่ะ
                  </div>
                )}
              </div>

              {/* Pending Requests Column */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-700 border-b border-slate-50 pb-1.5 flex items-center justify-between">
                  <span>2. รายการขอถอนเงินรออนุมัติ</span>
                  <span className="bg-orange-100 text-orange-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                    {allTransactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length} คิว
                  </span>
                </h4>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 block">ข้อความหมายเหตุประกอบการอนุมัติ/ปฏิเสธ (ใส่ค้างไว้เพื่อส่ง)</label>
                  <input
                    type="text"
                    placeholder="เช่น โอนเงินสำเร็จแล้ว, ชื่อบัญชีธนาคารไม่ถูกต้อง..."
                    value={txActionNote}
                    onChange={(e) => setTxActionNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg py-1.5 px-2.5 text-[10px] font-semibold text-slate-700 outline-hidden"
                  />
                </div>

                <div className="space-y-3.5 overflow-y-auto max-h-[350px] pr-1.5">
                  {allTransactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-[10px] font-bold">
                      ไม่มีคำขอถอนเงินรอการอนุมัติในขณะนี้ค่ะ
                    </div>
                  ) : (
                    allTransactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').map((tx, idx) => (
                      <div key={`pending-with-tx-${tx.id || 'none'}-${idx}`} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-extrabold text-slate-800">{tx.username}</div>
                            <div className="text-[9px] text-slate-400 font-bold">เบอร์: {tx.phone}</div>
                          </div>
                          <span className="text-red-500 font-black">
                            -฿{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {tx.note && (
                          <div className="text-[10px] bg-white border border-slate-200/50 p-2 rounded text-orange-600 font-bold leading-normal">
                            💬 ข้อความ: {tx.note}
                          </div>
                        )}

                        <div className="text-[9px] text-slate-400 font-medium">
                          เวลาส่งคำขอ: {new Date(tx.createdAt).toLocaleString('th-TH')}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleTransactionAction(tx.id, 'reject')}
                            disabled={updating}
                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-black py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                          >
                            ปฏิเสธการถอน
                          </button>
                          <button
                            onClick={() => handleTransactionAction(tx.id, 'approve')}
                            disabled={updating}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                          >
                            อนุมัติการถอน
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* WITHDRAW HISTORY IN THE SAME TAB */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap justify-between items-center gap-3 mt-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  <span>ประวัติรายการถอนเงินทั้งหมด</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  แสดงบันทึกและผลการทำรายการคำขอถอนเงินของบัญชีร้านค้าทั้งหมดค่ะ
                </p>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วยเบอร์โทรศัพท์..."
                  value={txSearchHistoryPhone}
                  onChange={(e) => setTxSearchHistoryPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl py-1.5 pl-8 pr-3 text-xs font-bold outline-hidden"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black">
                    <tr>
                      <th className="p-4">เวลาทำรายการ</th>
                      <th className="p-4">บัญชีร้านค้า</th>
                      <th className="p-4">เบอร์โทรศัพท์</th>
                      <th className="p-4">จำนวนเงินที่หัก</th>
                      <th className="p-4">รายละเอียด / หมายเหตุ</th>
                      <th className="p-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {allTransactions
                      .filter(t => t.type === 'withdrawal')
                      .filter(t => !txSearchHistoryPhone || t.phone.includes(txSearchHistoryPhone))
                      .length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                            ไม่มีประวัติข้อมูลการถอนเงินตามคำที่ระบุค่ะ
                          </td>
                        </tr>
                      ) : (
                        allTransactions
                          .filter(t => t.type === 'withdrawal')
                          .filter(t => !txSearchHistoryPhone || t.phone.includes(txSearchHistoryPhone))
                          .map((tx, idx) => (
                            <tr key={`with-history-tx-${tx.id || 'none'}-${idx}`} className="hover:bg-slate-50/50">
                              <td className="p-4 text-slate-400 font-medium">
                                {new Date(tx.createdAt).toLocaleString('th-TH')}
                              </td>
                              <td className="p-4 text-slate-800 font-extrabold">{tx.username}</td>
                              <td className="p-4 text-slate-500 font-medium">{tx.phone}</td>
                              <td className="p-4 text-red-500 font-black">
                                -฿{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-4 text-slate-500 font-semibold max-w-[200px] truncate">
                                {tx.note || <span className="text-slate-300 italic">-</span>}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${tx.status === 'approved' ? 'bg-teal-100 text-teal-800' : tx.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                  {tx.status === 'approved' ? 'สำเร็จ' : tx.status === 'pending' ? 'รออนุมัติ' : 'ปฏิเสธ'}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- POPUP MODAL: ADD / EDIT PRODUCT --- */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowProductModal(false)}></div>
          
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 border border-slate-200"
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-extrabold text-sm flex items-center gap-1">
                <Layers className="w-4.5 h-4.5 text-orange-400" />
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าเข้าสู่ระบบ'} ({productMode === 'home' ? 'สินค้าหน้าแรก' : 'สินค้ากิจกรรม'})
              </span>
              <button type="button" onClick={() => setShowProductModal(false)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  placeholder="กรอกชื่อเรื่องสินค้า"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">ราคาสินค้า (บาท) *</label>
                  <input
                    type="number"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="เช่น 372"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">ราคาเต็มเดิม (ไม่มีใส่ว่างไว้)</label>
                  <input
                    type="number"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    placeholder="เช่น 1000"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">เปอร์เซ็นต์ส่วนลด (เช่น -60%)</label>
                  <input
                    type="text"
                    value={pDiscount}
                    onChange={(e) => setPDiscount(e.target.value)}
                    placeholder="เช่น -60%"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">ยอดขายแสดงผล (เช่น ขายแล้ว 10พัน+)</label>
                  <input
                    type="text"
                    value={pSalesText}
                    onChange={(e) => setPSalesText(e.target.value)}
                    placeholder="เช่น ขายแล้ว 10พัน+"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {/* Product Images Manager */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <Image className="w-4 h-4 text-orange-500" /> รูปภาพสินค้า (ใส่ได้หลายรูป)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">สามารถอัปโหลดไฟล์จากเครื่องได้</span>
                </div>

                {/* File Upload Box */}
                <div className="flex gap-2">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-orange-400 bg-white hover:bg-orange-50/10 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <Plus className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">อัปโหลดรูปภาพจากเครื่อง</span>
                    <span className="text-[9px] text-slate-400">เลือกรุ่น/ไฟล์รูปได้หลายๆ รูปพร้อมกัน</span>
                  </label>
                </div>

                {/* Thumbnail Previews */}
                {pImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {pImages.map((img, idx) => {
                      const isMain = img === pImage;
                      return (
                        <div
                          key={`prod-img-idx-${idx}`}
                          className={`relative aspect-square rounded-lg overflow-hidden border bg-white group ${
                            isMain ? 'border-orange-500 ring-2 ring-orange-500/25' : 'border-slate-200'
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isMain && (
                            <span className="absolute top-1 left-1 bg-orange-500 text-white text-[8px] font-black px-1 py-0.5 rounded shadow">
                              รูปหลัก
                            </span>
                          )}
                          
                          {/* Hover Overlay Controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1 gap-1">
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => pImage !== img && setPImage(img)}
                                className="bg-white text-slate-800 text-[8px] font-black py-0.5 rounded text-center cursor-pointer hover:bg-slate-100"
                              >
                                ตั้งเป็นรูปหลัก
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImageIndex(idx)}
                              className="bg-red-500 text-white text-[8px] font-black py-0.5 rounded text-center cursor-pointer hover:bg-red-600 flex items-center justify-center gap-0.5"
                            >
                              <Trash2 className="w-2 h-2" /> ลบรูปนี้
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Backwards-compatibility paste direct URL input */}
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-0.5">หรือวางลิงก์รูปภาพโดยตรง (รูปหลัก)</label>
                  <input
                    type="text"
                    value={pImage}
                    onChange={(e) => {
                      setPImage(e.target.value);
                      if (e.target.value && !pImages.includes(e.target.value)) {
                        setPImages((prev) => [...prev, e.target.value]);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {/* Product Direct Click Link Field */}
              <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100 space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <Globe className="w-4 h-4 text-orange-600" /> ลิงก์รายละเอียดสินค้าจริง (ลิงก์นำทางทันที)
                </label>
                <input
                  type="url"
                  value={pProductLink}
                  onChange={(e) => setPProductLink(e.target.value)}
                  placeholder="เช่น https://shopee.co.th/product-link-here..."
                  className="w-full bg-white border border-orange-200 px-3 py-2 rounded-xl text-xs font-bold outline-none text-orange-950 placeholder-orange-300"
                />
                <p className="text-[10px] text-slate-400 font-bold leading-tight">
                  * หากใส่ลิงก์นี้ไว้ เมื่อผู้ใช้กดคลิกที่สินค้าในแอปพลิเคชันระบบจะนำทางเปิดลิงก์ภายนอกนี้ทันทีโดยไม่ต้องผ่านหน้าต่างรายละเอียด! 🚀
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">จังหวัดแหล่งที่มาสินค้า</label>
                  <input
                    type="text"
                    value={pLocation}
                    onChange={(e) => setPLocation(e.target.value)}
                    placeholder="เช่น จังหวัดกรุงเทพมหานคร"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">เวลาในการจัดส่ง</label>
                  <input
                    type="text"
                    value={pDeliveryTime}
                    onChange={(e) => setPDeliveryTime(e.target.value)}
                    placeholder="เช่น พรุ่งนี้"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อร้านค้าที่จำหน่าย</label>
                <input
                  type="text"
                  value={pShopName}
                  onChange={(e) => setPShopName(e.target.value)}
                  placeholder="เช่น Shopee Mall Store"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">ตัวเลือกสินค้า (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                <input
                  type="text"
                  value={pVariants}
                  onChange={(e) => setPVariants(e.target.value)}
                  placeholder="สีขาว, สีดำ, สีครีม"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">รายละเอียดสินค้า (Description)</label>
                <textarea
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="อธิบายคุณลักษณะของสินค้าชิ้นนี้"
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsMall}
                    onChange={(e) => setPIsMall(e.target.checked)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span>แท็กร้านค้า Shopee Mall</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsHot}
                    onChange={(e) => setPIsHot(e.target.checked)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span>แท็กร้านค้าลดสุดคุ้ม (ฮอต)</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsLive}
                    onChange={(e) => setPIsLive(e.target.checked)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span>สัญลักษณ์ถ่ายทอดสด (Live)</span>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {updating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>บันทึกข้อมูลสินค้า</span>
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* --- POPUP MODAL: CHOOSE & ASSIGN PRODUCT TO CUSTOMER --- */}
      {showAssignModal && selectedMatchRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowAssignModal(false)}></div>
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10 border border-slate-200"
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-sm flex items-center gap-1">
                  <Award className="w-4.5 h-4.5 text-orange-400" /> เลือกออเดอร์ส่งให้ลูกค้า
                </span>
                <p className="text-[10px] text-slate-300 mt-0.5">ลูกค้า: {selectedMatchRequest.username} ({selectedMatchRequest.phone})</p>
              </div>
              <button type="button" onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <p className="text-xs text-slate-500 font-bold">
                กรุณาคลิกเลือก <strong className="text-orange-500">สินค้ากิจกรรม</strong> ด้านล่างนี้เพื่อส่งออเดอร์นี้ไปยังบัญชีผู้ใช้ท่านนี้ทันที:
              </p>

              {activityProducts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold">ยังไม่ได้เพิ่มสินค้ากิจกรรมในระบบค่ะ</p>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setActiveTab('activity_products');
                    }}
                    className="mt-2 text-xs text-orange-500 font-black cursor-pointer underline hover:text-orange-600"
                  >
                    ไปหน้าเพิ่มสินค้ากิจกรรม
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activityProducts.map((prod, idx) => (
                    <div
                      key={`act-prod-assign-${prod.id}-${idx}`}
                      onClick={() => handleAssignProduct(selectedMatchRequest.phone, prod.id)}
                      className="border border-slate-200 hover:border-orange-500 p-3 rounded-2xl flex gap-3 cursor-pointer hover:bg-orange-50/20 transition-all text-left"
                    >
                      <img src={prod.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <span className="text-xs font-extrabold text-slate-800 line-clamp-1 block">{prod.title}</span>
                        <div className="mt-1">
                          <span className="text-xs font-black text-orange-600 block">฿{prod.price}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{prod.salesText || 'ขายแล้ว 0 ชิ้น'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- POPUP MODAL: CREATE CUSTOMER ACCOUNT --- */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowCreateUserModal(false)}></div>
          
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onSubmit={handleCreateUser}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-200"
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-extrabold text-sm flex items-center gap-1">
                <Users className="w-4.5 h-4.5 text-orange-400" /> สมัครสมาชิกระบบหลังบ้าน
              </span>
              <button type="button" onClick={() => setShowCreateUserModal(false)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Username */}
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อผู้ใช้ (Username)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="เช่น มะลิ นามสมมุติ"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">เบอร์โทรศัพท์ผู้ใช้ (10 หลัก)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="กรอกเบอร์โทร 10 หลัก"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">กำหนดรหัสผ่าน (รหัสผ่าน 8 ตัวขึ้นไป)</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="รหัสผ่านขั้นต่ำ 8 ตัวอักษร"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              {/* Account Type Country Selection */}
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">ประเภทบัญชีประจำประเทศ (เลือกเพื่อกำหนดรหัสเชิญอัตโนมัติ)</label>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Thailand">Customer Account (ประเทศไทย) - รหัสเชิญ th3585</option>
                  <option value="Laos">Customer Account (ประเทศลาว) - รหัสเชิญ lo4385</option>
                </select>
                <p className="text-[9px] text-slate-400 mt-1">ระบบหลังบ้านจะจัดรหัสเชิญให้อัตโนมัติและแยกสัญชาติตามการเลือกค่ะ</p>
              </div>

              {/* Account category */}
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">สิทธิ์การเปิดร้านค้า / สมาชิก</label>
                <select
                  value={newAccountCategory}
                  onChange={(e) => setNewAccountCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="customer">ประเภทบัญชีลูกค้าธรรมดา (Customer Account)</option>
                  <option value="merchant">ประเภทบัญชีผู้ขายพาร์ตเนอร์ร้านค้า (Merchant Partner)</option>
                </select>
              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer"
              >
                {updating ? 'กำลังสมัคร...' : 'สมัครสมาชิกสมาชิก'}
              </button>
            </div>

          </motion.form>
        </div>
      )}

      {/* --- POPUP MODAL: CREATE ADMIN ACCOUNT --- */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowCreateAdminModal(false)}></div>
          
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onSubmit={(e) => { e.preventDefault(); handleAdminAction('create'); }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-200"
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-extrabold text-sm flex items-center gap-1">
                <Shield className="w-4.5 h-4.5 text-orange-400 fill-current" /> แต่งตั้งแอดมินระดับสูงสุดร่วม
              </span>
              <button type="button" onClick={() => setShowCreateAdminModal(false)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อแอดมินร่วม</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="เช่น แอดมินสิริ"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">เบอร์โทรศัพท์แอดมิน (ล็อกอิน)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="กรอกเบอร์โทร 10 หลัก"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">รหัสผ่านล็อกอิน</label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="รหัสผ่านขั้นต่ำ 8 ตัว"
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateAdminModal(false)}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer"
              >
                {updating ? 'กำลังแต่งตั้ง...' : 'บันทึกการแต่งตั้ง'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* --- POPUP MODAL: EDIT ADMIN ACCOUNT --- */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setEditingAdmin(null)}></div>
          
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onSubmit={(e) => { e.preventDefault(); handleAdminAction('edit', editingAdmin.phone); }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-200"
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-extrabold text-sm flex items-center gap-1">
                <Shield className="w-4.5 h-4.5 text-orange-400 fill-current" /> แก้ไขรหัสผ่านแอดมิน: {editingAdmin.username}
              </span>
              <button type="button" onClick={() => setEditingAdmin(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อบัญชีแอดมิน</label>
                <input
                  type="text"
                  value={editingAdmin.username}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, username: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">เบอร์โทรศัพท์แอดมิน</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editingAdmin.phone}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value.replace(/\D/g, '') })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1">รหัสผ่านสำหรับแอดมิน</label>
                <input
                  type="text"
                  value={editingAdmin.passwordHash}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, passwordHash: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={updating}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer"
              >
                {updating ? 'กำลังบันทึก...' : 'บันทึกแก้ไข'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* --- POPUP MODAL: EDIT MEMBER DETAILS --- */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setEditingUser(null)}></div>

            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleUpdateUser}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 border border-slate-150 flex flex-col max-h-[90vh]"
            >
              {/* Modal header */}
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400 fill-current" />
                  <span className="font-extrabold text-sm">แก้ไขข้อมูลสมาชิก: {editingUser.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal content scrollable */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-3.5">
                  
                  {/* Username */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อผู้ใช้ (Username)</label>
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  {/* Password Raw */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">รหัสผ่านล็อกอิน (Login Password)</label>
                    <input
                      type="text"
                      value={editingUser.rawPassword}
                      onChange={(e) => setEditingUser({ ...editingUser, rawPassword: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  {/* Transaction Password */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">รหัสผ่านทุรกรรม / ถอนเงิน (Transaction Code)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editingUser.transactionPassword || '999999'}
                      onChange={(e) => setEditingUser({ ...editingUser, transactionPassword: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none font-mono"
                    />
                  </div>

                  {/* Account category / Type */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ประเภทสิทธิ์แอป (Customer / Merchant)</label>
                    <select
                      value={editingUser.accountCategory || 'customer'}
                      onChange={(e) => setEditingUser({ ...editingUser, accountCategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="customer">ประเภทบัญชีลูกค้า (Customer Account)</option>
                      <option value="merchant">ประเภทบัญชีผู้ขายพาร์ตเนอร์ร้านค้า (Merchant)</option>
                    </select>
                  </div>

                  {/* Real Name */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อจริง - นามสกุลจริง (สอดคล้องกับเลขที่บัญชี)</label>
                    <input
                      type="text"
                      value={editingUser.realName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, realName: e.target.value })}
                      placeholder="ไม่ระบุ"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  {/* Bank Name */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ชื่อธนาคาร</label>
                    <input
                      type="text"
                      value={editingUser.bankName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, bankName: e.target.value })}
                      placeholder="ไม่ระบุ"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  {/* Bank Account */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">เลขที่บัญชีธนาคาร</label>
                    <input
                      type="text"
                      value={editingUser.bankAccount || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, bankAccount: e.target.value })}
                      placeholder="ไม่ระบุ"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  {/* Balance */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ยอดเงินคงเหลือในบัญชี (THB) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingUser.balance}
                      onChange={(e) => setEditingUser({ ...editingUser, balance: e.target.value })}
                      required
                      className="w-full bg-orange-50 border border-orange-200 px-3 py-2.5 rounded-xl text-xs font-black text-orange-800 outline-none"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">แก้ไขยอดเงินโดยตรงได้ที่นี่ หรือฝาก/ถอนเงินที่เมนูธุรกรรมฝากถอน</span>
                  </div>

                  {/* Commission */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ยอดค่าคอมมิชชั่นสะสม (THB)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingUser.commission}
                      onChange={(e) => setEditingUser({ ...editingUser, commission: e.target.value })}
                      required
                      className="w-full bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs font-black text-emerald-800 outline-none"
                    />
                  </div>

                  {/* Frozen Amount */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ยอดเงินที่ถูกอายัดไว้ (THB)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingUser.frozen}
                      onChange={(e) => setEditingUser({ ...editingUser, frozen: e.target.value })}
                      required
                      className="w-full bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl text-xs font-black text-red-800 outline-none"
                    />
                  </div>

                  {/* Level Selection */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ระดับพาร์ตเนอร์ผู้ใช้ (Level)</label>
                    <select
                      value={editingUser.level}
                      onChange={(e) => setEditingUser({ ...editingUser, level: parseInt(e.target.value, 10) })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                    >
                      {[-1, 0, 1, 2, 3, 4, 5, 6, 7].map(l => (
                        <option key={l} value={l}>{l === -1 ? 'Member (ไม่มีเลเวล)' : `Level ${l}`}</option>
                      ))}
                    </select>
                  </div>

                  {/* Latest Deposit Amount Selection */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ยอดเติมรอบล่าสุด (ShopeePay Wallet)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingUser.latestDepositAmount ?? 0}
                      onChange={(e) => setEditingUser({ ...editingUser, latestDepositAmount: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  {/* Country Categories selection */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 block mb-1">ประเทศของสมาชิก</label>
                    <select
                      value={editingUser.country || 'Thailand'}
                      onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="Thailand">ประเทศไทย (Thailand) - รหัสเชิญ th3585</option>
                      <option value="Laos">สปป. ลาว (Laos) - รหัสเชิญ lo4385</option>
                    </select>
                  </div>

                  {/* Account state block */}
                  <div className="col-span-2 flex items-center gap-2 bg-red-50/50 p-3 rounded-2xl border border-red-100">
                    <input
                      type="checkbox"
                      id="blocked-toggle"
                      checked={editingUser.isBlocked || false}
                      onChange={(e) => setEditingUser({ ...editingUser, isBlocked: e.target.checked })}
                      className="w-4.5 h-4.5 accent-red-600 rounded cursor-pointer"
                    />
                    <label htmlFor="blocked-toggle" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                      <Ban className="w-3.5 h-3.5 text-red-500" />
                      <span>ระงับการเข้าสู่ระบบบัญชีนี้ชั่วคราว (อายัดสิทธิ์เข้าระบบ)</span>
                    </label>
                  </div>

                  {/* Account state ban */}
                  <div className="col-span-2 flex items-center gap-2 bg-red-900/10 p-3 rounded-2xl border border-red-200">
                    <input
                      type="checkbox"
                      id="banned-toggle"
                      checked={editingUser.isBanned || false}
                      onChange={(e) => setEditingUser({ ...editingUser, isBanned: e.target.checked })}
                      className="w-4.5 h-4.5 accent-red-850 rounded cursor-pointer"
                    />
                    <label htmlFor="banned-toggle" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                      <Ban className="w-3.5 h-3.5 text-red-850" />
                      <span>แบนไอดีสมาชิกรถเข็นคนนี้ตลอดชีพ (Ban for Life)</span>
                    </label>
                  </div>

                </div>
              </div>

              {/* Modal actions */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updating ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสมาชิก'}</span>
                </button>
              </div>

            </motion.form>
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => { setDeleteConfirmId(null); setDeleteConfirmMode(null); setDeleteConfirmTitle(''); }}></div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-150 flex flex-col"
            >
              <div className="text-white px-5 py-4 flex items-center justify-between" style={{ backgroundColor: '#dc2626' }}>
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-white" />
                  <span className="font-extrabold text-sm">ยืนยันการลบสินค้า</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmId(null); setDeleteConfirmMode(null); setDeleteConfirmTitle(''); }}
                  className="p-1 hover:bg-white/10 rounded-full text-slate-100 hover:text-white transition-colors animate-pulse"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-black text-slate-800 text-sm mb-1">คุณต้องการลบสินค้านี้อย่างถาวรใช่หรือไม่?</h3>
                <p className="text-xs text-slate-500 font-bold px-3 line-clamp-2">{deleteConfirmTitle}</p>
                <p className="text-[10px] text-red-500 mt-2 font-bold bg-red-50 py-1 px-3 rounded-lg inline-block">
                  การดำเนินการนี้ไม่สามารถยกเลิกได้และจะมีผลเรียลไทม์ทันที
                </p>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmId(null); setDeleteConfirmMode(null); setDeleteConfirmTitle(''); }}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => {
                    if (deleteConfirmId && deleteConfirmMode) {
                      handleDeleteProduct(deleteConfirmId, deleteConfirmMode);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1 transition-all cursor-pointer"
                >
                  {updating ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
