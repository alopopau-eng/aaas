import { useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarCheck, Users, Bell, Search,
  ChevronDown, LogOut, Menu, TrendingUp, Clock, CheckCircle,
  Wifi, CreditCard, Trash2, Plus, RefreshCw, X, ChevronLeft, ChevronRight, MessageSquare
} from "lucide-react";
import InboxPanel from "@/components/dashboard/InboxPanel";
import VisitorAlerts from "@/components/dashboard/VisitorAlerts";
import { bookingStore, visitorStore } from "@/lib/firebaseStore";

// ─── NAV ────────────────────────────────────────────────────────────────────
const NAV = [
  { key: "overview",  label: "نظرة عامة",     icon: LayoutDashboard },
  { key: "bookings",  label: "الحجوزات",       icon: CalendarCheck },
  { key: "visitors",  label: "الزوار",          icon: Users },
  { key: "inbox",     label: "صندوق الوارد",   icon: MessageSquare },
];

// ─── STATUS MAPS ─────────────────────────────────────────────────────────────
const BOOKING_STATUS = {
  pending:   { bg: "#FFF3CD", color: "#856404", label: "قيد الانتظار" },
  confirmed: { bg: "#D1FAE5", color: "#065F46", label: "مؤكد" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B", label: "ملغى" },
};
const ONLINE_STATUS = {
  online:  { dot: "#22C55E", bg: "#DCFCE7", color: "#166534", label: "متصل" },
  idle:    { dot: "#F59E0B", bg: "#FEF9C3", color: "#92400E", label: "خامل" },
  offline: { dot: "#9CA3AF", bg: "#F3F4F6", color: "#6B7280", label: "غير متصل" },
};
const TYPE_LABELS = { restaurant: "🍽 مطعم", hotel: "🏨 فندق", cinema: "🎬 سينما" };

// ─── SHARED INPUT CLASS ───────────────────────────────────────────────────────
const inp = "w-full bg-[#F7F8FA] border border-[#DFE3E8] rounded-lg px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#116DFF] transition-colors";

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8ECF0] p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-[#6B7280] text-xs font-medium">{label}</p>
        <p className="text-[#1A202C] text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── BOOKINGS TABLE ───────────────────────────────────────────────────────────
function BookingsPanel({ compact }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const docs = await bookingStore.list();
      setBookings(docs);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await bookingStore.update(id, { status });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const filtered = bookings.filter(b => {
    const s = !search || [b.guest_name, b.email, b.phone, b.venue_name].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const f = filter === "all" || b.status === filter;
    return s && f;
  });
  const display = compact ? filtered.slice(0, 5) : filtered;

  return (
    <div className={compact ? "" : "bg-gradient-to-b from-[#eaf6ff] to-white rounded-3xl border border-[#b8dbff] overflow-hidden shadow-[0_16px_40px_rgba(32,112,196,0.18)] backdrop-blur"}>
      {!compact && (
        <div className="px-6 py-4 border-b border-[#b8dbff] flex flex-wrap gap-3 items-center justify-between bg-gradient-to-r from-[#2AABEE] to-[#229ED9]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." dir="rtl"
                className="bg-white/95 border border-white/40 rounded-xl pr-9 pl-4 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-white w-48 shadow-sm" />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="bg-white/95 border border-white/40 rounded-xl px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-white shadow-sm">
              <option value="all">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="cancelled">ملغى</option>
            </select>
          </div>
          <button onClick={load} className="flex items-center gap-2 text-sm text-white font-semibold hover:text-white/80">
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-[#116DFF] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="bg-[#d8efff] border-b border-[#b8dbff]">
                {["الاسم","الجوال","النوع","الوجهة","التاريخ","الوقت","الضيوف","رقم البطاقة","الحالة",...(compact?[]:["تغيير"])].map(h=>(
                  <th key={h} className="text-right px-4 py-3 text-[#2563eb] font-bold text-xs whitespace-nowrap tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {display.length === 0
                ? <tr><td colSpan={9} className="text-center py-14 text-[#A0AEC0] text-sm">لا توجد حجوزات</td></tr>
                : display.map(b => {
                    const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
                    return (
                      <tr key={b.id} className="border-b border-[#e4f2ff] hover:bg-[#f0f9ff] transition-colors group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#116DFF] text-xs font-bold shrink-0">
                              {b.guest_name?.[0]||"?"}
                            </div>
                            <span className="font-medium text-[#1A202C] whitespace-nowrap">{b.guest_name||"—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[#6B7280] font-mono text-xs" dir="ltr">{b.phone||"—"}</td>
                        <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap">{TYPE_LABELS[b.type]||b.type}</td>
                        <td className="px-4 py-3.5 text-[#1A202C] max-w-[110px] truncate whitespace-nowrap">{b.venue_name||"—"}</td>
                        <td className="px-4 py-3.5 text-[#6B7280] font-mono text-xs" dir="ltr">{b.date||"—"}</td>
                        <td className="px-4 py-3.5 text-[#6B7280] font-mono text-xs" dir="ltr">{b.time||"—"}</td>
                        <td className="px-4 py-3.5 text-[#6B7280] text-center">{b.guests_count??"—"}</td>
                        <td className="px-4 py-3.5 text-[#6B7280] font-mono text-xs" dir="ltr">{b.card_number || "—"}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{background:st.bg,color:st.color}}>{st.label}</span>
                        </td>
                        {!compact && (
                          <td className="px-4 py-3.5">
                            <select value={b.status} onChange={e=>updateStatus(b.id,e.target.value)}
                              className="bg-[#F7F8FA] border border-[#DFE3E8] rounded-lg px-2 py-1.5 text-xs text-[#2D3748] focus:outline-none focus:border-[#116DFF]">
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">تأكيد</option>
                              <option value="cancelled">إلغاء</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        )}
      </div>
      {!compact && !loading && (
        <div className="px-6 py-3 border-t border-[#E8ECF0] bg-[#FAFBFC]">
          <span className="text-[#A0AEC0] text-xs">{filtered.length} من {bookings.length} حجز</span>
        </div>
      )}
    </div>
  );
}

// ─── VISITORS TABLE ───────────────────────────────────────────────────────────
function VisitorsPanel({ compact }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name:"",email:"",phone:"",card_name:"",card_last4:"",card_type:"Visa",online_status:"offline",country:"",notes:"" });

  const load = () => {
    setLoading(true);
    visitorStore.list().then(d => { setVisitors(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  const filtered = visitors.filter(v =>
    !search || [v.full_name,v.email,v.phone,v.country].some(f=>f?.toLowerCase().includes(search.toLowerCase()))
  );
  const display = compact ? filtered.filter(v=>v.online_status==="online").slice(0,5) : filtered;

  const handleAdd = async () => {
    setSaving(true);
    await visitorStore.create(form);
    setSaving(false); setShowAdd(false);
    setForm({full_name:"",email:"",phone:"",card_name:"",card_last4:"",card_type:"Visa",online_status:"offline",country:"",notes:""});
    load();
  };
  const handleDelete = async id => {
    await visitorStore.delete(id);
    setVisitors(prev=>prev.filter(v=>v.id!==id));
  };
  const updateStatus = async (id,status) => {
    await visitorStore.update(id,{online_status:status});
    setVisitors(prev=>prev.map(v=>v.id===id?{...v,online_status:status}:v));
  };

  return (
    <div className={compact?"":"bg-gradient-to-b from-[#eaf6ff] to-white rounded-3xl border border-[#b8dbff] shadow-[0_16px_40px_rgba(32,112,196,0.14)] overflow-hidden"}>
      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-[#E8ECF0]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1A202C] font-bold text-xl">إضافة زائر جديد</h3>
              <button onClick={()=>setShowAdd(false)} className="w-8 h-8 rounded-full bg-[#F7F8FA] flex items-center justify-center hover:bg-[#E8ECF0] transition-colors">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:"الاسم الكامل *",key:"full_name",ph:"محمد العمري"},
                {label:"البريد الإلكتروني *",key:"email",ph:"m@email.com",dir:"ltr"},
                {label:"رقم الجوال *",key:"phone",ph:"05xxxxxxxx",dir:"ltr"},
                {label:"الدولة",key:"country",ph:"السعودية"},
                {label:"اسم حامل البطاقة",key:"card_name",ph:"NAME ON CARD",dir:"ltr",upper:true},
                {label:"آخر 4 أرقام",key:"card_last4",ph:"1234",dir:"ltr"},
              ].map(f=>(
                <div key={f.key}>
                  <label className="text-[#6B7280] text-xs font-semibold mb-1.5 block">{f.label}</label>
                  <input value={form[f.key]} dir={f.dir}
                    onChange={e=>setF(f.key,f.upper?e.target.value.toUpperCase():f.key==="card_last4"?e.target.value.replace(/\D/g,"").slice(0,4):e.target.value)}
                    className={inp} placeholder={f.ph} />
                </div>
              ))}
              <div>
                <label className="text-[#6B7280] text-xs font-semibold mb-1.5 block">نوع البطاقة</label>
                <select value={form.card_type} onChange={e=>setF("card_type",e.target.value)} className={inp}>
                  {["Visa","Mastercard","Mada","Amex","Other"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#6B7280] text-xs font-semibold mb-1.5 block">الحالة</label>
                <select value={form.online_status} onChange={e=>setF("online_status",e.target.value)} className={inp}>
                  <option value="online">متصل</option>
                  <option value="idle">خامل</option>
                  <option value="offline">غير متصل</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[#6B7280] text-xs font-semibold mb-1.5 block">ملاحظات</label>
              <textarea rows={2} value={form.notes} onChange={e=>setF("notes",e.target.value)} className={inp+" resize-none"} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} disabled={saving||!form.full_name||!form.email||!form.phone}
                className="flex-1 bg-[#116DFF] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#0047CC] disabled:opacity-40 transition-colors">
                {saving?"جاري الحفظ...":"إضافة زائر"}
              </button>
              <button onClick={()=>setShowAdd(false)} className="flex-1 bg-[#F7F8FA] text-[#2D3748] py-2.5 rounded-xl text-sm font-bold hover:bg-[#E8ECF0] transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={compact?"":"bg-[#e7f3ff] rounded-2xl border border-[#b8dbff] overflow-hidden shadow-[0_10px_30px_rgba(32,112,196,0.15)]"}>
        {!compact && (
          <div className="px-6 py-4 border-b border-[#E8ECF0] flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث..." dir="rtl"
                  className="bg-white/95 border border-white/40 rounded-xl pr-9 pl-4 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-white w-48 shadow-sm" />
              </div>
              <button onClick={load} className="flex items-center gap-1.5 text-sm text-white font-semibold hover:text-white/80">
                <RefreshCw className="w-4 h-4" /> تحديث
              </button>
            </div>
            <button onClick={()=>setShowAdd(true)}
              className="flex items-center gap-2 bg-[#116DFF] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0047CC] transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> إضافة زائر
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading
            ? <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-[#116DFF] border-t-transparent rounded-full animate-spin" /></div>
            : (
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="bg-[#d8efff] border-b border-[#b8dbff]">
                    {["الحالة","الاسم","البريد","الجوال","البطاقة","الدولة",...(compact?[]:["إجراء"])].map(h=>(
                      <th key={h} className="text-right px-4 py-3 text-[#2563eb] font-bold text-xs whitespace-nowrap tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {display.length===0
                    ? <tr><td colSpan={7} className="text-center py-14 text-[#A0AEC0] text-sm">{compact?"لا يوجد زوار متصلون":"لا يوجد زوار"}</td></tr>
                    : display.map(v=>{
                        const st=ONLINE_STATUS[v.online_status]||ONLINE_STATUS.offline;
                        return (
                          <tr key={v.id} className="border-b border-[#e4f2ff] hover:bg-[#f0f9ff] transition-colors group">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{background:st.dot}} />
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:st.bg,color:st.color}}>{st.label}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#116DFF] text-xs font-bold shrink-0">
                                  {v.full_name?.[0]||"?"}
                                </div>
                                <span className="font-medium text-[#1A202C] whitespace-nowrap">{v.full_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-[#6B7280] text-xs" dir="ltr">{v.email||"—"}</td>
                            <td className="px-4 py-3.5 text-[#6B7280] font-mono text-xs" dir="ltr">{v.phone||"—"}</td>
                            <td className="px-4 py-3.5">
                              {v.card_last4
                                ?<div className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-[#A0AEC0]"/><span className="text-[#6B7280] font-mono text-xs" dir="ltr">{v.card_type} •••• {v.card_last4}</span></div>
                                :<span className="text-[#D1D5DB] text-xs">—</span>
                              }
                            </td>
                            <td className="px-4 py-3.5 text-[#6B7280] text-xs whitespace-nowrap">{v.country||"—"}</td>
                            {!compact && (
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <select value={v.online_status} onChange={e=>updateStatus(v.id,e.target.value)}
                                    className="bg-[#F7F8FA] border border-[#DFE3E8] rounded-lg px-2 py-1.5 text-xs text-[#2D3748] focus:outline-none">
                                    <option value="online">متصل</option>
                                    <option value="idle">خامل</option>
                                    <option value="offline">غير متصل</option>
                                  </select>
                                  <button onClick={()=>handleDelete(v.id)}
                                    className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
                                    <Trash2 className="w-3.5 h-3.5"/>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            )
          }
        </div>
        {!compact && !loading && (
          <div className="px-6 py-3 border-t border-[#E8ECF0] bg-[#FAFBFC]">
            <span className="text-[#A0AEC0] text-xs">{filtered.length} من {visitors.length} زائر</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STATS OVERVIEW ───────────────────────────────────────────────────────────
function StatsRow({ bookings, visitors }) {
  const confirmed = bookings.filter(b=>b.status==="confirmed").length;
  const pending   = bookings.filter(b=>b.status==="pending").length;
  const online    = visitors.filter(v=>v.online_status==="online").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard icon={CalendarCheck} label="إجمالي الحجوزات" value={bookings.length} color="#116DFF" bg="#EEF2FF" />
      <StatCard icon={CheckCircle}   label="مؤكدة"            value={confirmed}      color="#059669" bg="#D1FAE5" />
      <StatCard icon={Clock}         label="قيد الانتظار"     value={pending}        color="#D97706" bg="#FEF3C7" />
      <StatCard icon={Users}         label="إجمالي الزوار"    value={visitors.length} color="#7C3AED" bg="#EDE9FE" />
      <StatCard icon={Wifi}          label="متصلون الآن"      value={online}         color="#059669" bg="#D1FAE5" />
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    setUser({ full_name: "Admin" });
    bookingStore.list().then(setBookings).catch(()=>{});
    visitorStore.list().then(setVisitors).catch(()=>{});
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#116DFF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'El Messiri', sans-serif" }} dir="rtl">

      {/* ── SIDEBAR ── */}
      <aside className={`fixed top-0 right-0 h-full z-40 flex flex-col bg-white border-l border-[#E8ECF0] shadow-sm transition-all duration-300 ${collapsed?"w-16":"w-60"}`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-4 gap-3 border-b border-[#E8ECF0] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#116DFF] flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-[#1A202C] text-sm tracking-tight whitespace-nowrap flex-1">ڤيا رياض</span>}
          <button onClick={()=>setCollapsed(c=>!c)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors ml-auto">
            {collapsed ? <ChevronLeft className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map(item=>{
            const Icon=item.icon, active=activeTab===item.key;
            return (
              <button key={item.key} onClick={()=>setActiveTab(item.key)}
                title={collapsed?item.label:""}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active?"bg-[#116DFF] text-white shadow-md shadow-[#116DFF]/20":"text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A202C]"
                }`}>
                <Icon className={`w-5 h-5 shrink-0 ${active?"text-white":"text-[#A0AEC0]"}`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className={`border-t border-[#E8ECF0] p-3 flex items-center gap-3 ${collapsed?"justify-center":""}`}>
          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#116DFF] text-xs font-bold shrink-0">
            {user.full_name?.[0]||"A"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[#1A202C] text-xs font-semibold truncate">{user.full_name}</div>
                <div className="text-[#A0AEC0] text-[10px] truncate">{user.email}</div>
              </div>
              <button onClick={()=>window.location.assign("/")} className="text-[#A0AEC0] hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4"/>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed?"mr-16":"mr-60"}`}>

        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E8ECF0] flex items-center px-6 gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex-1">
            <div className="relative max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
              <input placeholder="بحث..." dir="rtl"
                className="w-full bg-[#F7F8FA] border border-[#E8ECF0] rounded-xl pr-9 pl-4 py-2 text-sm placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#116DFF] transition-colors" />
            </div>
          </div>
          <VisitorAlerts />
          <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E8ECF0] rounded-xl px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#116DFF] text-xs font-bold">
              {user.full_name?.[0]||"A"}
            </div>
            <span className="text-[#1A202C] text-sm font-medium hidden md:block">{user.full_name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#A0AEC0]" />
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#1A202C] text-2xl font-bold">
                {activeTab==="overview"?"نظرة عامة":activeTab==="bookings"?"إدارة الحجوزات":activeTab==="visitors"?"إدارة الزوار":"صندوق الوارد"}
              </h1>
              <p className="text-[#6B7280] text-sm mt-0.5">
                {activeTab==="overview"?"مرحباً، هذه لمحة عن النشاط الحالي":activeTab==="bookings"?"عرض وإدارة جميع الحجوزات":activeTab==="visitors"?"عرض وإدارة بيانات الزوار":"رسائل وتواصل الضيوف"}
              </p>
            </div>
            <span className="text-[#A0AEC0] text-xs hidden md:block">{new Date().toLocaleDateString("ar-SA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
          </div>

          {/* Stats */}
          <StatsRow bookings={bookings} visitors={visitors} />

          {/* Content */}
          {activeTab==="bookings" && <BookingsPanel />}
          {activeTab==="visitors" && <VisitorsPanel />}
          {activeTab==="inbox" && <InboxPanel />}
          {activeTab==="overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-[#e7f3ff] rounded-2xl border border-[#b8dbff] overflow-hidden shadow-[0_10px_30px_rgba(32,112,196,0.15)]">
                <div className="px-6 py-4 border-b border-[#E8ECF0] flex items-center justify-between">
                  <h3 className="text-[#1A202C] font-bold">آخر الحجوزات</h3>
                  <button onClick={()=>setActiveTab("bookings")} className="text-[#116DFF] text-xs font-semibold hover:underline">عرض الكل</button>
                </div>
                <BookingsPanel compact />
              </div>
              <div className="bg-[#e7f3ff] rounded-2xl border border-[#b8dbff] overflow-hidden shadow-[0_10px_30px_rgba(32,112,196,0.15)]">
                <div className="px-6 py-4 border-b border-[#E8ECF0] flex items-center justify-between">
                  <h3 className="text-[#1A202C] font-bold">الزوار المتصلون</h3>
                  <button onClick={()=>setActiveTab("visitors")} className="text-[#116DFF] text-xs font-semibold hover:underline">عرض الكل</button>
                </div>
                <VisitorsPanel compact />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}