/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Coupon, NotificationItem, ChatSession, LiveStream } from './types';

// Let's define high-quality, realistic images using beautiful Unsplash links that match the screenshots perfectly
export const mockProducts: Product[] = [
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
    isHot: true
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
    isHot: true
  },
  {
    id: 'prod-3',
    title: 'FreshTime X ChupaChups สเปรย์ปรับอากาศ กลิ่นหอมหวานยอดนิยม 320ml',
    price: 68,
    originalPrice: 179,
    discount: '-62%',
    salesText: 'ขายแล้ว 50พัน+',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '< 2 วัน',
    location: 'จังหวัดกรุงเทพมหานคร',
    isLive: false,
    rating: 4.9,
    reviewsCount: 43200,
    description: 'เนรมิตความหอมหวานสดชื่นกระจายทั่วทุกมุมห้องด้วย FreshTime สเปรย์ปรับอากาศสูตรพิเศษกลิ่นลิขสิทธิ์แท้จาก Chupa Chups ให้ความรู้สึกกระปรี้กระเปร่า ปราศจากสารเคมีตกค้างที่เป็นอันตราย',
    shopName: 'FreshTime Official Store',
    variants: ['กลิ่นสตรอว์เบอร์รี่ครีม', 'กลิ่นเมลอนซ่า', 'กลิ่นแอปเปิ้ลเขียว'],
    isHot: false
  },
  {
    id: 'prod-4',
    title: 'ครีมย้อมผม Kota Cosmetics Sepia 200ml ย้อมง่ายสีติดทนนานออร์แกนิคแท้',
    price: 81,
    originalPrice: 125,
    discount: '-36%',
    salesText: 'ขายแล้ว 60พัน+',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '2-4 วัน',
    location: 'จังหวัดตาก',
    isLive: true,
    rating: 4.7,
    reviewsCount: 54100,
    description: 'ครีมเปลี่ยนสีผมออร์แกนิค Kota Cosmetics สี Sepia (น้ำตาลละมุน) สารสกัดจากธรรมชาติ กลิ่นไม่ฉุน หัวไม่ระเบิด เม็ดสีนำเข้าจากเกาหลี บำรุงเส้นผมล้ำลึกขณะย้อม ทำให้ผมนุ่มสลวยเงางาม',
    shopName: 'Kota Thailand Mall',
    variants: ['สี Sepia (น้ำตาลเข้ม)', 'สี Milk Tea (น้ำตาลชานม)', 'สี Burgundy (แดงไวน์)'],
    isHot: false
  },
  {
    id: 'prod-5',
    title: 'ชุดหูฟังบลูทูธไร้สาย Pro-Sound ANC ตัดเสียงรบกวนรอบข้าง แบตอึด 40 ชม.',
    price: 499,
    originalPrice: 1290,
    discount: '-61%',
    salesText: 'ขายแล้ว 5พัน+',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    deliveryTime: 'พรุ่งนี้',
    location: 'จังหวัดสมุทรปราการ',
    isMall: true,
    isLive: false,
    rating: 4.8,
    reviewsCount: 4500,
    description: 'หูฟังครอบหูไร้สายระดับพรีเมียมพร้อมเทคโนโลยี Active Noise Cancelling (ANC) พลังเสียงเบสหนักแน่น รายละเอียดเสียงชัดเจนสไตล์ Audiophile พร้อมกระเป๋าเก็บกันกระแทกฟรี',
    shopName: 'SoundCore Mall',
    variants: ['สีดำพรีเมียม', 'สีครีมหรูหรา'],
    isHot: true
  },
  {
    id: 'prod-6',
    title: 'รองเท้าผ้าใบผู้หญิงเกาหลี สไตล์สตรีทแฟชั่น เดินสบาย ไม่เจ็บเท้า',
    price: 189,
    originalPrice: 399,
    discount: '-52%',
    salesText: 'ขายแล้ว 12พัน+',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '< 2 วัน',
    location: 'จังหวัดกรุงเทพมหานคร',
    isMall: true,
    isLive: true,
    rating: 4.6,
    reviewsCount: 12300,
    description: 'รองเท้าผ้าใบแฟชั่นสไตล์เกาหลี พื้นนุ่มยืดหยุ่นสูง ระบายอากาศได้ยอดเยี่ยม ออกแบบตามหลักสรีรศาสตร์ ช่วยพยุงเท้าให้เดินหรือยืนได้นานโดยไม่เมื่อย เหมาะกับทุกลุค',
    shopName: 'FashionHub Official',
    variants: ['Size 37', 'Size 38', 'Size 39', 'Size 40'],
    isHot: false
  }
];

