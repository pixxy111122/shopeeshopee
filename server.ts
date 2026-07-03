/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = express();
const PORT = 3000;

const isVercel = !!process.env.VERCEL;
const isServerless = isVercel || !!process.env.K_SERVICE || !!process.env.FUNCTION_TARGET || !!process.env.FUNCTION_NAME;
const storageDir = isServerless ? '/tmp' : process.cwd();

// Copy default database files to /tmp for writing if running in a serverless/read-only environment
function initServerlessStorage() {
  if (!isServerless) return;
  const filesToCopy = [
    'users_db.json',
    'shopee_settings.json',
    'transactions_db.json',
    'products_db.json',
    'activity_products_db.json',
    'match_requests_db.json'
  ];
  for (const filename of filesToCopy) {
    const src = path.join(process.cwd(), filename);
    const dest = path.join('/tmp', filename);
    if (!fs.existsSync(dest)) {
      try {
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`[Serverless Storage] Copied ${filename} to /tmp`);
        }
      } catch (err) {
        console.error(`[Serverless Storage] Failed to copy ${filename} to /tmp:`, err);
      }
    }
  }
}
initServerlessStorage();

const DB_FILE = path.join(storageDir, 'users_db.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CORS & CLOUDFLARE COMPATIBILITY MIDDLEWARE ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // If request contains Origin, mirror it back to allow credentials safely. Else allow wildcard.
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache OPTIONS preflight for 24 hours

  // Respond immediately to preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// --- DATABASE TYPES ---
interface UserAccount {
  username: string;
  phone: string; // Key / identifier
  bankName: string;
  realName: string;
  bankAccount: string;
  passwordHash: string; // Stored simply for this secure demo
  transactionPassword?: string; // Transaction code
  role: 'customer' | 'admin';
  balance: number;
  commission: number;
  frozen: number;
  ordersCompleted: number;
  level: number;
  isBlocked: boolean;
  isBanned?: boolean;
  createdAt: string;
  invitationCode?: string;
  accountCategory?: 'customer' | 'merchant'; // Customer or merchant account category
  country?: 'Thailand' | 'Laos'; // Thai or Laos category
  latestDepositAmount?: number;
}

function getLevelByLatestDeposit(amount: number): number {
  if (amount >= 50000) return 7;
  if (amount >= 20000) return 6;
  if (amount >= 10000) return 5;
  if (amount >= 5000) return 4;
  if (amount >= 3000) return 3;
  if (amount >= 2000) return 2;
  if (amount >= 1000) return 1;
  if (amount >= 500) return 0;
  return -1; // Member level
}

interface SystemSettings {
  siteName: string;
  siteLogo: string;
  siteIcon?: string;
  themeColor: string;
  slides: {
    id: string;
    title: string;
    desc: string;
    discount: string;
    btnText: string;
    bg: string;
    image: string;
  }[];
  lineUrl?: string;
  whatsappUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;

  shopeefoodLogo?: string;
  shopeefoodUrl?: string;
  shopeefoodLabel?: string;
  shopeefoodSubLabel?: string;

  freeshippingLogo?: string;
  freeshippingUrl?: string;
  freeshippingLabel?: string;
  freeshippingSubLabel?: string;

  paydayLogo?: string;
  paydayUrl?: string;
  paydayLabel?: string;
  paydaySubLabel?: string;

  instantLogo?: string;
  instantUrl?: string;
  instantLabel?: string;
  instantSubLabel?: string;

  flashdealLogo?: string;
  flashdealUrl?: string;
  flashdealLabel?: string;
  flashdealSubLabel?: string;
}

const SETTINGS_FILE = path.join(storageDir, 'shopee_settings.json');

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'Shopee',
  siteLogo: '',
  siteIcon: '',
  themeColor: '#ea580c',
  slides: [
    { id: 'c1', title: 'PAY DAY', desc: 'เงินออกช้อปเลย', discount: 'โค้ดลดสูงสุด 30%', btnText: 'ช้อปเลย >', bg: 'from-orange-500 via-red-600 to-pink-600', image: '' },
    { id: 'c2', title: 'Shopee VIP', desc: 'สิทธิพิเศษเหนือใคร', discount: 'โค้ดลด 50%', btnText: 'สมัคร 1.- >', bg: 'from-blue-600 via-indigo-600 to-purple-600', image: '' },
    { id: 'c3', title: 'โค้ดลดคุ้ม Xtra', desc: 'ลดทุกหมวดหมู่', discount: 'ส่วนลดสูงสุด 30%', btnText: 'ดูเพิ่มเติม >', bg: 'from-red-600 to-orange-500', image: '' }
  ],
  lineUrl: 'https://line.me',
  whatsappUrl: 'https://whatsapp.com',
  facebookUrl: 'https://facebook.com',
  tiktokUrl: 'https://tiktok.com',

  shopeefoodLogo: 'https://logos-world.net/wp-content/uploads/2022/11/ShopeeFood-Logo.png',
  shopeefoodUrl: 'https://th.shp.ee/vSLR2HS9',
  shopeefoodLabel: 'ShopeeFood',
  shopeefoodSubLabel: '',

  freeshippingLogo: '',
  freeshippingUrl: 'https://th.shp.ee/dX5XrshZ',
  freeshippingLabel: 'ส่งฟรี* +',
  freeshippingSubLabel: 'โค้ดลดทั้งแอป',

  paydayLogo: '',
  paydayUrl: 'https://th.shp.ee/EvpbriqW',
  paydayLabel: 'PAY DAY',
  paydaySubLabel: '6.25 ช้อปเลย',

  instantLogo: '',
  instantUrl: 'https://th.shp.ee/CSRKfM1g',
  instantLabel: 'สั่งปุ๊บ ส่งปั๊บ',
  instantSubLabel: 'รับทันที',

  flashdealLogo: '',
  flashdealUrl: 'https://th.shp.ee/VqGS57C3',
  flashdealLabel: 'Flash Deal',
  flashdealSubLabel: 'ดีลเด็ดด่วน'
};

// Default Administrator Account and sample database initialization
const DEFAULT_ADMIN: UserAccount = {
  username: 'admin_shopee',
  phone: '0909090909',
  bankName: 'ธนาคารกสิกรไทย',
  realName: 'แอดมินระบบสูงสุด',
  bankAccount: '1234567890',
  passwordHash: '12345678', // Default login
  transactionPassword: '999999',
  role: 'admin',
  balance: 99429.30,
  commission: 54694.78,
  frozen: 0.00,
  ordersCompleted: 63,
  level: 7,
  isBlocked: false,
  isBanned: false,
  createdAt: new Date().toISOString(),
  accountCategory: 'customer',
  country: 'Thailand'
};

// --- FIREBASE INITIALIZATION ---
const FIREBASE_CONFIG_PATH = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseDb: any = null;
let isFirebaseReady = false;
let firebaseAppInstance: any = null;
let firebaseConfig: any = null;

if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf8'));
    const fbConfig = firebaseConfig;
    
    // We only initialize Firebase Admin on Vercel/Serverless if credentials are explicitly provided.
    // Otherwise, on GCP / Cloud Run, we can initialize it because it will use Application Default Credentials.
    const hasCredentials = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT);
    const shouldInitialize = !isVercel || hasCredentials;

    if (shouldInitialize) {
      if (getApps().length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
          // Safe guard against Vercel/GitHub stringify wrapping
          if (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"')) {
            try {
              serviceAccountStr = JSON.parse(serviceAccountStr);
            } catch (e) {
              // fallback
            }
          }
          const serviceAccount = JSON.parse(serviceAccountStr);
          // Standard fix: Vercel might escape the private_key's newlines, let's fix it if it's there
          if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
          }
          firebaseAppInstance = initializeApp({
            credential: cert(serviceAccount),
            projectId: fbConfig.projectId,
          });
        } else {
          firebaseAppInstance = initializeApp({
            projectId: fbConfig.projectId,
          });
        }
      } else {
        firebaseAppInstance = getApps()[0];
      }
      if (fbConfig.firestoreDatabaseId && fbConfig.firestoreDatabaseId !== '(default)') {
        firebaseDb = getFirestore(firebaseAppInstance, fbConfig.firestoreDatabaseId);
      } else {
        firebaseDb = getFirestore(firebaseAppInstance);
      }
      console.log('[Firebase] Admin SDK initialized with database ID:', fbConfig.firestoreDatabaseId || '(default)');
    } else {
      console.log('[Firebase] Skipping Admin SDK initialization on Vercel due to missing service account credentials. Falling back to local JSON database.');
    }
  } catch (err) {
    console.error('[Firebase] Failed to initialize Firebase Admin SDK:', err);
  }
}

// --- READ / WRITE DATABASE HELPERS ---
function loadUsers(): UserAccount[] {
  if (usersCache !== null) {
    return usersCache;
  }
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([DEFAULT_ADMIN], null, 2), 'utf-8');
      usersCache = [DEFAULT_ADMIN];
      return usersCache;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    let parsed = JSON.parse(data) as UserAccount[];
    if (Array.isArray(parsed)) {
      parsed = parsed.filter(u => u && typeof u === 'object' && typeof u.phone === 'string');
    } else {
      parsed = [DEFAULT_ADMIN];
    }
    
    // Ensure default admin exists in database if it got cleared
    const hasAdmin = parsed.some(u => u.phone === DEFAULT_ADMIN.phone);
    if (!hasAdmin) {
      parsed.push(DEFAULT_ADMIN);
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    usersCache = parsed;
    return usersCache;
  } catch (error) {
    console.error('Database load error, fallback to memory storage:', error);
    usersCache = [DEFAULT_ADMIN];
    return usersCache;
  }
}

