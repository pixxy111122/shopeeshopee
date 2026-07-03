/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string; // e.g., "-63%"
  salesText: string; // e.g., "ขายแล้ว 10พัน+"
  image: string;
  images?: string[]; // Multiple images
  productLink?: string; // Direct link to open when clicked
  deliveryTime: string; // e.g., "พรุ่งนี้" or "< 2 วัน"
  location: string; // e.g., "จังหวัดกรุงเทพมหานคร"
  isMall?: boolean;
  isLive?: boolean;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  shopName?: string;
  variants?: string[];
  isHot?: boolean;
}

export interface Coupon {
  id: string;
  discountText: string;
  minSpendText: string;
  expiryText: string;
  type: 'mall' | 'ktc' | 'krungsri' | 'general';
  isCollected: boolean;
  brandName?: string;
  brandLogo?: string;
}

export interface OrderDetails {
  orderId: string;
  status: 'to_pay' | 'to_ship' | 'to_receive' | 'to_rate' | 'completed';
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  variant?: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  statusText?: string;
  message: string;
  time: string;
  image?: string;
  type: 'order' | 'promotion' | 'live' | 'finance' | 'shopee';
  read: boolean;
  order?: OrderDetails;
}

export interface CartItem {
  id: string; // combines productId + variant
  product: Product;
  quantity: number;
  selectedVariant?: string;
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'shop';
  text: string;
  time: string;
}

export interface ChatSession {
  id: string;
  shopName: string;
  shopLogo: string;
  lastMessage: string;
  messages: ChatMessage[];
  unread: boolean;
  onlineStatus: string;
}

export interface LiveStream {
  id: string;
  title: string;
  shopName: string;
  shopLogo: string;
  viewsText: string;
  videoUrl?: string;
  products: Product[];
  likesCount: number;
  comments: { user: string; text: string }[];
}