export const mockCoupons: Coupon[] = [
  {
    id: 'cp-1',
    discountText: 'ส่วนลด 25% ลดสูงสุด ฿300',
    minSpendText: 'ขั้นต่ำ ฿200',
    expiryText: 'เหลือ 3 วัน',
    type: 'mall',
    isCollected: false,
    brandName: 'ร้านโค้ดคุ้ม Xtra'
  },
  {
    id: 'cp-2',
    discountText: 'ส่วนลด ฿300',
    minSpendText: 'ขั้นต่ำ ฿2,000',
    expiryText: 'ใช้ได้ถึง 30-06-2026',
    type: 'ktc',
    isCollected: false,
    brandName: 'KTC Credit Card'
  },
  {
    id: 'cp-3',
    discountText: 'ส่วนลด ฿500',
    minSpendText: 'ขั้นต่ำ ฿3,000',
    expiryText: 'ใช้ได้เฉพาะแอปมือถือเท่านั้น',
    type: 'krungsri',
    isCollected: false,
    brandName: 'Krungsri Card'
  },
  {
    id: 'cp-4',
    discountText: 'ส่งฟรี* ไม่มีขั้นต่ำ สูงสุด ฿40',
    minSpendText: 'ขั้นต่ำ ฿0',
    expiryText: 'เหลืออีก 2 ชั่วโมงเท่านั้น',
    type: 'general',
    isCollected: true, // Already collected to show collected state
    brandName: 'Shopee Free Shipping'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-dep-1',
    title: 'ฝากเงิน (เติมเงิน) สำเร็จ 💳',
    statusText: 'การเงิน',
    message: 'ยอดเงินฝากจำนวน ฿1,000.00 ได้ถูกเติมเข้าสู่กระเป๋าเงิน ShopeePay Wallet ของคุณเรียบร้อยแล้วค่ะ ขอให้เพลิดเพลินกับการสั่งซื้อนะคะ!',
    time: '28-06-2026 10:15',
    type: 'finance',
    read: false
  },
  {
    id: 'notif-with-1',
    title: 'ถอนเงินออกจากระบบสำเร็จ 💰',
    statusText: 'การเงิน',
    message: 'ยอดเงินถอนจำนวน ฿500.00 ได้ถูกโอนเข้าสู่บัญชีธนาคารที่คุณบันทึกไว้ในระบบเรียบร้อยแล้วค่ะ ตรวจสอบได้จากแอปธนาคารของคุณได้ทันที',
    time: '27-06-2026 14:30',
    type: 'finance',
    read: true
  },
  {
    id: 'notif-bonus-1',
    title: 'ได้รับโบนัสพิเศษรายวัน 🎉',
    statusText: 'โบนัส',
    message: 'ยินดีด้วยค่ะ! คุณได้รับโบนัสคอมมิชชั่นพิเศษประจำวันมูลค่า ฿200.00 ป้อนเข้าบัญชีหลักของคุณเรียบร้อยแล้วค่ะ',
    time: '26-06-2026 09:00',
    type: 'finance',
    read: true
  },
  {
    id: 'notif-lvl-1',
    title: 'ยินดีด้วยกับการปรับเลเวลขึ้นสำเร็จ! 🚀',
    statusText: 'ระดับเลเวล',
    message: 'บัญชีของคุณได้รับการปรับเลเวลขึ้นเป็น Level 2 เรียบร้อยแล้วค่ะ ปลดล็อกสิทธิ์จับคู่ออเดอร์คอมมิชชั่นสูงขึ้นทันที!',
    time: '25-06-2026 11:45',
    type: 'finance',
    read: true
  }
];