function saveUsers(users: UserAccount[]): boolean {
  try {
    const cleanUsers = (users || []).filter(u => u && typeof u === 'object' && typeof u.phone === 'string');
    usersCache = cleanUsers;
    fs.writeFileSync(DB_FILE, JSON.stringify(cleanUsers, null, 2), 'utf-8');
    if (firebaseDb && isFirebaseReady) {
      cleanUsers.forEach(user => {
        if (user && user.phone) {
          const cleanUser = JSON.parse(JSON.stringify(user));
          try {
            firebaseDb.collection('users').doc(user.phone).set(cleanUser).catch((err: any) => {
              console.error('[Firebase] Save user error:', err);
            });
          } catch (err) {
            console.error('[Firebase] Synchronous save user doc creation error:', err);
          }
        }
      });
    }
    return true;
  } catch (error) {
    console.error('Database save error:', error);
    return false;
  }
}

function loadSettings(): SystemSettings {
  if (settingsCache !== null) {
    return settingsCache;
  }
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
      settingsCache = DEFAULT_SETTINGS;
      return settingsCache;
    }
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as SystemSettings;
    if (parsed && typeof parsed === 'object') {
      settingsCache = parsed;
    } else {
      settingsCache = DEFAULT_SETTINGS;
    }
    return settingsCache;
  } catch (error) {
    console.error('Settings load error:', error);
    settingsCache = DEFAULT_SETTINGS;
    return settingsCache;
  }
}

function saveSettings(settings: SystemSettings): boolean {
  try {
    settingsCache = settings;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    if (firebaseDb && isFirebaseReady) {
      const cleanSettings = JSON.parse(JSON.stringify(settings));
      try {
        firebaseDb.collection('shopee_settings').doc('global').set(cleanSettings).catch((err: any) => {
          console.error('[Firebase] Save settings error:', err);
        });
      } catch (err) {
        console.error('[Firebase] Synchronous save settings error:', err);
      }
    }
    return true;
  } catch (error) {
    console.error('Settings save error:', error);
    return false;
  }
}

const TRANSACTIONS_FILE = path.join(storageDir, 'transactions_db.json');

interface Transaction {
  id: string;
  phone: string;
  username: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
}

function loadTransactions(): Transaction[] {
  if (transactionsCache !== null) {
    return transactionsCache;
  }
  try {
    if (!fs.existsSync(TRANSACTIONS_FILE)) {
      fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      transactionsCache = [];
      return transactionsCache;
    }
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
    let parsed = JSON.parse(data) as Transaction[];
    if (Array.isArray(parsed)) {
      parsed = parsed.filter(t => t && typeof t === 'object' && typeof t.id === 'string');
    } else {
      parsed = [];
    }
    transactionsCache = parsed;
    return transactionsCache;
  } catch (error) {
    console.error('Transactions load error:', error);
    transactionsCache = [];
    return transactionsCache;
  }
}

function saveTransactions(txs: Transaction[]): boolean {
  try {
    const cleanTxs = (txs || []).filter(t => t && typeof t === 'object' && typeof t.id === 'string');
    transactionsCache = cleanTxs;
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(cleanTxs, null, 2), 'utf-8');
    if (firebaseDb && isFirebaseReady) {
      cleanTxs.forEach(tx => {
        if (tx && tx.id) {
          const cleanTx = JSON.parse(JSON.stringify(tx));
          try {
            firebaseDb.collection('transactions').doc(tx.id).set(cleanTx).catch((err: any) => {
              console.error('[Firebase] Save transaction error:', err);
            });
          } catch (err) {
            console.error('[Firebase] Synchronous save transaction doc creation error:', err);
          }
        }
      });
    }
    return true;
  } catch (error) {
    console.error('Transactions save error:', error);
    return false;
  }
}

// Caches for the database collections to avoid slow synchronous file reads on every API call
let usersCache: UserAccount[] | null = null;
let settingsCache: SystemSettings | null = null;
let transactionsCache: Transaction[] | null = null;
let productsCache: any[] | null = null;
let activityProductsCache: any[] | null = null;
let matchRequestsCache: MatchRequest[] | null = null;

const PRODUCTS_FILE = path.join(storageDir, 'products_db.json');
const ACTIVITY_PRODUCTS_FILE = path.join(storageDir, 'activity_products_db.json');
const MATCH_REQUESTS_FILE = path.join(storageDir, 'match_requests_db.json');

interface MatchRequest {
  phone: string;
  username: string;
  status: 'pending' | 'assigned';
  assignedProduct: any | null;
  timestamp: number;
}

// Helpers for Products
function loadProducts(): any[] {
  if (productsCache !== null) {
    return productsCache;
  }
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      const defaultProducts = [
        {
          id: 'prod-1',
          title: 'ไม่ระบุชื่อสินค้าหน้ากล่องพัสดุ 📍 #รวมทุกแบบความไวสูงอุปกรณ์ตรวจครรภ์ที่ตรวจครรภ์',
          price: 3,
          originalPrice: 10,
          discount: '-70%',
          salesText: 'ขายแล้ว 7พัน+',
          image: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=500&auto=format&fit=crop&q=80',
          deliveryTime: 'พรุ่งนี้',
          location: 'จังหวัดกรุงเทพมหานคร',
          isLive: false,
          rating: 4.9,
          reviewsCount: 14200,
          description: 'อุปกรณ์ชุดตรวจหาสารบ่งชี้การตั้งครรภ์ชนิดตลับและชนิดหยด ใช้งานง่าย มีความแม่นยำสูงมากกว่า 99% จัดส่งอย่างรวดเร็ว บรรจุในกล่องมิดชิดไม่ระบุชื่อสินค้าบนหน้ากล่องพัสดุเพื่อความเป็นส่วนตัวของลูกค้า',
          shopName: 'HealthCare Official Store',
          variants: ['แบบหยด (ตลับ)', 'แบบปัสสาวะผ่าน (ปากกา)', 'แบบจุ่ม (แถบตรวจ)'],
          isHot: true,
          isMall: true
        },
        {
          id: 'prod-2',
          title: '🔥 พร้อมส่งจากไทย 🔥 พัดลมแบตเตอรี่ไร้สาย 8 นิ้ว พัดลมพกพาปรับความเร็วลมได้พับเก็บได้',
          price: 372,
          originalPrice: 1000,
          discount: '-63%',
          salesText: 'ขายแล้ว 10พัน+',
          image: 'https://images.unsplash.com/photo-1618944847023-38aa001235f0?w=500&auto=format&fit=crop&q=80',
          deliveryTime: '< 2 วัน',
          location: 'จังหวัดกรุงเทพมหานคร',
          isLive: true,
          rating: 4.8,
          reviewsCount: 9800,
          description: 'พัดลมตั้งโต๊ะและพกพา ขนาด 8 นิ้ว แบตเตอรี่ในตัวชาร์จ USB ไร้สาย ปรับแรงลมได้ 3 ระดับ มอเตอร์ทำงานเงียบ ทนทาน เหมาะสำหรับใช้ทำงาน ไปแคมป์ปิ้ง หรือตั้งในห้องนอน',
          shopName: 'SuperCool Gadgets',
          variants: ['สีขาวคลาสสิก', 'สีชมพูพาสเทล', 'สีดำมินิมอล'],
          isHot: true,
          isMall: false
        },
        {
          id: 'prod-3',
          title: 'FreshTime X ChupaChups สเปรย์ปรับอากาศ กลิ่นหอมหวานยอดนิยม 320ml',
          price: 68,
          originalPrice: 179,
          discount: '-62%',
          salesText: 'ขายแล้ว 3.4พัน',
          image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80',
          deliveryTime: 'พรุ่งนี้',
          location: 'จังหวัดสมุทรปราการ',
          isLive: false,
          rating: 4.7,
          reviewsCount: 3120,
          description: 'สเปรย์ปรับอากาศ ชูปาชุปส์ กลิ่นหอมหวานน่ากิน ช่วยกลบกลิ่นอับชื้น สร้างบรรยากาศหอมสดชื่นไปทั่วห้อง มอบกลิ่นสตรอว์เบอร์รี่ แอดออนดีไซน์สวยสดใส',
          shopName: 'FreshTime Home Store',
          variants: ['กลิ่นสตรอว์เบอร์รี่ ครีม', 'กลิ่นองุ่น ซากุระ', 'กลิ่นแคนดี้ บลอนด์'],
          isHot: false,
          isMall: false
        }
      ];
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2), 'utf-8');
      productsCache = defaultProducts;
      return productsCache;
    }
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    let parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      parsed = parsed.filter(p => p && typeof p === 'object' && typeof p.id === 'string');
    } else {
      parsed = [];
    }
    productsCache = parsed;
    return productsCache;
  } catch (err) {
    console.error('Error loading products:', err);
    productsCache = [];
    return productsCache;
  }
}

function saveProducts(products: any[]): boolean {
  try {
    const cleanProducts = (products || []).filter(p => p && typeof p === 'object' && typeof p.id === 'string');
    productsCache = cleanProducts;
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(cleanProducts, null, 2), 'utf-8');
    if (firebaseDb && isFirebaseReady) {
      (async () => {
        for (const prod of cleanProducts) {
          if (prod && prod.id) {
            const cleanProd = JSON.parse(JSON.stringify(prod));
            await firebaseDb.collection('products').doc(prod.id).set(cleanProd);
          }
        }
        const snapshot = await firebaseDb.collection('products').get();
        const currentIds = new Set(cleanProducts.map(p => p.id));
        for (const docSnap of snapshot.docs) {
          if (!currentIds.has(docSnap.id)) {
            await firebaseDb.collection('products').doc(docSnap.id).delete();
          }
        }
      })().catch(err => console.error('[Firebase] Save products error:', err));
    }
    return true;
  } catch (err) {
    console.error('Error saving products:', err);
    return false;
  }
}

