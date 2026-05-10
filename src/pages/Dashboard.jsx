import { useEffect, useMemo, useState } from "react";
import { Bell, RefreshCw, Search, User, CreditCard, Clock3, ShieldCheck, ShieldX, Wifi, WifiOff } from "lucide-react";
import { bookingStore, visitorStore } from "@/lib/firebaseStore";

const shell = "bg-[#030b1f] text-[#d7e6ff] min-h-screen";
const panel = "bg-[#091633] border border-[#1a2a51] rounded-xl shadow-[0_0_0_1px_rgba(82,116,189,0.12)]";

function Stat({ label, value, icon: Icon, tone = "cyan" }) {
  const tones = {
    cyan: "from-[#0a2c44] to-[#0f2441] border-[#1f4f78] text-[#4fd9ff]",
    green: "from-[#103627] to-[#0d2e24] border-[#1f6b50] text-[#67f5b4]",
    amber: "from-[#3f2a13] to-[#302012] border-[#7a5b2b] text-[#ffc971]",
    blue: "from-[#1a2856] to-[#121f48] border-[#2f4ca2] text-[#7ab6ff]",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 bg-gradient-to-r ${tones[tone]}`}>
      <div className="flex items-center justify-between text-xs text-[#9fb8e6] mb-2">
        <span>{label}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [b, v] = await Promise.all([bookingStore.list(), visitorStore.list()]);
      setBookings(b);
      setVisitors(v);
      if (!selectedId && b[0]?.id) setSelectedId(b[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => bookings.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [b.guest_name, b.phone, b.email, b.venue_name].some((x) => x?.toLowerCase().includes(q));
  }), [bookings, search]);

  const selected = filtered.find((b) => b.id === selectedId) || filtered[0] || null;

  const onlineVisitors = visitors.filter((v) => v.online_status === "online").length;

  return (
    <div className={shell} dir="rtl">
      <div className="max-w-[1500px] mx-auto p-3 md:p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button className={`${panel} p-2`}><Bell className="w-4 h-4" /></button>
            <button onClick={load} className={`${panel} p-2 hover:bg-[#0f2142] transition`}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
            <div className={`${panel} px-3 py-2 text-sm`}>لوحة التحكم</div>
          </div>
          <div className={`${panel} px-3 py-2 flex items-center gap-2 min-w-[280px]`}>
            <Search className="w-4 h-4 text-[#7fa0d8]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث المستخدم..." className="bg-transparent outline-none text-sm w-full placeholder:text-[#607aaa]" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <Stat label="إجمالي الحجوزات" value={bookings.length} icon={CreditCard} tone="blue" />
          <Stat label="الحجوزات اليوم" value={filtered.length} icon={Clock3} tone="cyan" />
          <Stat label="زوار متصلون" value={onlineVisitors} icon={Wifi} tone="green" />
          <Stat label="زوار غير متصلين" value={Math.max(visitors.length - onlineVisitors, 0)} icon={WifiOff} tone="amber" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className={`${panel} p-3`}>
              <div className="text-sm font-bold mb-2">معلومات أساسية</div>
              {!selected ? <div className="text-xs text-[#7a95c8]">لا توجد بيانات</div> : (
                <div className="space-y-2 text-sm">
                  {[ ["الاسم", selected.guest_name], ["رقم الجوال", selected.phone], ["البريد الإلكتروني", selected.email], ["رقم المرجع", selected.id] ].map(([k,v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-[#1b2a50] pb-2">
                      <span className="text-[#7e99c8]">{k}</span><span className="font-semibold">{v || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${panel} p-3`}>
              <div className="text-sm font-bold mb-2">معلومات البطاقة</div>
              {!selected ? <div className="text-xs text-[#7a95c8]">لا توجد بيانات</div> : (
                <>
                  <div className="rounded-xl bg-gradient-to-br from-[#113a8e] to-[#0b1f51] border border-[#3a65c8] p-4 mb-3">
                    <div className="text-xs text-[#b8d0ff] mb-3">{selected.card_type || "VISA"}</div>
                    <div className="tracking-[0.3em] text-lg" dir="ltr">{selected.card_number || `•••• •••• •••• ${selected.card_last4 || "----"}`}</div>
                    <div className="text-xs text-[#bfd4ff] mt-3">{selected.card_name || "CARD HOLDER"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button className="rounded-lg border border-[#236f4c] bg-[#113326] text-[#77f5be] py-1.5 inline-flex items-center justify-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> مقبول</button>
                    <button className="rounded-lg border border-[#6d2e3b] bg-[#331722] text-[#ff9bac] py-1.5 inline-flex items-center justify-center gap-1"><ShieldX className="w-3.5 h-3.5" /> مرفوض</button>
                  </div>
                </>
              )}
            </div>

            <div className={`${panel} p-3 lg:col-span-2`}>
              <div className="text-sm font-bold mb-2">بيانات التذكرة</div>
              {!selected ? <div className="text-xs text-[#7a95c8]">لا توجد بيانات</div> : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  {[ ["نوع الحجز", selected.type], ["الوجهة", selected.venue_name], ["عدد الضيوف", selected.guests_count], ["تاريخ الزيارة", selected.date], ["وقت الزيارة", selected.time] ].map(([k,v]) => (
                    <div key={k} className="rounded-lg bg-[#0b1838] border border-[#1d2d55] p-2">
                      <div className="text-[11px] text-[#7d9acc] mb-1">{k}</div>
                      <div className="font-semibold">{v || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className={`${panel} p-3`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold">تحديث الصفحة</div>
              <button onClick={load} className="text-[#6fc7ff] text-xs">تحديث</button>
            </div>
            <div className="space-y-2 max-h-[640px] overflow-auto pr-1">
              {filtered.map((b) => (
                <button key={b.id} onClick={() => setSelectedId(b.id)} className={`w-full text-right rounded-lg border p-2 transition ${selected?.id === b.id ? "bg-[#0f2958] border-[#3a65c8]" : "bg-[#08142e] border-[#1b2a50] hover:bg-[#0d1f45]"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm truncate">{b.guest_name || "زائر"}</span>
                    <span className="text-[10px] text-[#88a6d8]">{b.date || "—"}</span>
                  </div>
                  <div className="text-[11px] text-[#8ca7d5]" dir="ltr">{b.phone || "—"}</div>
                  <div className="text-[11px] text-[#8ca7d5] truncate">{b.venue_name || "—"}</div>
                </button>
              ))}
              {!filtered.length && <div className="text-center text-xs text-[#7a95c8] py-10">لا توجد حجوزات</div>}
            </div>
            <div className="mt-3 rounded-lg bg-[#07112a] border border-[#1d2b53] p-2 text-xs text-[#89a5d6] inline-flex items-center gap-1"><User className="w-3.5 h-3.5" /> العناصر: {filtered.length}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
