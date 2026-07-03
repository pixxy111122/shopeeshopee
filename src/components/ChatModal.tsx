/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { X, Send, Circle, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatModalProps {
  sessions: ChatSession[];
  onClose: () => void;
  onSendMessage: (sessionId: string, text: string) => void;
  onMarkRead: (sessionId: string) => void;
  activeSessionId?: string | null;
  onSelectSession: (id: string | null) => void;
}

export default function ChatModal({
  sessions,
  onClose,
  onSendMessage,
  onMarkRead,
  activeSessionId,
  onSelectSession
}: ChatModalProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(activeSessionId || null);
  const [typedMsg, setTypedMsg] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync state if prop changes
  useEffect(() => {
    if (activeSessionId) {
      setSelectedSessionId(activeSessionId);
      onMarkRead(activeSessionId);
    }
  }, [activeSessionId, onMarkRead]);

  // Mark session read when selected
  useEffect(() => {
    if (selectedSessionId) {
      onMarkRead(selectedSessionId);
    }
  }, [selectedSessionId, onMarkRead]);

  // Scroll active chat screen to bottom when messages update
  const activeSession = sessions.find(s => s.id === selectedSessionId);
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMsg.trim() || !selectedSessionId) return;
    
    onSendMessage(selectedSessionId, typedMsg);
    setTypedMsg('');

    // Trigger auto responsive chatbot reply after short delay
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        'chat-1': [
          'ทางร้านได้รับข้อความแล้วค่ะ ครีมเปลี่ยนสีผมออร์แกนิคพร้อมจัดส่งรอบวันนี้เลยนะคะ 📦',
          'สีผม Sepia ยอดนิยมมากค่ะคุณลูกค้า ผมสลวยมีน้ำหนักหลังย้อมแน่นอนค่ะ ✨',
          'ขอบคุณที่เลือกช็อปแบรนด์แท้ Kota นะคะ กดเก็บคูปองลดเพิ่ม 10% ได้เลยค่ะ'
        ],
        'chat-2': [
          'สวัสดีค่ะ สเปรย์ปรับอากาศ Chupa Chups พร้อมส่งกลิ่นหอมหวานทุกชิ้นนะคะ 🍬',
          'สนใจรับเป็นกลิ่นเมลอนซ่า หรือ สตรอเบอร์รี่ครีม ดีคะ แอดมินแนะนำจับคู่เซ็ตลด 20% คุ้มสุดๆ ค่า 🍓',
          'สั่งซื้อสำเร็จรับของภายใน 1-2 วันนี้เลยนะคะคุณลูกค้า'
        ],
        'chat-3': [
          'พัดลมแบตเตอรี่ไร้สาย 8 นิ้ว มีประกันมอเตอร์สินค้า 1 ปีเต็มครับผม ⚡',
          'แพ็กเกจห่อบับเบิ้ลกันกระแทกอย่างหนา จัดส่งเคอรี่ พรุ่งนี้ช่วงบ่ายก็ได้รับสินค้าแล้วครับ 👍',
          'ยินดีดูแลและให้บริการหลังการขายเต็มที่ครับ สอบถามเพิ่มเติมพิมพ์ทิ้งไว้ได้เลยครับ'
        ]
      };

      const fallbackResponses = [
        'ขอบคุณที่ส่งข้อความหาแอดมินค่ะ ยินดีดูแลคุณลูกค้านะคะ 🙏',
        'ทางร้านจะรีบตอบกลับโดยเร็วที่สุด หรือสามารถทำรายการสั่งซื้อผ่านหน้าตะกร้าของแอดมินได้ทันทีเลยค่ะ!'
      ];

      const pool = responses[selectedSessionId] || fallbackResponses;
      const randomReply = pool[Math.floor(Math.random() * pool.length)];

      onSendMessage(selectedSessionId, randomReply);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center select-none">
      {/* Background overlay click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Frame wrapper */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white rounded-t-3xl w-full max-w-md h-[78vh] flex flex-col justify-between overflow-hidden relative z-10 border-t border-slate-200 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {!selectedSessionId ? (
            /* SESSION LISTING VIEW */
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <span className="text-xl">💬</span>
                  <h3 className="font-extrabold text-sm">Shopee Chat ห้องสนทนา</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search contacts bar */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 relative flex items-center">
                <Search className="absolute left-6 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาร้านค้าหรือข้อความในแชท..."
                  className="w-full bg-white text-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none placeholder-slate-400 font-sans"
                />
              </div>

              {/* Chat list items */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      onSelectSession(session.id);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      session.unread ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Avatar with indicator */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={session.shopLogo}
                        alt={session.shopName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      {session.onlineStatus.includes('กำลังออนไลน์') && (
                        <Circle className="w-2.5 h-2.5 fill-teal-500 text-white absolute bottom-0 right-0" />
                      )}
                    </div>

                    {/* Meta info details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-slate-800 truncate pr-2">{session.shopName}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">25-06</span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${session.unread ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                        {session.lastMessage}
                      </p>
                    </div>

                    {/* Unread badge indicator */}
                    {session.unread && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ACTIVE CHAT SCREEN VIEW WITH AUTOREPLY CHATBOT */
            <motion.div
              key="chat-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-slate-50"
            >
              {/* Back & header shop info bar */}
              <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSessionId(null);
                      onSelectSession(null);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <img
                    src={activeSession?.shopLogo}
                    alt={activeSession?.shopName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{activeSession?.shopName}</h4>
                    <span className="text-[9px] text-slate-400 block leading-tight">{activeSession?.onlineStatus}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrolling messages container body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-center">
                  <span className="bg-slate-200/60 text-slate-400 text-[8px] px-2 py-0.5 rounded-full font-mono">
                    ความปลอดภัยมาตรฐาน Shopee สองทางเข้ารหัส
                  </span>
                </div>

                {activeSession?.messages.map((msg) => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-xl text-xs shadow-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="font-sans whitespace-pre-line">{msg.text}</p>
                        <span className={`text-[8px] mt-1 block text-right font-mono ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                          {msg.time.split(' ')[1] || '10:00'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Bottom message form composer */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="พิมพ์คำถามหรือเลือกโค้ดส่วนลด..."
                  value={typedMsg}
                  onChange={(e) => setTypedMsg(e.target.value)}
                  className="flex-1 bg-slate-50 text-slate-800 rounded-full px-4 py-2 text-xs border border-slate-200 focus:outline-none focus:border-orange-400 transition-colors placeholder-slate-400 font-sans"
                />
                <button
                  type="submit"
                  disabled={!typedMsg.trim()}
                  className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-100"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