// Helpers for Activity Products
function loadActivityProducts(): any[] {
  if (activityProductsCache !== null) {
    return activityProductsCache;
  }
  try {
    if (!fs.existsSync(ACTIVITY_PRODUCTS_FILE)) {
      const defaultActivityProducts = [
        {
          id: 'act-prod-1',
          title: '[สินค้ากิจกรรม] เครื่องชงกาแฟเอสเพรสโซ่ แรงดันสูง 15 บาร์ สำหรับโฮมคาเฟ่',
          price: 2490,
          originalPrice: 5990,
          discount: '-58%',
          salesText: 'ขายแล้ว 2.1พัน',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
          deliveryTime: '< 3 วัน',
          location: 'จังหวัดกรุงเทพมหานคร',
          isLive: false,
          rating: 4.9,
          reviewsCount: 840,
          description: 'เครื่องชงกาแฟกิจกรรมสำหรับพาร์ตเนอร์ แรงดันสูงสุด 15 บาร์ ชงเอสเพรสโซ่รสชาติเข้มข้น หอมกรุ่น คาปูชิโน่ครีมฟองหนานุ่ม ดื่มด่ำรสชาติกาแฟสดแท้ๆ ทุกเช้า',
          shopName: 'Activity Special Store',
          variants: ['รุ่น Standard Black', 'รุ่น Premium Silver'],
          isHot: true,
          isMall: true
        },
        {
          id: 'act-prod-2',
          title: '[สินค้ากิจกรรม] เครื่องฟอกอากาศอัจฉริยะครอบคลุม 45 ตร.ม. พร้อมระบบ HEPA H13',
          price: 1890,
          originalPrice: 4200,
          discount: '-55%',
          salesText: 'ขายแล้ว 1.5พัน',
          image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&auto=format&fit=crop&q=80',
          deliveryTime: 'พรุ่งนี้',
          location: 'จังหวัดนนทบุรี',
          isLive: true,
          rating: 4.8,
          reviewsCount: 1100,
          description: 'เครื่องฟอกอากาศกรองฝุ่นละเอียด PM2.5, เชื้อแบคทีเรีย, กลิ่นควันบุหรี่ และสารก่อภูมิแพ้อย่างมีประสิทธิภาพ คืนความสดชื่นบริสุทธิ์ให้กับห้องของคุณใน 10 นาที',
          shopName: 'Activity Premium Mall',
          variants: ['รุ่น AirPro X1', 'รุ่น AirPro X2 + รีโมต'],
          isHot: true,
          isMall: false
        }
      ];
      fs.writeFileSync(ACTIVITY_PRODUCTS_FILE, JSON.stringify(defaultActivityProducts, null, 2), 'utf-8');
      activityProductsCache = defaultActivityProducts;
      return activityProductsCache;
    }
    const data = fs.readFileSync(ACTIVITY_PRODUCTS_FILE, 'utf-8');
    let parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      parsed = parsed.filter(ap => ap && typeof ap === 'object' && typeof ap.id === 'string');
    } else {
      parsed = [];
    }
    activityProductsCache = parsed;
    return activityProductsCache;
  } catch (err) {
    console.error('Error loading activity products:', err);
    activityProductsCache = [];
    return activityProductsCache;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function saveActivityProducts(products: any[]): boolean {
  try {
    const cleanProducts = (products || []).filter(ap => ap && typeof ap === 'object' && typeof ap.id === 'string');
    activityProductsCache = cleanProducts;
    fs.writeFileSync(ACTIVITY_PRODUCTS_FILE, JSON.stringify(cleanProducts, null, 2), 'utf-8');
    if (firebaseDb && isFirebaseReady) {
      (async () => {
        for (const prod of cleanProducts) {
          if (prod && prod.id) {
            const cleanProd = JSON.parse(JSON.stringify(prod));
            await firebaseDb.collection('activity_products').doc(prod.id).set(cleanProd);
          }
        }
        const snapshot = await firebaseDb.collection('activity_products').get();
        const currentIds = new Set(cleanProducts.map(p => p.id));
        for (const docSnap of snapshot.docs) {
          if (!currentIds.has(docSnap.id)) {
            await firebaseDb.collection('activity_products').doc(docSnap.id).delete();
          }
        }
      })().catch(err => console.error('[Firebase] Save activity products error:', err));
    }
    return true;
  } catch (err) {
    console.error('Error saving activity products:', err);
    return false;
  }
}

// Helpers for Match Requests
function loadMatchRequests(): MatchRequest[] {
  if (matchRequestsCache !== null) {
    return matchRequestsCache;
  }
  try {
    if (!fs.existsSync(MATCH_REQUESTS_FILE)) {
      fs.writeFileSync(MATCH_REQUESTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      matchRequestsCache = [];
      return matchRequestsCache;
    }
    const data = fs.readFileSync(MATCH_REQUESTS_FILE, 'utf-8');
    let parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      parsed = parsed.filter(mr => mr && typeof mr === 'object' && typeof mr.phone === 'string');
    } else {
      parsed = [];
    }
    matchRequestsCache = parsed;
    return matchRequestsCache;
  } catch (err) {
    console.error('Error loading match requests:', err);
    matchRequestsCache = [];
    return matchRequestsCache;
  }
}

function saveMatchRequests(requests: MatchRequest[]): boolean {
  try {
    const cleanRequests = (requests || []).filter(r => r && typeof r === 'object' && typeof r.phone === 'string');
    matchRequestsCache = cleanRequests;
    fs.writeFileSync(MATCH_REQUESTS_FILE, JSON.stringify(cleanRequests, null, 2), 'utf-8');
    if (firebaseDb && isFirebaseReady) {
      (async () => {
        for (const req of cleanRequests) {
          if (req && req.phone) {
            const cleanReq = JSON.parse(JSON.stringify(req));
            await firebaseDb.collection('match_requests').doc(req.phone).set(cleanReq);
          }
        }
        const snapshot = await firebaseDb.collection('match_requests').get();
        const currentPhones = new Set(cleanRequests.map(r => r.phone));
        for (const docSnap of snapshot.docs) {
          if (!currentPhones.has(docSnap.id)) {
            await firebaseDb.collection('match_requests').doc(docSnap.id).delete();
          }
        }
      })().catch(err => console.error('[Firebase] Save match requests error:', err));
    }
    return true;
  } catch (err) {
    console.error('Error saving match requests:', err);
    return false;
  }
}

// Ensure files are initialized on startup
loadProducts();
loadActivityProducts();
loadMatchRequests();

// --- UPLOADS DIRECTORY & ENDPOINT ---
const UPLOADS_DIR = path.join(storageDir, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// File upload endpoint (Base64)
app.post('/api/upload', (req, res) => {
  try {
    const { file, fileName } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'ไม่มีข้อมูลไฟล์สำหรับอัปโหลดค่ะ' });
    }

    let base64Data = file;
    if (file.includes(';base64,')) {
      base64Data = file.split(';base64,')[1];
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const ext = fileName ? path.extname(fileName) : '.png';
    const uniqueName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;
    return res.json({ url: fileUrl });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' + err.message });
  }
});

// --- BACKEND API ROUTES ---

