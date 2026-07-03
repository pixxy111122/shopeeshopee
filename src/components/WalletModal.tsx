/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownLeft, ArrowUpRight, Wallet, RefreshCw, CreditCard, AlertCircle, CheckCircle2, Clock, Landmark, FileText, User } from 'lucide-react';

// List of popular Thai banks for dropdown selection
const THAI_BANKS = [
  { code: 'KBANK', name: 'ธนาคารกสิกรไทย (K-Bank)' },
  { code: 'SCB', name: 'ธนาคารไทยพาณิชย์ (SCB)' },
  { code: 'KTB', name: 'ธนาคารกรุงไทย (Krungthai)' },
  { code: 'BBL', name: 'ธนาคารกรุงเทพ (Bualuang)' },
  { code: 'BAY', name: 'ธนาคารกรุงศรีอยุธยา (Krungsri)' },
  { code: 'TTB', name: 'ธนาคารทหารไทยธนชาต (ttb)' },
  { code: 'GSB', name: 'ธนาคารออมสิน (Government Savings)' },
  { code: 'BAAC', name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)' },
  { code: 'GHB', name: 'ธนาคารอาคารสงเคราะห์ (GHB)' },
  { code: 'KKP', name: 'ธนาคารเกียรตินาคินภัทร (KKP)' },
  { code: 'CIMBT', name: 'ธนาคารซีไอเอ็มบีไทย (CIMB Thai)' },
  { code: 'UOB', name: 'ธนาคารยูโอบี (UOB)' },
  { code: 'TISCO', name: 'ธนาคารทิสโก้ (TISCO)' },
  { code: 'LHB', name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)' },
  { code: 'TCRB', name: 'ธนาคารไทยเครดิต (Thai Credit)' },
];

// List of popular Laos banks for dropdown selection
const LAO_BANKS = [
  { code: 'BCEL', name: 'ธนาคารการค้าต่างประเทศลาว มหาชน (BCEL)' },
  { code: 'LDB', name: 'ธนาคารพัฒนาลาว (LDB)' },
  { code: 'APB', name: 'ธนาคารส่งเสริมกสิกรรม (APB)' },
  { code: 'JDB', name: 'ธนาคารร่วมพัฒนา (JDB)' },
  { code: 'STB', name: 'ธนาคารเอสที (ST Bank)' },
  { code: 'PSVB', name: 'ธนาคารพงสะหวัน (Phongsavanh Bank)' },
  { code: 'LVB', name: 'ธนาคารลาว-เวียด (Lao-Viet Bank)' },
  { code: 'BIC', name: 'ธนาคารบีไอซี แบงก์ ลาว (BIC Bank Lao)' },
  { code: 'SACB', name: 'ธนาคารซาคอมแบงก์ ลาว (Sacombank Lao)' },
  { code: 'MJBL', name: 'ธนาคารมารูฮาน เจแปน แบงก์ ลาว (Maruhan Japan Bank)' },
  { code: 'CNB', name: 'ธนาคารคาเนเดีย แบงก์ ลาว (Canadia Bank Lao)' },
  { code: 'IDB', name: 'ธนาคารอินโดจีน (Indochina Bank)' },
  { code: 'ACL', name: 'ธนาคารแอคสีลิดา แบงก์ ลาว (ACLEDA Bank Lao)' },
];

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

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSyncUser: (updatedUser: any) => void;
  initialTab?: 'history' | 'withdraw';
}

