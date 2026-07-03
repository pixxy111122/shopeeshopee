/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LiveStream, Product } from '../types';
import { mockLiveStreams } from '../mockData';
import { Play, Heart, MessageSquare, ShoppingBag, X, Send, Eye, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveTabProps {
  onProductClick: (product: Product) => void;
  onAddProductToCart: (product: Product, quantity: number, variant?: string) => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  color: string;
}

export default function LiveTab({ onProductClick, onAddProductToCart }: LiveTabProps) {
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<{ user: string; text: string }[]>([]);
  const [myComment, setMyComment] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [showLiveProducts, setShowLiveProducts] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-generate viewer comments in active stream
  useEffect(() => {
    if (!activeStream) return;

    setLikes(activeStream.likesCount);
    setComments([...activeStream.comments]);

    const mockUserNames = [
      'Somchai_InTrend', 'Wipa_Beauty', 'NongPloy_Review', 'Super_Shopper99',
      'Alek_Studio', 'Mali_Pink', 'Thana_Vip', 'Pichai_Store'
    ];
    const mockUserComments = [
      'มีของแถมไหมครับแอดมิน?',
      'ส่งฟรีไหมคะรอบนี้?',
      'พัดลมสีขาวสวยจัง อยากได้เลย',
      'กดสั่งไปแล้วค่ะ ปังมาก',
      'ของแท้ไหมครับ มีรับประกันไหม',
      'สีผม Kota สวยจริงค่ะ ย้อมเองง่ายมาก',
      'แชร์ไลฟ์แล้วนะคะ ขอแจกคอยน์หน่อยค่ะ',
      'ลดราคาถึงกี่โมงคะ?'
    ];

    const commentInterval = setInterval(() => {
      const randomUser = mockUserNames[Math.floor(Math.random() * mockUserNames.length)];
      const randomCommentText = mockUserComments[Math.floor(Math.random() * mockUserComments.length)];
      
      setComments((prev) => [...prev, { user: randomUser, text: randomCommentText }]);
      
      // Auto-increment likes slightly
      setLikes((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 3500);

    return () => clearInterval(commentInterval);
  }, [activeStream]);

  // Scroll comment list to bottom when comments update
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myComment.trim()) return;
    setComments((prev) => [...prev, { user: 'คุณ (Me)', text: myComment }]);
    setMyComment('');
  };

  const handleLike = () => {
    setLikes((prev) => prev + 1);
    // Add floating heart
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: Math.random() * 40 - 20, // offset
      color: ['#ef4444', '#ec4899', '#f43f5e', '#f472b6', '#fb7185'][Math.floor(Math.random() * 5)]
    };
    setFloatingHearts((prev) => [...prev, newHeart]);

    // Clean up heart after animation
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  return (
    <div id="live-tab-container" className="flex flex-col bg-slate-900 min-h-full pb-20 select-none text-white">
      {/* Tab Header */}
      {!activeStream && (
        <div id="live-header" className="sticky top-0 bg-slate-900 px-4 py-3 border-b border-slate-800 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <h2 className="text-sm font-bold tracking-wider uppercase">Shopee Live & Video</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">กำลังถ่ายทอดสด</span>
        </div>
      )}

      {/* Main Container Content */}
      <div id="live-content" className="flex-1">
        {activeStream ? (
          /* ACTIVE STREAM OVERLAY MODAL */
          <div id="active-stream-viewport" className="relative h-[85vh] bg-slate-950 flex flex-col justify-between overflow-hidden">
            {/* Stream Background Video Simulation (Animated CSS gradients with particles) */}
            <div id="video-sim-bg" className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-purple-900 to-slate-950 opacity-90 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              
              {/* Spinning product mockup in center as screen overlay to make it look like broadcast */}
              <div className="flex flex-col items-center justify-center text-center p-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 rounded-full border-4 border-dashed border-pink-500/40 p-1 mb-3"
                >
                  <img
                    src={activeStream.products[0].image}
                    alt="Active stream product"
                    className="w-full h-full object-cover rounded-full shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse mb-1">
                  กำลังพรีเซนต์สินค้า
                </span>
                <p className="text-xs font-bold truncate max-w-[200px] text-pink-300">
                  {activeStream.products[0].title}
                </p>
                <p className="text-sm font-black text-white mt-1">
                  ดีลไลฟ์สด ฿{activeStream.products[0].price}
                </p>
              </div>
            </div>

            {/* Top Toolbar overlay (User profile, Close Button) */}
            <div id="stream-top-bar" className="relative z-10 p-3 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-2">
                <img
                  src={activeStream.shopLogo}
                  alt={activeStream.shopName}
                  className="w-9 h-9 rounded-full border border-pink-500 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold truncate max-w-[120px]">{activeStream.shopName}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-pink-200">
                    <span className="bg-red-600 text-white font-extrabold px-1 rounded-sm text-[8px]">LIVE</span>
                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {activeStream.viewsText}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="close-stream-btn"
                onClick={() => {
                  setActiveStream(null);
                  setShowLiveProducts(false);
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                aria-label="Close Stream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Comment Ticker (Scrolling Chat) */}
            <div id="stream-comments-feed" className="relative z-10 flex-1 flex flex-col justify-end px-3 pb-4 overflow-y-auto max-h-[35vh]">
              <div className="space-y-1.5 overflow-y-auto max-h-[100%] scrollbar-none pb-2">
                {comments.slice(-15).map((comment, index) => (
                  <div
                    key={index}
                    className="bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs max-w-[85%] w-fit border border-white/5"
                  >
                    <span className="font-extrabold text-pink-300 mr-1.5">{comment.user}:</span>
                    <span className="text-white/95 leading-relaxed">{comment.text}</span>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            </div>

            {/* Floating Hearts Animation layer */}
            <div className="absolute right-6 bottom-20 z-10 pointer-events-none">
              <AnimatePresence>
                {floatingHearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.8 }}
                    animate={{ opacity: 0, y: -180, x: heart.x + (Math.sin(heart.id) * 20), scale: 1.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="absolute"
                    style={{ color: heart.color }}
                  >
                    <Heart className="w-6 h-6 fill-current" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Controls toolbar (Products link, Comment Input, Hearts Button) */}
            <div id="stream-bottom-controls" className="relative z-10 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between gap-2.5">
              {/* Shopping Bag trigger */}
              <div className="relative">
                <button
                  id="stream-bag-btn"
                  onClick={() => setShowLiveProducts(!showLiveProducts)}
                  className="w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center shadow-lg text-white transition-colors animate-bounce"
                  aria-label="Products"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                  {activeStream.products.length}
                </span>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleSendComment} className="flex-1 flex items-center bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/15">
                <input
                  type="text"
                  placeholder="พูดคุยในไลฟ์..."
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  className="flex-1 bg-transparent text-white text-xs placeholder-white/65 focus:outline-none"
                />
                <button type="submit" className="text-pink-400 hover:text-pink-300 ml-1.5">
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Heart Likes Trigger button */}
              <div className="flex flex-col items-center">
                <button
                  id="stream-like-btn"
                  onClick={handleLike}
                  className="w-11 h-11 rounded-full bg-pink-600 hover:bg-pink-700 active:scale-90 flex items-center justify-center shadow-lg transition-transform"
                  aria-label="Like Live"
                >
                  <Heart className="w-5 h-5 fill-white text-white" />
                </button>
                <span className="text-[9px] font-semibold mt-1 text-pink-200">
                  {likes.toLocaleString()}
                </span>
              </div>
            </div>

            {/* LIVE PRODUCTS POPUP EXPANSION PANEL */}
            <AnimatePresence>
              {showLiveProducts && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="absolute bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 z-20 text-slate-800"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-orange-500" />
                      ถุงช้อปปิ้งในไลฟ์สด
                    </h3>
                    <button
                      onClick={() => setShowLiveProducts(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ปิด
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[30vh]">
                    {activeStream.products.map((product, idx) => (
                      <div
                        key={`live-prod-${product.id}-${idx}`}
                        className="flex bg-slate-800 rounded-xl overflow-hidden border border-slate-700 p-2 gap-3"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{product.shopName}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-red-400 font-extrabold text-sm">฿{product.price}</span>
                            <button
                              onClick={() => {
                                onProductClick(product);
                                setShowLiveProducts(false);
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-1 rounded-full shadow"
                            >
                              ซื้อเลย
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* LIVE FEED MAIN STREAMS LIST */
          <div id="streams-feed-list" className="p-4 space-y-4">
            <div className="bg-gradient-to-r from-red-600/20 to-orange-500/20 rounded-xl p-3 border border-red-500/10 text-center">
              <p className="text-xs text-orange-400 font-bold">🎉 ยินดีต้อนรับสู่ Shopee Live</p>
              <p className="text-[10px] text-slate-400 mt-1">คลิกรับชมแอดมินไลฟ์ แชทพิมพ์ถามข้อสงสัย และกดหัวใจแจกของรางวัลสดๆ เลย!</p>
            </div>

            <div id="streams-grid" className="grid grid-cols-1 gap-3">
              {mockLiveStreams.map((stream, idx) => (
                <div
                  key={`stream-${stream.id}-${idx}`}
                  onClick={() => setActiveStream(stream)}
                  className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 cursor-pointer hover:border-pink-500/40 transition-colors relative"
                >
                  {/* Stream cover & Title overlay */}
                  <div className="relative aspect-video">
                    <img
                      src={stream.products[0].image}
                      alt={stream.title}
                      className="w-full h-full object-cover opacity-75"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    
                    {/* Tags overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        LIVE
                      </span>
                      <span className="bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Users className="w-2.5 h-2.5 text-pink-400" />
                        {stream.viewsText}
                      </span>
                    </div>

                    {/* Centered Play Hover icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg border-2 border-white/20 animate-pulse">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Seller & title details */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={stream.shopLogo}
                        alt={stream.shopName}
                        className="w-5 h-5 rounded-full border border-pink-500 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] font-bold text-slate-300">{stream.shopName}</span>
                    </div>
                    <h3 className="text-xs font-bold leading-snug line-clamp-2 text-white">
                      {stream.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