// Settings Endpoints
app.get('/api/settings', async (req, res) => {
  settingsCache = loadSettings();
  if (firebaseDb && isFirebaseReady && (!settingsCache || settingsCache.siteName === 'Shopee')) {
    try {
      const doc = await firebaseDb.collection('shopee_settings').doc('global').get();
      if (doc.exists) {
        settingsCache = doc.data() as SystemSettings;
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[Firebase] Direct settings fetch failed:', err);
    }
  }
  res.json(settingsCache);
});

app.post('/api/settings', (req, res) => {
  const {
    actorPhone,
    siteName, siteLogo, siteIcon, themeColor, slides, lineUrl, whatsappUrl, facebookUrl, tiktokUrl,
    shopeefoodLogo, shopeefoodUrl, shopeefoodLabel, shopeefoodSubLabel,
    freeshippingLogo, freeshippingUrl, freeshippingLabel, freeshippingSubLabel,
    paydayLogo, paydayUrl, paydayLabel, paydaySubLabel,
    instantLogo, instantUrl, instantLabel, instantSubLabel,
    flashdealLogo, flashdealUrl, flashdealLabel, flashdealSubLabel
  } = req.body;

  if (!actorPhone) {
    return res.status(400).json({ error: 'ไม่พบข้อมูลผู้ดำเนินการ (actorPhone) กรุณาเข้าสู่ระบบแอดมินก่อนค่ะ' });
  }

  usersCache = loadUsers();
  const actor = usersCache.find(u => u.phone === actorPhone);
  if (!actor || actor.role !== 'admin') {
    return res.status(403).json({ error: 'เฉพาะบัญชีแอดมินหรือผู้ดูแลระบบระดับสูงเท่านั้นที่มีสิทธิ์แก้ไขข้อมูลการตั้งค่าระบบและปุ่มบริการค่ะ' });
  }

  settingsCache = {
    siteName: siteName || settingsCache.siteName,
    siteLogo: siteLogo !== undefined ? siteLogo : settingsCache.siteLogo,
    siteIcon: siteIcon !== undefined ? siteIcon : settingsCache.siteIcon,
    themeColor: themeColor || settingsCache.themeColor,
    slides: slides || settingsCache.slides,
    lineUrl: lineUrl !== undefined ? lineUrl : settingsCache.lineUrl,
    whatsappUrl: whatsappUrl !== undefined ? whatsappUrl : settingsCache.whatsappUrl,
    facebookUrl: facebookUrl !== undefined ? facebookUrl : settingsCache.facebookUrl,
    tiktokUrl: tiktokUrl !== undefined ? tiktokUrl : settingsCache.tiktokUrl,
    
    shopeefoodLogo: shopeefoodLogo !== undefined ? shopeefoodLogo : settingsCache.shopeefoodLogo,
    shopeefoodUrl: shopeefoodUrl !== undefined ? shopeefoodUrl : settingsCache.shopeefoodUrl,
    shopeefoodLabel: shopeefoodLabel !== undefined ? shopeefoodLabel : settingsCache.shopeefoodLabel,
    shopeefoodSubLabel: shopeefoodSubLabel !== undefined ? shopeefoodSubLabel : settingsCache.shopeefoodSubLabel,

    freeshippingLogo: freeshippingLogo !== undefined ? freeshippingLogo : settingsCache.freeshippingLogo,
    freeshippingUrl: freeshippingUrl !== undefined ? freeshippingUrl : settingsCache.freeshippingUrl,
    freeshippingLabel: freeshippingLabel !== undefined ? freeshippingLabel : settingsCache.freeshippingLabel,
    freeshippingSubLabel: freeshippingSubLabel !== undefined ? freeshippingSubLabel : settingsCache.freeshippingSubLabel,

    paydayLogo: paydayLogo !== undefined ? paydayLogo : settingsCache.paydayLogo,
    paydayUrl: paydayUrl !== undefined ? paydayUrl : settingsCache.paydayUrl,
    paydayLabel: paydayLabel !== undefined ? paydayLabel : settingsCache.paydayLabel,
    paydaySubLabel: paydaySubLabel !== undefined ? paydaySubLabel : settingsCache.paydaySubLabel,

    instantLogo: instantLogo !== undefined ? instantLogo : settingsCache.instantLogo,
    instantUrl: instantUrl !== undefined ? instantUrl : settingsCache.instantUrl,
    instantLabel: instantLabel !== undefined ? instantLabel : settingsCache.instantLabel,
    instantSubLabel: instantSubLabel !== undefined ? instantSubLabel : settingsCache.instantSubLabel,

    flashdealLogo: flashdealLogo !== undefined ? flashdealLogo : settingsCache.flashdealLogo,
    flashdealUrl: flashdealUrl !== undefined ? flashdealUrl : settingsCache.flashdealUrl,
    flashdealLabel: flashdealLabel !== undefined ? flashdealLabel : settingsCache.flashdealLabel,
    flashdealSubLabel: flashdealSubLabel !== undefined ? flashdealSubLabel : settingsCache.flashdealSubLabel
  };
  const success = saveSettings(settingsCache);
  if (!success) {
    return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลการตั้งค่าระบบได้' });
  }
  res.json({ message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้วค่ะ', settings: settingsCache });
});

// --- HOME PRODUCTS ENDPOINTS ---
app.get('/api/products', async (req, res) => {
  let products = loadProducts();
  if (firebaseDb && isFirebaseReady && (!products || products.length === 0)) {
    try {
      const snapshot = await firebaseDb.collection('products').get();
      if (!snapshot.empty) {
        const fbProds: any[] = [];
        snapshot.forEach((doc: any) => {
          fbProds.push(doc.data());
        });
        products = fbProds;
        productsCache = fbProds;
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(fbProds, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[Firebase] Direct products fetch failed:', err);
    }
  }
  // Return reversed to ensure newly added products appear at the top permanently in a stable order
  res.json([...products].reverse());
});

app.post('/api/admin/products/create', (req, res) => {
  const { title, price, originalPrice, discount, salesText, image, images, productLink, deliveryTime, location, isMall, isLive, description, shopName, variants, isHot } = req.body;
  if (!title || price === undefined || !image) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อสินค้า ราคาสินค้า และรูปภาพสินค้าค่ะ' });
  }
  const products = loadProducts();
  const newProduct = {
    id: 'prod-' + Date.now(),
    title,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    discount: discount || '',
    salesText: salesText || 'ขายแล้ว 0 ชิ้น',
    image,
    images: images || [],
    productLink: productLink || '',
    deliveryTime: deliveryTime || 'พรุ่งนี้',
    location: location || 'จังหวัดกรุงเทพมหานคร',
    isMall: !!isMall,
    isLive: !!isLive,
    rating: 5.0,
    reviewsCount: 0,
    description: description || '',
    shopName: shopName || 'Shopee Official Shop',
    variants: variants || ['ตัวเลือกมาตรฐาน'],
    isHot: !!isHot
  };
  products.push(newProduct);
  saveProducts(products);
  res.json({ message: 'เพิ่มสินค้าในหน้าแรกเรียบร้อยแล้วค่ะ', product: newProduct });
});

app.post('/api/admin/products/update', (req, res) => {
  const { id, title, price, originalPrice, discount, salesText, image, images, productLink, deliveryTime, location, isMall, isLive, description, shopName, variants, isHot } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ไม่พบ ID สินค้าที่จะอัปเดต' });
  }
  const products = loadProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'ไม่พบสินค้าในระบบ' });
  }
  products[idx] = {
    ...products[idx],
    title: title !== undefined ? title : products[idx].title,
    price: price !== undefined ? Number(price) : products[idx].price,
    originalPrice: originalPrice !== undefined ? Number(originalPrice) : products[idx].originalPrice,
    discount: discount !== undefined ? discount : products[idx].discount,
    salesText: salesText !== undefined ? salesText : products[idx].salesText,
    image: image !== undefined ? image : products[idx].image,
    images: images !== undefined ? images : products[idx].images,
    productLink: productLink !== undefined ? productLink : products[idx].productLink,
    deliveryTime: deliveryTime !== undefined ? deliveryTime : products[idx].deliveryTime,
    location: location !== undefined ? location : products[idx].location,
    isMall: isMall !== undefined ? !!isMall : products[idx].isMall,
    isLive: isLive !== undefined ? !!isLive : products[idx].isLive,
    description: description !== undefined ? description : products[idx].description,
    shopName: shopName !== undefined ? shopName : products[idx].shopName,
    variants: variants !== undefined ? variants : products[idx].variants,
    isHot: isHot !== undefined ? !!isHot : products[idx].isHot
  };
  saveProducts(products);
  res.json({ message: 'อัปเดตสินค้าเรียบร้อยแล้วค่ะ', product: products[idx] });
});

app.post('/api/admin/products/delete', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ไม่ระบุ ID สินค้าที่จะลบ' });
  }
  let products = loadProducts();
  const filtered = products.filter(p => p.id !== id);
  if (products.length === filtered.length) {
    return res.status(404).json({ error: 'ไม่พบสินค้าดังกล่าว' });
  }
  saveProducts(filtered);
  res.json({ message: 'ลบสินค้าเรียบร้อยแล้วค่ะ' });
});


// --- ACTIVITY PRODUCTS ENDPOINTS ---
app.get('/api/activity-products', async (req, res) => {
  let products = loadActivityProducts();
  if (firebaseDb && isFirebaseReady && (!products || products.length === 0)) {
    try {
      const snapshot = await firebaseDb.collection('activity_products').get();
      if (!snapshot.empty) {
        const fbProds: any[] = [];
        snapshot.forEach((doc: any) => {
          fbProds.push(doc.data());
        });
        products = fbProds;
        activityProductsCache = fbProds;
        fs.writeFileSync(ACTIVITY_PRODUCTS_FILE, JSON.stringify(fbProds, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[Firebase] Direct activity products fetch failed:', err);
    }
  }
  // Return reversed to ensure newly added products appear at the top permanently in stable order
  res.json([...products].reverse());
});

app.post('/api/admin/activity-products/create', (req, res) => {
  const { title, price, originalPrice, discount, salesText, image, images, productLink, deliveryTime, location, isMall, isLive, description, shopName, variants, isHot } = req.body;
  if (!title || price === undefined || !image) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อสินค้า ราคาสินค้า และรูปภาพสินค้าค่ะ' });
  }
  const products = loadActivityProducts();
  const newProduct = {
    id: 'act-prod-' + Date.now(),
    title,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    discount: discount || '',
    salesText: salesText || 'ขายแล้ว 0 ชิ้น',
    image,
    images: images || [],
    productLink: productLink || '',
    deliveryTime: deliveryTime || 'พรุ่งนี้',
    location: location || 'จังหวัดกรุงเทพมหานคร',
    isMall: !!isMall,
    isLive: !!isLive,
    rating: 5.0,
    reviewsCount: 0,
    description: description || '',
    shopName: shopName || 'Shopee Official Shop',
    variants: variants || ['ตัวเลือกมาตรฐาน'],
    isHot: !!isHot
  };
  products.push(newProduct);
  saveActivityProducts(products);
  res.json({ message: 'เพิ่มสินค้ากิจกรรมเรียบร้อยแล้วค่ะ', product: newProduct });
});

app.post('/api/admin/activity-products/update', (req, res) => {
  const { id, title, price, originalPrice, discount, salesText, image, images, productLink, deliveryTime, location, isMall, isLive, description, shopName, variants, isHot } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ไม่พบ ID สินค้ากิจกรรมที่จะอัปเดต' });
  }
  const products = loadActivityProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'ไม่พบสินค้ากิจกรรมในระบบ' });
  }
  products[idx] = {
    ...products[idx],
    title: title !== undefined ? title : products[idx].title,
    price: price !== undefined ? Number(price) : products[idx].price,
    originalPrice: originalPrice !== undefined ? Number(originalPrice) : products[idx].originalPrice,
    discount: discount !== undefined ? discount : products[idx].discount,
    salesText: salesText !== undefined ? salesText : products[idx].salesText,
    image: image !== undefined ? image : products[idx].image,
    images: images !== undefined ? images : products[idx].images,
    productLink: productLink !== undefined ? productLink : products[idx].productLink,
    deliveryTime: deliveryTime !== undefined ? deliveryTime : products[idx].deliveryTime,
    location: location !== undefined ? location : products[idx].location,
    isMall: isMall !== undefined ? !!isMall : products[idx].isMall,
    isLive: isLive !== undefined ? !!isLive : products[idx].isLive,
    description: description !== undefined ? description : products[idx].description,
    shopName: shopName !== undefined ? shopName : products[idx].shopName,
    variants: variants !== undefined ? variants : products[idx].variants,
    isHot: isHot !== undefined ? !!isHot : products[idx].isHot
  };
  saveActivityProducts(products);
  res.json({ message: 'อัปเดตสินค้ากิจกรรมเรียบร้อยแล้วค่ะ', product: products[idx] });
});