export const mockChatSessions: ChatSession[] = [
  {
    id: 'chat-1',
    shopName: 'Kota Thailand Mall',
    shopLogo: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'สวัสดีค่ะ ยินดีต้อนรับสู่ร้าน Kota ผลิตภัณฑ์ออร์แกนิคมีพร้อมส่งทุกชิ้นนะคะ สนใจสั่งซื้อสอบถามเพิ่มเติมได้เลยค่ะ ✨',
    unread: true,
    onlineStatus: 'ใช้งานล่าสุดเมื่อ 5 นาทีที่แล้ว',
    messages: [
      { id: 'm1', sender: 'shop', text: 'สวัสดีค่ะคุณลูกค้า ยินดีต้อนรับสู่ร้านค้าทางการนะคะ มีอะไรให้ทางเราช่วยเหลือไหมคะ?', time: '24-06-2026 14:15' },
      { id: 'm2', sender: 'user', text: 'ตัวครีมย้อมผมสี Sepia มีของไหมครับ แล้วผมสั้นต้องใช้กี่กล่องครับ?', time: '24-06-2026 14:20' },
      { id: 'm3', sender: 'shop', text: 'สี Sepia พร้อมส่งเลยค่ะคุณลูกค้า สำหรับผมสั้นชายหรือสไลด์สั้นผู้หญิง ใช้ 1 กล่องก็พอดีเลยค่า ย้อมง่ายไม่ติดแหนังศีรษะแน่นอนค่ะ', time: '24-06-2026 14:22' }
    ]
  },
  {
    id: 'chat-2',
    shopName: 'FreshTime Store',
    shopLogo: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'โค้ดส่วนลด 15% ใช้ได้ถึงคืนนี้นะคะ!',
    unread: true,
    onlineStatus: 'ออฟไลน์เมื่อ 2 ชม. ที่แล้ว',
    messages: [
      { id: 'm4', sender: 'shop', text: 'ขอบคุณที่ให้ความสนใจ FreshTime ค่ะ คุณสามารถเลือกรับโค้ดส่วนลดพิเศษได้ในแชทนี้เลยนะคะ', time: '23-06-2026 10:10' }
    ]
  },
  {
    id: 'chat-3',
    shopName: 'SuperCool Gadgets',
    shopLogo: 'https://images.unsplash.com/photo-1618944847023-38aa001235f0?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'แพ็กของเตรียมส่งเรียบร้อยแล้วครับ ขอบคุณครับ',
    unread: false,
    onlineStatus: 'กำลังออนไลน์',
    messages: [
      { id: 'm5', sender: 'user', text: 'พัดลมส่งวันนี้เลยไหมครับ?', time: '22-06-2026 09:00' },
      { id: 'm6', sender: 'shop', text: 'ใช่ครับคุณลูกค้า ออเดอร์ก่อนเที่ยงจัดส่งรอบบ่ายวันนี้เลยครับ คาดว่าถึงวันพรุ่งนี้ครับผม', time: '22-06-2026 09:05' },
      { id: 'm7', sender: 'shop', text: 'แพ็กของเตรียมส่งเรียบร้อยแล้วครับ ขอบคุณครับ', time: '22-06-2026 11:30' }
    ]
  }
];

export const mockLiveStreams: LiveStream[] = [
  {
    id: 'live-1',
    title: '🔥 PAYDAY คืนคอยน์หนักมาก! เครื่องใช้และแกดเจ็ตพกพา ลด 50% + แจกคอยน์ไม่อั้น 🎁',
    shopName: 'SuperCool Gadgets',
    shopLogo: 'https://images.unsplash.com/photo-1618944847023-38aa001235f0?w=100&auto=format&fit=crop&q=80',
    viewsText: '4.2K คนดู',
    products: [mockProducts[1], mockProducts[4]],
    likesCount: 15400,
    comments: [
      { user: 'Sompong_99', text: 'พัดลมแบตทนไหมครับ แอดมินรีวิวแกะกล่องโชว์หน่อย' },
      { user: 'Karn_Beauty', text: 'หูฟังตัดเสียงดีมากค่ะ ซื้อเมื่อกี๊แล้วกดโค้ดลดเพิ่มไปคุ้มสุดๆ' },
      { user: 'Naree_th', text: 'ขอคูปองส่งฟรีเพิ่มหน่อยค่าาา' },
      { user: 'Chai_outdoor', text: 'จัดสีขาวไปแล้วครับ ส่งกรุงเทพฯ พรุ่งนี้ถึงไหมครับ' }
    ]
  },
  {
    id: 'live-2',
    title: '💄 ไอเทมหอมสดชื่น เปลี่ยนลุคทำผมออร์แกนิค รับหน้าฝน สวยทน คุ้มสุดๆ 🎀',
    shopName: 'Kota Thailand Mall',
    shopLogo: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=100&auto=format&fit=crop&q=80',
    viewsText: '1.8K คนดู',
    products: [mockProducts[3], mockProducts[2]],
    likesCount: 8900,
    comments: [
      { user: 'Katesara_m', text: 'ยาย้อมผมออร์แกนิคดีจริงค่า กลิ่นไม่ฉุน ชอบมากกก' },
      { user: 'Oat_cool', text: 'สเปรย์หอมชูป้าจุ๊สกลิ่นสตรอเบอร์รี่หอมมาก วางในรถโคตรฟิน' },
      { user: 'Ploy_Siri', text: 'แอดมินย้อมสีชานมโชว์หน่อยค่ะ' }
    ]
  }
];
