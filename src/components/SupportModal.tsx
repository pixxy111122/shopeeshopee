/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Headphones, MessageCircle, Phone, Clock, MessageSquare, Send, Facebook, Tv, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface SupportModalProps {
  onClose: () => void;
  settings?: {
    lineUrl?: string;
    whatsappUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    siteName?: string;
  };
}

export default function SupportModal({ onClose, settings }: SupportModalProps) {
  // Use links from settings or fallback to defaults
  const lineUrl = settings?.lineUrl || 'https://line.me';
  const whatsappUrl = settings?.whatsappUrl || 'https://whatsapp.com';
  const facebookUrl = settings?.facebookUrl || 'https://facebook.com';
  const tiktokUrl = settings?.tiktokUrl || 'https://tiktok.com';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      {/* Background click target */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Main modal card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-white animate-pulse" />
            <span className="font-extrabold text-sm tracking-tight">ศูนย์บริการช่วยเหลือลูกค้า</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 font-sans max-h-[80vh] overflow-y-auto">
          <div className="text-center space-y-1 mb-2">
            <h3 className="text-sm font-black text-slate-800">ติดต่อฝ่ายบริการลูกค้าสัมพันธ์</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              เจ้าหน้าที่สแตนด์บายดูแลคุณ ตลอด 24 ชั่วโมง ไม่มีวันหยุด
            </p>
          </div>

          {/* Button 1: LINE Official */}
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 p-3 rounded-2xl flex items-center justify-between transition-all active:scale-98 text-left cursor-pointer shadow-xs group block"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-black">LINE Official Account</h4>
                <p className="text-[9px] text-emerald-600 font-bold">แชทคุยกับแอดมินผ่าน LINE Official ได้ทันที</p>
              </div>
            </div>
            <span className="text-emerald-500 text-[10px] font-black flex items-center gap-0.5">
              เปิดแอป LINE <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          {/* Button 2: WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 p-3 rounded-2xl flex items-center justify-between transition-all active:scale-98 text-left cursor-pointer shadow-xs group block"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black">WhatsApp Chat Support</h4>
                <p className="text-[9px] text-green-600 font-bold">ติดต่อด่วนผ่านบริการซัพพอร์ต WhatsApp</p>
              </div>
            </div>
            <span className="text-green-500 text-[10px] font-black flex items-center gap-0.5">
              เปิด WhatsApp <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          {/* Button 3: Facebook Fanpage */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-3 rounded-2xl flex items-center justify-between transition-all active:scale-98 text-left cursor-pointer shadow-xs group block"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                <Facebook className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-black">Facebook Fanpage</h4>
                <p className="text-[9px] text-blue-600 font-bold">ส่งข้อความหาเพจหลักบน Facebook</p>
              </div>
            </div>
            <span className="text-blue-500 text-[10px] font-black flex items-center gap-0.5">
              เปิด Facebook <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          {/* Button 4: TikTok */}
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white p-3 rounded-2xl flex items-center justify-between transition-all active:scale-98 text-left cursor-pointer shadow-xs group block"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-slate-950 p-2 rounded-xl group-hover:scale-105 transition-transform border border-slate-200 flex items-center justify-center">
                <Tv className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-100">TikTok Support</h4>
                <p className="text-[9px] text-slate-400 font-bold">ช่องทางบริการข้อมูลและข่าวสารทาง TikTok</p>
              </div>
            </div>
            <span className="text-teal-400 text-[10px] font-black flex items-center gap-0.5">
              เปิด TikTok <ExternalLink className="w-3 h-3 text-pink-400" />
            </span>
          </a>

          {/* Hotline / Operating Hours info */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-2.5 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-300" /> สายด่วนระบบซัพพอร์ต
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-300" /> สแตนด์บาย: 24 ชม.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