app.post('/api/admin/activity-products/delete', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ไม่ระบุ ID สินค้ากิจกรรมที่จะลบ' });
  }
  let products = loadActivityProducts();
  const filtered = products.filter(p => p.id !== id);
  if (products.length === filtered.length) {
    return res.status(404).json({ error: 'ไม่พบสินค้ากิจกรรมดังกล่าว' });
  }
  saveActivityProducts(filtered);
  res.json({ message: 'ลบสินค้ากิจกรรมเรียบร้อยแล้วค่ะ' });
});


// --- MATCHING ENDPOINTS ---
app.post('/api/order/match-request', (req, res) => {
  const { username, phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'ไม่พบเบอร์โทรศัพท์ผู้ใช้' });
  }
  const requests = loadMatchRequests();
  const idx = requests.findIndex(r => r.phone === phone);
  const newRequest = {
    phone,
    username: username || 'ผู้ใช้ทั่วไป',
    status: 'pending' as const,
    assignedProduct: null,
    timestamp: Date.now()
  };
  if (idx !== -1) {
    requests[idx] = newRequest;
  } else {
    requests.push(newRequest);
  }
  saveMatchRequests(requests);
  res.json({ status: 'ok', request: newRequest });
});

app.get('/api/admin/match-requests', (req, res) => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let requests = loadMatchRequests();
  // Clean up older requests
  const filtered = requests.filter(r => r.timestamp > oneHourAgo);
  if (filtered.length !== requests.length) {
    saveMatchRequests(filtered);
  }
  res.json(filtered);
});

app.post('/api/admin/match-assign', (req, res) => {
  const { phone, productId } = req.body;
  if (!phone || !productId) {
    return res.status(400).json({ error: 'กรุณาระบุเบอร์โทรลูกค้าและไอดีสินค้ากิจกรรมค่ะ' });
  }
  const requests = loadMatchRequests();
  const reqIdx = requests.findIndex(r => r.phone === phone);
  if (reqIdx === -1) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลการทำรายการเริ่มของลูกค้ารายนี้ค่ะ หรือคำขอหมดอายุแล้ว' });
  }
  const activityProducts = loadActivityProducts();
  const product = activityProducts.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'ไม่พบสินค้ากิจกรรมนี้ในระบบหลังบ้านค่ะ' });
  }
  requests[reqIdx].status = 'assigned';
  requests[reqIdx].assignedProduct = product;
  saveMatchRequests(requests);
  res.json({ message: 'ให้ออเดอร์ลูกค้าเรียบร้อยแล้วค่ะ', request: requests[reqIdx] });
});

app.get('/api/order/check-match', (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: 'กรุณาระบุเบอร์โทรศัพท์' });
  }
  const requests = loadMatchRequests();
  const match = requests.find(r => r.phone === phone);
  if (!match) {
    return res.json({ status: 'none', assignedProduct: null });
  }
  res.json({ status: match.status, assignedProduct: match.assignedProduct });
});

app.post('/api/order/match-complete', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'ไม่ระบุเบอร์โทร' });
  }
  let requests = loadMatchRequests();
  requests = requests.filter(r => r.phone !== phone);
  saveMatchRequests(requests);
  res.json({ status: 'ok' });
});


// Profile sync endpoint
app.get('/api/users/profile', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: 'กรุณาระบุเบอร์โทรศัพท์' });
  }
  usersCache = loadUsers();
  let user = usersCache.find(u => u.phone === phone);
  if (!user && firebaseDb && isFirebaseReady) {
    try {
      const doc = await firebaseDb.collection('users').doc(phone as string).get();
      if (doc.exists) {
        user = doc.data() as UserAccount;
        if (!usersCache.some(u => u.phone === phone)) {
          usersCache.push(user);
          fs.writeFileSync(DB_FILE, JSON.stringify(usersCache, null, 2), 'utf-8');
        }
      }
    } catch (err) {
      console.error('[Firebase] Direct profile fetch failed:', err);
    }
  }
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบบัญชีผู้ใช้งาน' });
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ ...safeUser, rawPassword: passwordHash });
});

// 1. User Login Route
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน' });
  }

  // Refresh cache
  usersCache = loadUsers();
  let user = usersCache.find(u => u.phone === phone);

  if (!user && firebaseDb && isFirebaseReady) {
    try {
      const doc = await firebaseDb.collection('users').doc(phone).get();
      if (doc.exists) {
        user = doc.data() as UserAccount;
        if (!usersCache.some(u => u.phone === phone)) {
          usersCache.push(user);
          fs.writeFileSync(DB_FILE, JSON.stringify(usersCache, null, 2), 'utf-8');
        }
      }
    } catch (err) {
      console.error('[Firebase] Direct login fetch failed:', err);
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบหลังบ้านค่ะ' });
  }

  if (user.passwordHash !== password) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'บัญชีคุณถูกแบน โปรดติดต่อฝ่ายบริการลูกค้า' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ error: 'บัญชีคุณถูกอายัด โปรดติดต่อฝ่ายบริการลูกค้า' });
  }

  // Return user details without sensitive hashes if desired, but we can return full safe info
  const { passwordHash, ...safeUser } = user;
  res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: { ...safeUser, rawPassword: passwordHash } });
});

// 2. User Registration Route (With country detection from invitation code)
app.post('/api/auth/register', (req, res) => {
  const { username, phone, bankName, realName, bankAccount, password, invitationCode } = req.body;

  if (!username || !phone || !password || !invitationCode) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลส่วนตัวและรหัสเชิญให้ครบทุกช่องค่ะ' });
  }

  if (phone.length !== 10 || !/^\d+$/.test(phone)) {
    return res.status(400).json({ error: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้นค่ะ' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษรค่ะ' });
  }

  if (invitationCode.trim().length < 4) {
    return res.status(400).json({ error: 'รหัสเชิญไม่ถูกต้อง (รหัสเชิญต้องมีความยาวอย่างน้อย 4 ตัวขึ้นไปค่ะ เช่น th3585 หรือ lo4385)' });
  }

  // Determine country from invitation code
  const codeTrimmed = invitationCode.trim();
  let detectedCountry: 'Thailand' | 'Laos' = 'Thailand';
  if (codeTrimmed === 'lo4385') {
    detectedCountry = 'Laos';
  } else if (codeTrimmed === 'th3585') {
    detectedCountry = 'Thailand';
  }

  // Refresh cache and check duplicates
  usersCache = loadUsers();
  const duplicate = usersCache.some(u => u.phone === phone);
  if (duplicate) {
    return res.status(409).json({ error: 'เบอร์โทรศัพท์นี้ถูกใช้ลงทะเบียนไปแล้วค่ะ' });
  }

  const newUser: UserAccount = {
    username,
    phone,
    bankName: bankName || '',
    realName: realName || '',
    bankAccount: bankAccount || '',
    passwordHash: password,
    transactionPassword: '999999',
    role: 'customer', // Front-end registration is always client role
    balance: 0.00, // Start balance
    commission: 0.00, // Initial commissions
    frozen: 0.00,
    ordersCompleted: 0,
    level: -1, // Level Member
    isBlocked: false,
    isBanned: false,
    createdAt: new Date().toISOString(),
    invitationCode: codeTrimmed,
    accountCategory: 'customer',
    country: detectedCountry,
    latestDepositAmount: 0
  };

  // Reset/clear transactions and match requests for newly registered phone
  let txs = loadTransactions();
  const matchedTxs = txs.filter(t => t.phone === phone);
  if (matchedTxs.length > 0) {
    txs = txs.filter(t => t.phone !== phone);
    saveTransactions(txs);
    if (firebaseDb && isFirebaseReady) {
      matchedTxs.forEach(tx => {
        firebaseDb.collection('transactions').doc(tx.id).delete().catch((err: any) => {
          console.error('[Firebase] Error deleting old tx from Firestore during registration:', err);
        });
      });
    }
  }

  let matches = loadMatchRequests();
  const matchedReqs = matches.filter(m => m.phone === phone);
  if (matchedReqs.length > 0) {
    matches = matches.filter(m => m.phone !== phone);
    saveMatchRequests(matches);
    if (firebaseDb && isFirebaseReady) {
      firebaseDb.collection('match_requests').doc(phone).delete().catch((err: any) => {
        console.error('[Firebase] Error deleting old match request from Firestore during registration:', err);
      });
    }
  }

  usersCache.push(newUser);
  const success = saveUsers(usersCache);

  if (!success) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกบัญชีของท่านในเซิร์ฟเวอร์หลังบ้าน' });
  }

  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json({ message: 'สมัครสมาชิกสำเร็จเรียบร้อยแล้วค่ะ!', user: { ...safeUser, rawPassword: passwordHash } });
});