export default function WalletModal({ isOpen, onClose, user, onSyncUser, initialTab = 'history' }: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'withdraw'>(initialTab);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Bank Account Edit States
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editBankName, setEditBankName] = useState(
    user?.bankName || (user?.country === 'Laos' ? 'ธนาคารการค้าต่างประเทศลาว มหาชน (BCEL)' : 'ธนาคารกสิกรไทย (K-Bank)')
  );
  const [editRealName, setEditRealName] = useState(user?.realName || '');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankError, setBankError] = useState('');

  // Fetch transaction history
  const fetchHistory = async () => {
    if (!user?.phone) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions?phone=${user.phone}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.phone) {
      fetchHistory();
      setActiveTab(initialTab);
      setAmount('');
      setNote('');
      setErrorMsg('');
      setSuccessMsg('');

      // Reset bank editing states
      setIsEditingBank(false);
      setEditBankName(user.bankName || (user.country === 'Laos' ? 'ธนาคารการค้าต่างประเทศลาว มหาชน (BCEL)' : 'ธนาคารกสิกรไทย (K-Bank)'));
      setEditRealName(user.realName || '');
      setEditBankAccount('');
      setBankError('');

      // Setup real-time silent polling for history updates
      const interval = setInterval(() => {
        const fetchHistorySilent = async () => {
          try {
            const res = await fetch(`/api/transactions?phone=${user.phone}`);
            if (res.ok) {
              const data = await res.json();
              setTransactions(data);
            }
          } catch (err) {
            console.error('Silent history fetch error:', err);
          }
        };
        fetchHistorySilent();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOpen, user?.phone]);

  const handleSaveBankDetails = async () => {
    setBankError('');
    if (!editRealName.trim()) {
      setBankError('กรุณาระบุชื่อจริงและนามสกุลจริงด้วยค่ะ');
      return;
    }
    if (!editBankAccount.trim()) {
      setBankError('กรุณาระบุเลขที่บัญชีธนาคารให้ถูกต้องค่ะ');
      return;
    }

    setIsSavingBank(true);
    try {
      const res = await fetch('/api/user/update-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          bankName: editBankName,
          realName: editRealName.trim(),
          bankAccount: editBankAccount.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }

      setSuccessMsg(data.message);
      onSyncUser(data.user);
      setIsEditingBank(false);
    } catch (err: any) {
      setBankError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินให้ถูกต้องค่ะ');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          amount: numAmount,
          note: note,
          isAdmin: false
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการทำรายการ');
      }

      setSuccessMsg(data.message);
      setAmount('');
      setNote('');
      fetchHistory();
      
      // Update parent balance & user state
      if (data.user) {
        onSyncUser(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินให้ถูกต้องค่ะ');
      return;
    }

    if (user.balance < numAmount) {
      setErrorMsg('ยอดคงเหลือในกระเป๋าเงินไม่เพียงพอสำหรับถอนเงินจำนวนนี้ค่ะ');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          amount: numAmount,
          note: note,
          isAdmin: false
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการทำรายการ');
      }

      setSuccessMsg(data.message);
      setAmount('');
      setNote('');
      fetchHistory();
      
      // Update parent balance & user state
      if (data.user) {
        onSyncUser(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="wallet-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            id="wallet-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-slate-50 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-slate-200/50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg border border-white/10">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">ShopeePay Wallet</h3>
                  <p className="text-[10px] text-orange-100 font-medium">กระเป๋าเงินจำลองแบบเรียลไทม์</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallet Balance Summary Card */}
            <div className="p-4 bg-white border-b border-slate-100 flex flex-col gap-1.5 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                <Wallet className="w-40 h-40 text-orange-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">ยอดคงเหลือใช้งานได้</span>
                <button 
                  onClick={fetchHistory}
                  disabled={isLoading}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-orange-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-baseline gap-1 text-orange-600">
                <span className="text-3xl font-black tracking-tight">
                  ฿{typeof user?.balance === 'number' ? user.balance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </span>
                <span className="text-xs font-bold">THB</span>
              </div>

              {/* User Registered Info */}
              <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-2 flex flex-col gap-1.5 font-semibold">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>👤 ชื่อผู้ใช้: <strong className="text-slate-800">{user?.username}</strong></span>
                  <span>📞 เบอร์โทรศัพท์: <strong className="text-slate-800">{user?.phone}</strong></span>
                </div>
                
                <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-lg border border-slate-100 mt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400">บัญชีธนาคารสำหรับรับเงิน:</span>
                    {user?.bankAccount ? (
                      <span className="flex items-center gap-1 text-slate-800 font-bold text-[10px]">
                        <Landmark className="w-3.5 h-3.5 text-orange-500" />
                        {user.bankName} - <span className="text-orange-600">{user.bankAccount}</span>
                        {user.realName && <span className="text-slate-500 font-medium">({user.realName})</span>}
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        ⚠️ ยังไม่ได้ตั้งค่าบัญชีธนาคาร
                      </span>
                    )}
                  </div>

                  {!user?.bankAccount ? (
                    <button
                      onClick={() => {
                        setIsEditingBank(true);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-black px-2.5 py-1.5 rounded-md shadow-xs cursor-pointer transition-colors"
                    >
                      📝 ตั้งค่าบัญชี
                    </button>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5 bg-slate-100 px-2 py-1 rounded">
                      🔒 ล็อคข้อมูลแล้ว
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isEditingBank ? (
              <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Landmark className="w-4 h-4 text-orange-500" />
                  <h4 className="text-xs font-black text-slate-800">ตั้งค่าข้อมูลบัญชีธนาคารสำหรับการรับเงิน</h4>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 font-medium leading-relaxed">
                  ⚠️ <strong>คำชี้แจงสำคัญ:</strong><br />
                  - บัญชีนี้ใช้สำหรับการถอนเงินสดออกจากระบบ ShopeePay Wallet เท่านั้น<br />
                  - กรุณาตรวจสอบเลขบัญชีและชื่อบัญชีให้ตรงกันทุกตัวอักษร<br />
                  - <span className="text-red-600 font-extrabold">เมื่อบันทึกข้อมูลเรียบร้อยแล้ว ท่านจะไม่สามารถแก้ไขเลขบัญชีได้ด้วยตัวเองอีกเพื่อความปลอดภัยสูงสุด</span>
                </div>

                {bankError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-2.5 text-[10px] text-red-600 flex gap-1.5 items-center">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{bankError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Select Bank */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      เลือกธนาคารผู้ให้บริการ ({user?.country === 'Laos' ? 'ประเทศลาว' : 'ประเทศไทย'}) *
                    </label>
                    <select
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs font-bold p-2.5 rounded-xl outline-hidden transition-all cursor-pointer"
                    >
                      {(user?.country === 'Laos' ? LAO_BANKS : THAI_BANKS).map(b => (
                        <option key={b.code} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Real Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">ชื่อจริง - นามสกุลจริง (ตรงตามบัญชีธนาคาร) *</label>
                    <input
                      type="text"
                      placeholder="ระบุชื่อจริงและนามสกุล เช่น สมศรี ใจดี"
                      value={editRealName}
                      onChange={(e) => setEditRealName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs font-bold p-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">หมายเลขบัญชีธนาคาร (ตัวเลขเท่านั้น) *</label>
                    <input
                      type="text"
                      placeholder="ระบุหมายเลขบัญชี เช่น 1234567890"
                      value={editBankAccount}
                      onChange={(e) => setEditBankAccount(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs font-bold p-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingBank(false);
                      setBankError('');
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBankDetails}
                    disabled={isSavingBank}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isSavingBank ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      'บันทึกข้อมูล'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200/60 bg-white">
                  <button
                    onClick={() => { setActiveTab('history'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-3 text-xs font-bold text-center transition-all border-b-2 cursor-pointer ${activeTab === 'history' ? 'border-orange-500 text-orange-600 bg-orange-50/10' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    ประวัติธุรกรรม
                  </button>
                  <button
                    onClick={() => { setActiveTab('withdraw'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-3 text-xs font-bold text-center transition-all border-b-2 cursor-pointer ${activeTab === 'withdraw' ? 'border-orange-500 text-orange-600 bg-orange-50/10' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    ถอนเงิน
                  </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  
                  {/* Messages alerts */}
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 items-start text-xs text-red-600 leading-normal">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex gap-2 items-start text-xs text-teal-700 leading-normal">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* 1. HISTORY TAB */}
                  {activeTab === 'history' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>รายการธุรกรรมล่าสุด</span>
                        <span>{transactions.length} รายการ</span>
                      </div>

                      {transactions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-bold">ไม่มีประวัติธุรกรรมฝากหรือถอนในระบบค่ะ</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transactions.map((tx, idx) => {
                            const isDeposit = tx.type === 'deposit';
                            return (
                              <div
                                key={`wallet-tx-${tx.id || 'none'}-${idx}`}
                                className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-all shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`p-2 rounded-xl shrink-0 ${isDeposit ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                    {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-extrabold text-slate-800">
                                        {isDeposit ? 'ฝากเงิน (เติมเงิน)' : 'ถอนเงินออกจากระบบ'}
                                      </span>
                                      {tx.status === 'pending' && (
                                        <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                                          <Clock className="w-2.5 h-2.5" /> รออนุมัติ
                                        </span>
                                      )}
                                      {tx.status === 'approved' && (
                                        <span className="bg-teal-100 text-teal-800 text-[8px] px-1.5 py-0.5 rounded font-black">
                                          สำเร็จ
                                        </span>
                                      )}
                                      {tx.status === 'rejected' && (
                                        <span className="bg-red-100 text-red-800 text-[8px] px-1.5 py-0.5 rounded font-black">
                                          ถูกปฏิเสธ
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-medium block">
                                      {new Date(tx.createdAt).toLocaleString('th-TH')}
                                    </span>
                                    {tx.note && (
                                      <span className="text-[9px] text-orange-600 font-bold block truncate mt-0.5">
                                        💬 หมายเหตุ: {tx.note}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className={`text-xs font-black text-right ${isDeposit ? 'text-teal-600' : 'text-red-500'}`}>
                                  {isDeposit ? '+' : '-'}฿{tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}



                  {/* 3. WITHDRAW TAB */}
                  {activeTab === 'withdraw' && (
                    !user?.bankAccount ? (
                      <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 text-center space-y-4">
                        <Landmark className="w-10 h-10 text-amber-500 mx-auto" />
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">ยังไม่ได้ตั้งค่าบัญชีธนาคารสำหรับรับเงิน</h4>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                            ขออภัยค่ะ ท่านต้องทำการตั้งค่าข้อมูลบัญชีธนาคารก่อน<br />
                            จึงจะสามารถทำรายการถอนเงินออกจากระบบส่งไปให้แอดมินได้ค่ะ
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingBank(true)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-sm cursor-pointer transition-colors"
                        >
                          📝 คลิกเพื่อตั้งค่าบัญชีธนาคารรับเงิน
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleWithdraw} className="space-y-4">
                        <div className="bg-red-50/50 border border-red-100/70 rounded-xl p-3 text-[11px] text-red-800 leading-relaxed font-medium">
                          <span className="font-extrabold block mb-1">💸 เงื่อนไขการถอนเงินออกจากบัญชีร้านค้า:</span>
                          - ระบบจะหักยอดเงินคงเหลือจากกระเป๋าเงินทันทีเมื่อส่งคำขอถอนเงินค่ะ<br />
                          - คำขอจะเข้าคิวรออนุมัติจากแอดมิน หากโดนปฏิเสธระบบจะคืนเงินเข้ากระเป๋าของท่านให้ทันที
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500">จำนวนเงินที่ต้องการถอนออก (บาท)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">฿</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2.5 pl-8 pr-4 text-sm font-black text-slate-800 outline-hidden transition-all"
                              required
                              min="1"
                              step="any"
                              max={user.balance}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400">ถอนได้สูงสุด:</span>
                            <span className="text-orange-600">฿{user.balance?.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500">หมายเหตุการถอนเงิน (เช่น ระบุชื่อบัญชีรับเงิน หรือธนาคารปลายทาง)</label>
                          <textarea
                            placeholder="เช่น ถอนเข้าบัญชี กสิกรไทย 123-456-xxxx สมศักดิ์ มีดี..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 outline-hidden transition-all h-20 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading || user.balance <= 0}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black text-xs py-3 rounded-xl shadow-md cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                        >
                          {isLoading ? 'กำลังส่งคำขอรายการ...' : 'ยืนยันส่งคำขอถอนเงินออกจากระบบ'}
                        </button>
                      </form>
                    )
                  )}

                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
