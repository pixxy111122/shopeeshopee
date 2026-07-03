/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, Phone, User, RefreshCw, AlertCircle, Eye, EyeOff, Sparkles, Key, ChevronLeft, Upload, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
  onClose?: () => void;
  settings?: {
    siteName: string;
    siteLogo: string;
    themeColor: string;
  };
  onSettingsUpdate?: (newSettings: any) => void;
  isAdmin?: boolean;
}

// Custom Closed Eyelashes SVG Icon matching the Shopee mockup exactly
const ClosedEyeLashesIcon = () => (
  <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 10C6 14 18 14 21 10" />
    <path d="M5.5 11.5L4 14" />
    <path d="M9 13L8 16" />
    <path d="M12 13.5V16.5" />
    <path d="M15 13L16 16" />
    <path d="M18.5 11.5L20 14" />
  </svg>
);

export default function LoginView({ onLoginSuccess, onClose, settings, onSettingsUpdate, isAdmin }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [username, setUsername] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle Input Changes with strict constraints
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  // Handle Logo Upload and trigger immediate online update
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 2MB to keep it fast and lightweight)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('ขนาดรูปภาพใหญ่เกินไปค่ะ (กรุณาใช้ขนาดรูปไม่เกิน 2MB เพื่ออัปโหลดอย่างรวดเร็วค่ะ)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target?.result as string;
      if (!base64Str) return;

      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      try {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteLogo: base64Str
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'ไม่สามารถอัปโหลดรูปโลโก้ได้');
        }

        setSuccessMsg('อัปเดตโลโก้ร้านค้าและเริ่มใช้งานออนไลน์ทันทีสำเร็จแล้วค่ะ! 🚀');
        if (onSettingsUpdate) {
          onSettingsUpdate(data.settings);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกรูปภาพโลโก้');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (phone.length !== 10) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้องจำนวน 10 หลักค่ะ');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('รหัสผ่านต้องมีความยาวตั้งแต่ 8 ตัวขึ้นไปค่ะ');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      let data: any = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text.substring(0, 150) || 'เซิร์ฟเวอร์ส่งการตอบกลับที่ไม่ถูกต้อง');
      }

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }

      setSuccessMsg('เข้าสู่ระบบเสร็จสิ้น! ยินดีต้อนรับกลับเข้าสู่ระบบค่ะ');
      
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'รหัสผ่านหรือเบอร์โทรศัพท์ไม่ถูกต้องในระบบหลังบ้านค่ะ');
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }

    if (phone.length !== 10) {
      setErrorMsg('เบอร์โทรศัพท์ต้องระบุตัวเลข 10 หลักเท่านั้นค่ะ');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('รหัสผ่านต้องมีอย่างน้อย 8 ตัวขึ้นไปเพื่อความปลอดภัยค่ะ');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันค่ะ กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    if (!invitationCode.trim()) {
      setErrorMsg('กรุณากรอกรหัสเชิญชวนเพื่อสมัครสมาชิกใหม่ด้วยค่ะ 🔒');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          phone,
          bankName: '',
          realName: '',
          bankAccount: '',
          password,
          invitationCode: invitationCode.trim(),
        }),
      });

      let data: any = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text.substring(0, 150) || 'เซิร์ฟเวอร์ส่งการตอบกลับที่ไม่ถูกต้อง');
      }

      if (!response.ok) {
        throw new Error(data.error || 'การสมัครสมาชิกล้มเหลว');
      }

      setSuccessMsg('สมัครสมาชิกสำเร็จเรียบร้อยแล้วค่ะ! กรุณาเข้าสู่ระบบด้วยเบอร์โทรศัพท์');
      
      setTimeout(() => {
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
        setErrorMsg('');
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถสร้างบัญชีได้ในขณะนี้');
    } finally {
      setLoading(false);
    }
  };

  // Button activation state calculations
  const isLoginActive = phone.length === 10 && password.length >= 8;
  const isRegisterActive = username.trim() !== '' && phone.length === 10 && password.length >= 8 && confirmPassword.length >= 8 && invitationCode.trim() !== '';

  return (
    <div id="login-view-container" className="flex flex-col min-h-screen bg-white font-sans select-none relative">
      
      {/* 1. White Top Header Bar */}
      <header id="login-header" className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
        <div className="w-8">
          {onClose && (
            <button
              id="btn-close-login"
              type="button"
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
          )}
        </div>
        <h1 className="text-base font-extrabold text-slate-800 text-center flex-1">
          {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Main Body */}
      <div id="login-body-wrapper" className="flex-1 flex flex-col px-6 pt-10 pb-20 max-w-md mx-auto w-full justify-between">
        
        <div className="flex-1 flex flex-col justify-start">
          {/* 2. Shopee Logo Section - Styled as a perfect borderless/colorless square frame */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-28 h-28 flex items-center justify-center overflow-hidden aspect-square">
              {settings?.siteLogo ? (
                <img
                  src={settings.siteLogo}
                  alt={settings?.siteName || 'Logo'}
                  className="w-full h-full object-contain aspect-square"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center aspect-square bg-[#f53d2d] rounded-xl shadow-sm">
                  <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Shopping bag handle */}
                    <path d="M35 32C35 22 41 16 50 16C59 16 65 22 65 32" stroke="white" strokeWidth="6.2" strokeLinecap="round" />
                    {/* Main bag body */}
                    <rect x="18" y="30" width="64" height="54" rx="14" fill="#f53d2d" stroke="white" strokeWidth="6.2" />
                    {/* Letter S inside the bag */}
                    <text x="50" y="68" fill="white" fontSize="38" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">S</text>
                  </svg>
                </div>
              )}
            </div>

            {/* Hidden Input for Selecting Logo from Device */}
            {isAdmin && (
              <>
                <input
                  type="file"
                  id="login-logo-upload-input"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="login-logo-upload-input"
                  className="mt-3 text-xs text-[#ee4d2d] font-bold border border-[#ee4d2d] px-3.5 py-1.5 rounded-full hover:bg-red-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm bg-white"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ดึงรูปภาพจากเครื่อง (เปลี่ยนโลโก้)</span>
                </label>
              </>
            )}
          </div>

          {/* Feedback messages */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-start gap-2"
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
                className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-bold flex items-start gap-2"
              >
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0 animate-spin" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms switcher */}
          <AnimatePresence mode="wait">
            {!isRegister ? (
              // --- LOGIN VIEW ---
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit}
                className="space-y-6"
              >
                {/* User / Phone Field */}
                <div className="relative flex items-center border-b border-slate-200 py-3.5 focus-within:border-[#ee4d2d] transition-colors">
                  <span className="text-slate-500 mr-3.5">
                    <User className="w-5 h-5 stroke-[1.5]" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="E-mail/เบอร์โทร/ชื่อผู้ใช้"
                    required
                    className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none placeholder:text-slate-300"
                  />
                </div>

                {/* Password Field with eyelashes toggler */}
                <div className="relative flex items-center border-b border-slate-200 py-3.5 focus-within:border-[#ee4d2d] transition-colors">
                  <span className="text-slate-500 mr-3.5">
                    <Lock className="w-5 h-5 stroke-[1.5]" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน"
                    required
                    minLength={8}
                    className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none placeholder:text-slate-300"
                  />
                  <div className="flex items-center gap-2.5 pl-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-5 h-5 stroke-[1.5]" /> : <ClosedEyeLashesIcon />}
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      type="button"
                      onClick={() => alert('หากท่านลืมรหัสผ่าน กรุณาติดต่อเบอร์ผู้ดูแลระบบหรือฝ่ายสนับสนุนลูกค้าโดยตรงเพื่อขอรีเซ็ตรหัสผ่านค่ะ')}
                      className="text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer whitespace-nowrap"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-md font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      isLoginActive 
                        ? 'bg-[#ee4d2d] hover:bg-[#d73f21] text-white cursor-pointer shadow-md' 
                        : 'bg-[#f3f3f3] text-[#cccccc] cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังเข้าสู่ระบบ...</span>
                      </>
                    ) : (
                      <span>เข้าสู่ระบบ</span>
                    )}
                  </button>
                </div>

                {/* Login with SMS alternative */}
                <div className="flex justify-end text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => alert('บริการเข้าสู่ระบบด้วย SMS กำลังอยู่ในระหว่างการปิดปรับปรุงระบบชั่วคราว กรุณาใช้รหัสผ่านในการเข้าสู่ระบบนะคะ')}
                    className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                  >
                    เข้าสู่ระบบด้วย SMS
                  </button>
                </div>
              </motion.form>
            ) : (
              // --- REGISTRATION VIEW ---
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-5"
              >
                {/* Username */}
                <div className="relative flex items-center border-b border-slate-200 py-3 focus-within:border-[#ee4d2d] transition-colors">
                  <span className="text-slate-500 mr-3.5">
                    <User className="w-5 h-5 stroke-[1.5]" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ชื่อผู้ใช้งาน (ภาษาอังกฤษหรือตัวเลข)"
                    required
                    className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none placeholder:text-slate-300"
                  />
                </div>

                {/* Phone */}
                <div className="relative flex items-center border-b border-slate-200 py-3 focus-within:border-[#ee4d2d] transition-colors">
                  <span className="text-slate-500 mr-3.5">
                    <Phone className="w-5 h-5 stroke-[1.5]" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                    required
                    className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none placeholder:text-slate-300"
                  />
                </div>

                {/* Invitation Code */}
                <div className="relative flex items-center border-b border-slate-200 py-3 focus-within:border-[#ee4d2d] transition-colors">
                  <span className="text-slate-500 mr-3.5">
                    <Key className="w-5 h-5 stroke-[1.5]" />
                  </span>
                  <input
                    type="text"
                    value={invitationCode}
                    placeholder="รหัสเชิญผู้แนะนำ"
                    required
                    onChange={(e) => setInvitationCode(e.target.value)}
                    className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none placeholder:text-slate-300"
                  />
                </div>

                {/* Password */}
                <div className="relative flex items-center border-b border-slate-200 py-3 focus-within:border-[#ee4d2d] transition-colors">
                  <span className="text-slate-500 mr-3.5">
                    <Lock className="w-5 h-5 stroke-[1.5]" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน (8 ตัวขึ้นไป)"
                    required
                    minLength={8}
                    className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer pl-2"
                  >
                    {showPassword ? <Eye className="w-5 h-5 stroke-[1.5]" /> : <ClosedEyeLashesIcon />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative flex items-center border-b border-slate-200 py-3 focus-within:border-[#ee4d2d] transition-colors">
                  <span className="text-slate-500 mr-3.5">
                    <Lock className="w-5 h-5 stroke-[1.5]" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ยืนยันรหัสผ่าน"
                    required
                    minLength={8}
                    className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer pl-2"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5 stroke-[1.5]" /> : <ClosedEyeLashesIcon />}
                  </button>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-md font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      isRegisterActive 
                        ? 'bg-[#ee4d2d] hover:bg-[#d73f21] text-white cursor-pointer shadow-md' 
                        : 'bg-[#f3f3f3] text-[#cccccc] cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังประมวลผล...</span>
                      </>
                    ) : (
                      <span>ยืนยันการสมัครสมาชิก</span>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Footer Bar with toggler */}
        <div className="text-center pt-10 text-xs text-slate-500">
          {!isRegister ? (
            <div className="flex items-center justify-center gap-1.5 font-semibold">
              <span>ยังไม่มีบัญชีผู้ใช้?</span>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-blue-600 hover:text-blue-700 font-extrabold cursor-pointer"
              >
                สมัครเลย
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 font-semibold">
              <span>มีบัญชีผู้ใช้แล้ว?</span>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-blue-600 hover:text-blue-700 font-extrabold cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Safety info bar at the absolute bottom */}
      <div className="bg-slate-50 py-3.5 border-t border-slate-100 flex items-center gap-2 justify-center text-[10px] text-slate-400 font-bold">
        <Shield className="w-3.5 h-3.5 text-orange-500" />
        <span>ระบบความปลอดภัย Shopee SSL Certified</span>
      </div>

    </div>
  );
}