// 3. Sync User Stats and Balances
app.post('/api/users/sync-balance', (req, res) => {
  const { phone, balance, commission, ordersCompleted, frozen } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'ข้อมูลเบอร์โทรศัพท์ไม่ถูกต้อง' });
  }

  usersCache = loadUsers();
  const userIdx = usersCache.findIndex(u => u.phone === phone);

  if (userIdx === -1) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
  }

  // Sync balances safely
  if (typeof balance === 'number') usersCache[userIdx].balance = balance;
  if (typeof commission === 'number') usersCache[userIdx].commission = commission;
  if (typeof ordersCompleted === 'number') usersCache[userIdx].ordersCompleted = ordersCompleted;
  if (typeof frozen === 'number') usersCache[userIdx].frozen = frozen;

  const success = saveUsers(usersCache);
  if (!success) {
    return res.status(500).json({ error: 'ไม่สามารถซิงโครไนซ์ข้อมูลยอดคงเหลือกับเซิร์ฟเวอร์หลังบ้านได้' });
  }

  const { passwordHash, ...safeUser } = usersCache[userIdx];
  res.json({ message: 'ซิงค์ข้อมูลกับระบบหลักเรียบร้อย', user: { ...safeUser, rawPassword: passwordHash } });
});

// Update Bank Details (Only allowed if not set yet)
app.post('/api/user/update-bank', (req, res) => {
  const { phone, bankName, realName, bankAccount } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'ไม่พบเบอร์โทรศัพท์ผู้ใช้' });
  }

  if (!bankName || !realName || !bankAccount) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลธนาคาร ชื่อจริง และหมายเลขบัญชีให้ครบถ้วนค่ะ' });
  }

  usersCache = loadUsers();
  const userIdx = usersCache.findIndex(u => u.phone === phone);

  if (userIdx === -1) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
  }

  // Check if they already have a bank account saved to prevent editing!
  if (usersCache[userIdx].bankAccount && usersCache[userIdx].bankAccount.trim() !== '') {
    return res.status(403).json({ error: 'บัญชีธนาคารได้ถูกบันทึกไปแล้ว ไม่สามารถแก้ไขได้ค่ะ' });
  }

  // Update fields
  usersCache[userIdx].bankName = bankName;
  usersCache[userIdx].realName = realName;
  usersCache[userIdx].bankAccount = bankAccount;

  const success = saveUsers(usersCache);
  if (!success) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลธนาคารหลังบ้าน' });
  }

  const { passwordHash, ...safeUser } = usersCache[userIdx];
  res.json({ message: 'บันทึกข้อมูลบัญชีธนาคารเรียบร้อยแล้วค่ะ', user: { ...safeUser, rawPassword: passwordHash } });
});

// --- TRANSACTION ENDPOINTS ---

// Fetch transactions (filtered by phone, type, search)
app.get('/api/transactions', (req, res) => {
  const { phone, type, search } = req.query;
  let txs = loadTransactions();

  if (phone) {
    txs = txs.filter(t => t.phone === phone);
  }

  if (type) {
    txs = txs.filter(t => t.type === type);
  }

  if (search) {
    const q = String(search).toLowerCase();
    txs = txs.filter(t => 
      t.phone.includes(q) || 
      t.username.toLowerCase().includes(q) ||
      (t.note && t.note.toLowerCase().includes(q))
    );
  }

  // Sort by date descending
  txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(txs);
});

// Create deposit (direct or request)
app.post('/api/transactions/deposit', (req, res) => {
  const { phone, amount, note, isAdmin } = req.body;
  const numAmount = parseFloat(amount);

  if (!phone || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'ข้อมูลเบอร์โทรศัพท์หรือยอดเงินไม่ถูกต้อง' });
  }

  usersCache = loadUsers();
  const user = usersCache.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบบัญชีผู้ใช้งานที่ระบุ' });
  }

  const txs = loadTransactions();
  const newTx: Transaction = {
    id: 'TXD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
    phone,
    username: user.username,
    type: 'deposit',
    amount: numAmount,
    status: isAdmin ? 'approved' : 'pending',
    note: note || '',
    createdAt: new Date().toISOString()
  };

  if (isAdmin) {
    user.balance = parseFloat((user.balance + numAmount).toFixed(2));
    user.latestDepositAmount = numAmount;
    user.level = getLevelByLatestDeposit(numAmount);
    saveUsers(usersCache);
  }

  txs.push(newTx);
  saveTransactions(txs);

  const { passwordHash, ...safeUser } = user;
  res.json({
    message: isAdmin ? 'เติมเงินเข้าบัญชีสำเร็จเรียบร้อยแล้วค่ะ' : 'ส่งคำขอเติมเงินเรียบร้อยแล้วค่ะ กรุณารอแอดมินตรวจสอบ',
    user: { ...safeUser, rawPassword: passwordHash },
    transaction: newTx
  });
});

// Create withdrawal (direct or request)
app.post('/api/transactions/withdraw', (req, res) => {
  const { phone, amount, note, isAdmin } = req.body;
  const numAmount = parseFloat(amount);

  if (!phone || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'ข้อมูลเบอร์โทรศัพท์หรือยอดเงินไม่ถูกต้อง' });
  }

  usersCache = loadUsers();
  const user = usersCache.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบบัญชีผู้ใช้งานที่ระบุ' });
  }

  // Check balance
  if (user.balance < numAmount) {
    return res.status(400).json({ error: 'ยอดคงเหลือในบัญชีไม่เพียงพอสำหรับหักหรือถอนเงิน' });
  }

  const txs = loadTransactions();
  const newTx: Transaction = {
    id: 'TXW-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
    phone,
    username: user.username,
    type: 'withdrawal',
    amount: numAmount,
    status: isAdmin ? 'approved' : 'pending',
    note: note || '',
    createdAt: new Date().toISOString()
  };

  // Only deduct balance immediately if it is directly executed by admin (isAdmin is true)
  if (isAdmin) {
    user.balance = parseFloat((user.balance - numAmount).toFixed(2));
  }
  saveUsers(usersCache);

  txs.push(newTx);
  saveTransactions(txs);

  const { passwordHash, ...safeUser } = user;
  res.json({
    message: isAdmin ? 'หัก/ถอนเงินออกจากบัญชีสำเร็จเรียบร้อยแล้วค่ะ' : 'ส่งคำขอถอนเงินเรียบร้อยแล้วค่ะ กรุณารอแอดมินดำเนินการตรวจสอบ',
    user: { ...safeUser, rawPassword: passwordHash },
    transaction: newTx
  });
});

// Admin Approve / Reject pending transaction
app.post('/api/transactions/action', (req, res) => {
  const { id, action, note } = req.body;

  if (!id || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
  }

  const txs = loadTransactions();
  const tx = txs.find(t => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: 'ไม่พบรายการธุรกรรมที่ระบุ' });
  }

  if (tx.status !== 'pending') {
    return res.status(400).json({ error: 'รายการนี้ได้รับการดำเนินการไปแล้ว ไม่สามารถแก้ไขได้' });
  }

  usersCache = loadUsers();
  const user = usersCache.find(u => u.phone === tx.phone);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบบัญชีผู้ใช้งานของรายการธุรกรรมนี้' });
  }

  if (action === 'approve') {
    tx.status = 'approved';
    if (note) tx.note = note;

    // For deposit: credit balance when approved
    if (tx.type === 'deposit') {
      user.balance = parseFloat((user.balance + tx.amount).toFixed(2));
      user.latestDepositAmount = tx.amount;
      user.level = getLevelByLatestDeposit(tx.amount);
    } else if (tx.type === 'withdrawal') {
      // For withdrawal: check if user has enough balance upon approval
      if (user.balance < tx.amount) {
        return res.status(400).json({ error: 'ไม่สามารถอนุมัติได้ เนื่องจากยอดคงเหลือในบัญชีของผู้ใช้งานไม่เพียงพอ' });
      }
      user.balance = parseFloat((user.balance - tx.amount).toFixed(2));
    }
  } else if (action === 'reject') {
    tx.status = 'rejected';
    if (note) tx.note = note;
  }

  saveTransactions(txs);
  saveUsers(usersCache);

  res.json({ message: 'ดำเนินการธุรกรรมเรียบร้อยแล้วค่ะ', transaction: tx });
});

// --- ADMIN USER & PROFILE ENDPOINTS ---

// Fetch all users list for admin dashboard
app.get('/api/admin/users', (req, res) => {
  usersCache = loadUsers();
  const safeUsers = usersCache.map(user => {
    const { passwordHash, ...rest } = user;
    return { ...rest, rawPassword: passwordHash };
  });
  res.json(safeUsers);
});

// Create member direct from admin panel
app.post('/api/admin/users/create', (req, res) => {
  const { username, phone, password, country, accountCategory } = req.body;
  
  if (!username || !phone || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลส่วนตัวสำหรับสมาชิกใหม่ให้ครบถ้วนค่ะ' });
  }
  
  if (phone.length !== 10 || !/^\d+$/.test(phone)) {
    return res.status(400).json({ error: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้นค่ะ' });
  }
  
  usersCache = loadUsers();
  const duplicate = usersCache.some(u => u.phone === phone);
  if (duplicate) {
    return res.status(409).json({ error: 'เบอร์โทรศัพท์นี้ถูกใช้ลงทะเบียนไปแล้วค่ะ' });
  }

  const newUser: UserAccount = {
    username,
    phone,
    bankName: '',
    realName: '',
    bankAccount: '',
    passwordHash: password,
    transactionPassword: '999999',
    role: 'customer',
    balance: 0.00,
    commission: 0.00,
    frozen: 0.00,
    ordersCompleted: 0,
    level: -1,
    isBlocked: false,
    isBanned: false,
    createdAt: new Date().toISOString(),
    invitationCode: country === 'Laos' ? 'lo4385' : 'th3585',
    accountCategory: accountCategory || 'customer',
    country: country || 'Thailand',
    latestDepositAmount: 0
  };

  usersCache.push(newUser);
  const success = saveUsers(usersCache);
  if (!success) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกบัญชีหลังบ้าน' });
  }

  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json({ message: 'สร้างสมาชิกใหม่สำเร็จเรียบร้อยแล้วค่ะ', user: { ...safeUser, rawPassword: passwordHash } });
});

// Update member information (balances, status, settings)
app.post('/api/admin/users/update', (req, res) => {
  const {
    phone,
    balance,
    commission,
    frozen,
    level,
    isBlocked,
    isBanned,
    role,
    username,
    realName,
    bankName,
    bankAccount,
    rawPassword,
    transactionPassword,
    accountCategory,
    country,
    latestDepositAmount
  } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'ไม่ระบุเบอร์โทรศัพท์เป้าหมายเพื่อแก้ไขค่ะ' });
  }

  usersCache = loadUsers();
  const userIdx = usersCache.findIndex(u => u.phone === phone);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' });
  }

  // Update properties if provided in request
  if (typeof balance === 'number') usersCache[userIdx].balance = balance;
  if (typeof commission === 'number') usersCache[userIdx].commission = commission;
  if (typeof frozen === 'number') usersCache[userIdx].frozen = frozen;
  if (typeof level === 'number') usersCache[userIdx].level = level;
  if (typeof isBlocked === 'boolean') usersCache[userIdx].isBlocked = isBlocked;
  if (typeof isBanned === 'boolean') usersCache[userIdx].isBanned = isBanned;
  if (role) usersCache[userIdx].role = role;
  if (username) usersCache[userIdx].username = username;
  if (realName !== undefined) usersCache[userIdx].realName = realName;
  if (bankName !== undefined) usersCache[userIdx].bankName = bankName;
  if (bankAccount !== undefined) usersCache[userIdx].bankAccount = bankAccount;
  if (rawPassword !== undefined) usersCache[userIdx].passwordHash = rawPassword;
  if (transactionPassword) usersCache[userIdx].transactionPassword = transactionPassword;
  if (accountCategory) usersCache[userIdx].accountCategory = accountCategory;
  if (country) usersCache[userIdx].country = country;
  if (typeof latestDepositAmount === 'number') usersCache[userIdx].latestDepositAmount = latestDepositAmount;

  const success = saveUsers(usersCache);
  if (!success) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสมาชิกหลังบ้าน' });
  }

  const { passwordHash, ...safeUser } = usersCache[userIdx];
  res.json({ message: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้วค่ะ', user: { ...safeUser, rawPassword: passwordHash } });
});

// Update or create admins (maps to super-admin actions)
app.post('/api/admin/admins/update', (req, res) => {
  const { actorPhone, action, targetPhone, newPhone, newPassword, newUsername } = req.body;
  if (!actorPhone || !action) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }
  usersCache = loadUsers();
  const actor = usersCache.find(u => u.phone === actorPhone);
  if (!actor || actor.role !== 'admin' || actor.phone !== '0888888888') {
    return res.status(403).json({ error: 'เฉพาะแอดมินหลักที่เบอร์ 0888888888 เท่านั้นที่สามารถจัดการแอดมินระดับสูงสุดในระบบได้ค่ะ' });
  }

  if (action === 'create') {
    if (!newPhone || !newPassword) {
      return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรและรหัสผ่านสำหรับแอดมินใหม่ค่ะ' });
    }
    const duplicate = usersCache.some(u => u.phone === newPhone);
    if (duplicate) {
      return res.status(400).json({ error: 'เบอร์โทรศัพท์แอดมินรายนี้ซ้ำกับข้อมูลที่มีในระบบแล้วค่ะ' });
    }
    const newAdmin: UserAccount = {
      username: newUsername || 'แอดมินระดับสูง',
      phone: newPhone,
      bankName: 'ธนาคารกสิกรไทย',
      realName: 'แอดมินระดับสูง',
      bankAccount: '1234567890',
      passwordHash: newPassword,
      transactionPassword: '999999',
      role: 'admin',
      balance: 0,
      commission: 0,
      frozen: 0,
      ordersCompleted: 0,
      level: 7,
      isBlocked: false,
      isBanned: false,
      createdAt: new Date().toISOString(),
      accountCategory: 'customer',
      country: 'Thailand'
    };
    usersCache.push(newAdmin);
    saveUsers(usersCache);
    return res.json({ message: 'เพิ่มบัญชีแอดมินระดับสูงสุดเรียบร้อยค่ะ', admin: newAdmin });
  }

  if (action === 'edit') {
    if (!targetPhone) {
      return res.status(400).json({ error: 'ไม่ระบุเบอร์โทรเป้าหมายที่จะแก้ไข' });
    }
    const targetIdx = usersCache.findIndex(u => u.phone === targetPhone);
    if (targetIdx === -1) {
      return res.status(404).json({ error: 'ไม่พบแอดมินที่ระบุในระบบ' });
    }

    if (newPhone) {
      const duplicate = usersCache.some(u => u.phone === newPhone && u.phone !== targetPhone);
      if (duplicate) {
        return res.status(400).json({ error: 'เบอร์โทรใหม่นี้ถูกใช้งานเป็นบัญชีอื่นไปแล้วค่ะ' });
      }
      usersCache[targetIdx].phone = newPhone;
    }
    if (newPassword) {
      usersCache[targetIdx].passwordHash = newPassword;
    }
    if (newUsername) {
      usersCache[targetIdx].username = newUsername;
    }
    saveUsers(usersCache);
    return res.json({ message: 'อัปเดตข้อมูลบัญชีสำเร็จเรียบร้อยค่ะ', admin: usersCache[targetIdx] });
  }

  return res.status(400).json({ error: 'การกระทำไม่ถูกต้อง' });
});

app.post('/api/admin/super-admin-action', (req, res) => {
  const { actorPhone, action, targetPhone, newPhone, newPassword, newUsername } = req.body;
  if (!actorPhone || !action) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }
  usersCache = loadUsers();
  const actor = usersCache.find(u => u.phone === actorPhone);
  if (!actor || actor.role !== 'admin' || actor.phone !== '0888888888') {
    return res.status(403).json({ error: 'เฉพาะแอดมินหลักที่เบอร์ 0888888888 เท่านั้นที่สามารถจัดการแอดมินระดับสูงสุดในระบบได้ค่ะ' });
  }

  if (action === 'create') {
    if (!newPhone || !newPassword) {
      return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรและรหัสผ่านสำหรับแอดมินใหม่ค่ะ' });
    }
    const duplicate = usersCache.some(u => u.phone === newPhone);
    if (duplicate) {
      return res.status(400).json({ error: 'เบอร์โทรศัพท์แอดมินรายนี้ซ้ำกับข้อมูลที่มีในระบบแล้วค่ะ' });
    }
    const newAdmin: UserAccount = {
      username: newUsername || 'แอดมินระดับสูง',
      phone: newPhone,
      bankName: 'ธนาคารกสิกรไทย',
      realName: 'แอดมินระดับสูง',
      bankAccount: '1234567890',
      passwordHash: newPassword,
      transactionPassword: '999999',
      role: 'admin',
      balance: 0,
      commission: 0,
      frozen: 0,
      ordersCompleted: 0,
      level: 7,
      isBlocked: false,
      isBanned: false,
      createdAt: new Date().toISOString(),
      accountCategory: 'customer',
      country: 'Thailand'
    };
    usersCache.push(newAdmin);
    saveUsers(usersCache);
    return res.json({ message: 'เพิ่มบัญชีแอดมินระดับสูงสุดเรียบร้อยค่ะ', admin: newAdmin });
  }

  if (action === 'edit') {
    if (!targetPhone) {
      return res.status(400).json({ error: 'ไม่ระบุเบอร์โทรเป้าหมายที่จะแก้ไข' });
    }
    const targetIdx = usersCache.findIndex(u => u.phone === targetPhone);
    if (targetIdx === -1) {
      return res.status(404).json({ error: 'ไม่พบแอดมินที่ระบุในระบบ' });
    }

    if (newPhone) {
      const duplicate = usersCache.some(u => u.phone === newPhone && u.phone !== targetPhone);
      if (duplicate) {
        return res.status(400).json({ error: 'เบอร์โทรใหม่นี้ถูกใช้งานเป็นบัญชีอื่นไปแล้วค่ะ' });
      }
      usersCache[targetIdx].phone = newPhone;
    }
    if (newPassword) {
      usersCache[targetIdx].passwordHash = newPassword;
    }
    if (newUsername) {
      usersCache[targetIdx].username = newUsername;
    }
    saveUsers(usersCache);
    return res.json({ message: 'อัปเดตข้อมูลบัญชีสำเร็จเรียบร้อยค่ะ', admin: usersCache[targetIdx] });
  }

  return res.status(400).json({ error: 'การกระทำไม่ถูกต้อง' });
});


// --- CLOUD FIRESTORE STARTUP SYNCHRONIZATION ---
function withTimeout(promise: Promise<any>, timeoutMs: number, name: string): Promise<any> {
  let timer: any;
  const timeoutPromise = new Promise<any>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[Timeout] ${name} took longer than ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

async function syncFromFirestoreOnStartup() {
  if (!firebaseDb) {
    console.log('[Firebase] Skipping startup sync (Firebase not initialized).');
    return;
  }
  
  console.log('[Firebase] Verifying database connectivity & permissions...');
  try {
    // Attempt a quick, low-cost check on the settings collection
    await withTimeout(
      firebaseDb.collection('shopee_settings').doc('global').get(),
      4000,
      'Firestore connection check'
    );
    isFirebaseReady = true;
    console.log('[Firebase] Connection and permissions test successful.');
  } catch (testErr: any) {
    console.log('[Firebase] Named database connection check failed. Falling back.');
    if (firebaseConfig && firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      console.log('[Firebase] Attempting automatic fallback to the (default) database...');
      try {
        const fallbackDb = getFirestore(firebaseAppInstance);
        await withTimeout(
          fallbackDb.collection('shopee_settings').doc('global').get(),
          4000,
          'Firestore fallback connection check'
        );
        firebaseDb = fallbackDb;
        isFirebaseReady = true;
        console.log('[Firebase] Fallback to (default) database successful!');
      } catch (fallbackErr: any) {
        console.log('[Firebase] Fallback to (default) database also failed. Falling back entirely to local storage.');
        firebaseDb = null;
        isFirebaseReady = false;
        return;
      }
    } else {
      console.log('[Firebase] Falling back entirely to local JSON database storage.');
      firebaseDb = null;
      isFirebaseReady = false;
      return;
    }
  }

  console.log('[Firebase] Starting database synchronization from Cloud Firestore in parallel...');
  try {
    const tasks = [
      // 1. Settings
      (async () => {
        try {
          const settingsDoc = await withTimeout(
            firebaseDb.collection('shopee_settings').doc('global').get(),
            15000,
            'Firestore settings get'
          );
          if (settingsDoc.exists) {
            const fbSettings = settingsDoc.data() as SystemSettings;
            settingsCache = fbSettings;
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(fbSettings, null, 2), 'utf-8');
            console.log('[Firebase] Loaded global settings from Firestore.');
          } else {
            const cleanSettings = JSON.parse(JSON.stringify(settingsCache || DEFAULT_SETTINGS));
            await withTimeout(
              firebaseDb.collection('shopee_settings').doc('global').set(cleanSettings),
              15000,
              'Firestore settings set'
            );
            console.log('[Firebase] Migrated default settings to Firestore.');
          }
        } catch (err) {
          console.error('[Firebase] Settings synchronization task failed:', err);
        }
      })(),

      // 2. Users
      (async () => {
        try {
          const usersSnapshot = await withTimeout(
            firebaseDb.collection('users').get(),
            15000,
            'Firestore users get'
          );
          if (!usersSnapshot.empty) {
            const fbUsers: UserAccount[] = [];
            usersSnapshot.forEach((docSnap: any) => {
              fbUsers.push(docSnap.data() as UserAccount);
            });
            // Ensure DEFAULT_ADMIN is in fbUsers
            const hasAdmin = fbUsers.some(u => u.phone === DEFAULT_ADMIN.phone);
            if (!hasAdmin) {
              fbUsers.push(DEFAULT_ADMIN);
              await firebaseDb.collection('users').doc(DEFAULT_ADMIN.phone).set(DEFAULT_ADMIN);
            }
            usersCache = fbUsers;
            fs.writeFileSync(DB_FILE, JSON.stringify(fbUsers, null, 2), 'utf-8');
            console.log(`[Firebase] Loaded ${fbUsers.length} users from Firestore.`);
          } else {
            const currentUsers = usersCache || [DEFAULT_ADMIN];
            const writePromises = currentUsers.map(u => {
              const cleanUser = JSON.parse(JSON.stringify(u));
              return withTimeout(
                firebaseDb.collection('users').doc(u.phone).set(cleanUser),
                15000,
                `Firestore user set (${u.phone})`
              );
            });
            await Promise.all(writePromises);
            console.log(`[Firebase] Migrated ${currentUsers.length} users to Firestore.`);
          }
        } catch (err) {
          console.error('[Firebase] Users synchronization task failed:', err);
        }
      })(),

      // 3. Transactions
      (async () => {
        try {
          const txsSnapshot = await withTimeout(
            firebaseDb.collection('transactions').get(),
            15000,
            'Firestore transactions get'
          );
          if (!txsSnapshot.empty) {
            const fbTxs: Transaction[] = [];
            txsSnapshot.forEach((docSnap: any) => {
              fbTxs.push(docSnap.data() as Transaction);
            });
            transactionsCache = fbTxs;
            fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(fbTxs, null, 2), 'utf-8');
            console.log(`[Firebase] Loaded ${fbTxs.length} transactions from Firestore.`);
          } else {
            const localTxs = transactionsCache || [];
            const writePromises = localTxs.map(tx => {
              const cleanTx = JSON.parse(JSON.stringify(tx));
              return withTimeout(
                firebaseDb.collection('transactions').doc(tx.id).set(cleanTx),
                15000,
                `Firestore transaction set (${tx.id})`
              );
            });
            await Promise.all(writePromises);
            console.log(`[Firebase] Migrated ${localTxs.length} transactions to Firestore.`);
          }
        } catch (err) {
          console.error('[Firebase] Transactions synchronization task failed:', err);
        }
      })(),

      // 4. Products
      (async () => {
        try {
          const prodSnapshot = await withTimeout(
            firebaseDb.collection('products').get(),
            15000,
            'Firestore products get'
          );
          if (!prodSnapshot.empty) {
            const fbProds: any[] = [];
            prodSnapshot.forEach((docSnap: any) => {
              fbProds.push(docSnap.data());
            });
            productsCache = fbProds;
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(fbProds, null, 2), 'utf-8');
            console.log(`[Firebase] Loaded ${fbProds.length} products from Firestore.`);
          } else {
            const localProds = productsCache || [];
            const writePromises = localProds.map(p => {
              const cleanProd = JSON.parse(JSON.stringify(p));
              return withTimeout(
                firebaseDb.collection('products').doc(p.id).set(cleanProd),
                15000,
                `Firestore product set (${p.id})`
              );
            });
            await Promise.all(writePromises);
            console.log(`[Firebase] Migrated ${localProds.length} products to Firestore.`);
          }
        } catch (err) {
          console.error('[Firebase] Products synchronization task failed:', err);
        }
      })(),

      // 5. Activity Products
      (async () => {
        try {
          const actSnapshot = await withTimeout(
            firebaseDb.collection('activity_products').get(),
            15000,
            'Firestore activity_products get'
          );
          if (!actSnapshot.empty) {
            const fbActProds: any[] = [];
            actSnapshot.forEach((docSnap: any) => {
              fbActProds.push(docSnap.data());
            });
            activityProductsCache = fbActProds;
            fs.writeFileSync(ACTIVITY_PRODUCTS_FILE, JSON.stringify(fbActProds, null, 2), 'utf-8');
            console.log(`[Firebase] Loaded ${fbActProds.length} activity products from Firestore.`);
          } else {
            const localActProds = activityProductsCache || [];
            const writePromises = localActProds.map(ap => {
              const cleanAp = JSON.parse(JSON.stringify(ap));
              return withTimeout(
                firebaseDb.collection('activity_products').doc(ap.id).set(cleanAp),
                15000,
                `Firestore activity_product set (${ap.id})`
              );
            });
            await Promise.all(writePromises);
            console.log(`[Firebase] Migrated ${localActProds.length} activity products to Firestore.`);
          }
        } catch (err) {
          console.error('[Firebase] Activity products synchronization task failed:', err);
        }
      })(),

      // 6. Match Requests
      (async () => {
        try {
          const matchSnapshot = await withTimeout(
            firebaseDb.collection('match_requests').get(),
            15000,
            'Firestore match_requests get'
          );
          if (!matchSnapshot.empty) {
            const fbMatchReqs: MatchRequest[] = [];
            matchSnapshot.forEach((docSnap: any) => {
              fbMatchReqs.push(docSnap.data() as MatchRequest);
            });
            matchRequestsCache = fbMatchReqs;
            fs.writeFileSync(MATCH_REQUESTS_FILE, JSON.stringify(fbMatchReqs, null, 2), 'utf-8');
            console.log(`[Firebase] Loaded ${fbMatchReqs.length} match requests from Firestore.`);
          } else {
            const localMatchReqs = matchRequestsCache || [];
            const writePromises = localMatchReqs.map(mr => {
              const cleanMr = JSON.parse(JSON.stringify(mr));
              return withTimeout(
                firebaseDb.collection('match_requests').doc(mr.phone).set(cleanMr),
                15000,
                `Firestore match_request set (${mr.phone})`
              );
            });
            await Promise.all(writePromises);
            console.log(`[Firebase] Migrated ${localMatchReqs.length} match requests to Firestore.`);
          }
        } catch (err) {
          console.error('[Firebase] Match requests synchronization task failed:', err);
        }
      })()
    ];

    await Promise.all(tasks);
    console.log('[Firebase] Parallel Firestore synchronization completed successfully!');
  } catch (err) {
    console.error('[Firebase] Error synchronizing Firestore database on startup:', err);
  }
}

// Ensure files are initialized on startup into memory caches
loadUsers();
loadSettings();
loadTransactions();
loadProducts();
loadActivityProducts();
loadMatchRequests();

// --- INTEGRATE VITE FOR DEV OR STATIC FOR PROD ---
async function startServer() {
  // Run synchronization in the background so it doesn't block server startup, port 3000 binding, or routing
  syncFromFirestoreOnStartup().catch(err => {
    console.error('[Firebase] Background startup sync failed:', err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Server] running on http://0.0.0.0:${PORT}`);
  });
}

if (isVercel) {
  syncFromFirestoreOnStartup().catch(err => {
    console.error('[Firebase] Background Vercel startup sync failed:', err);
  });
}

if (!isVercel) {
  startServer();
}

export default app;
