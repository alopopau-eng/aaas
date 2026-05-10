import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const STATUS_STYLE = {
  pending:   { bg: "#fffbeb", color: "#d97706", label: "قيد الانتظار" },
  confirmed: { bg: "#edfaf3", color: "#00b341", label: "مؤكد" },
  cancelled: { bg: "#fff1f2", color: "#e11d48", label: "ملغى" },
};
const TYPE_LABELS = { restaurant: "🍽 مطعم", hotel: "🏨 فندق", cinema: "🎬 سينما" };

export default function BookingsTable({ compact }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortCol, setSortCol] = useState("created_date");
  const [sortDir, setSortDir] = useState("desc");

  const load = () => {
    setLoading(true);
    bookingStore.list().then(d => { setBookings(d); setLoading(false); });
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

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#116dff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={compact ? "" : "bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden"}>
      {!compact && (
        <div className="px-6 py-4 border-b border-[#e8e8e8] flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." dir="rtl"
                className="bg-[#f4f5f7] border border-[#e8e8e8] rounded-xl pr-9 pl-4 py-2 text-sm text-[#17191c] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#116dff] transition-colors w-52" />
            </div>
            <div className="relative">
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="bg-[#f4f5f7] border border-[#e8e8e8] rounded-xl px-4 py-2 text-sm text-[#17191c] focus:outline-none appearance-none pl-8">
                <option value="all">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغى</option>
              </select>
              <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af] pointer-events-none" />
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-2 text-sm text-[#116dff] hover:text-[#0050e0] transition-colors font-medium">
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-[#e8e8e8] bg-[#f9fafb]">
              {["الاسم", "الجوال", "النوع", "الوجهة", "التاريخ", "الوقت", "الضيوف", "الحالة", ...(compact ? [] : ["تغيير"])].map(h => (
                <th key={h} className="text-right px-4 py-3 text-[#6b7280] font-semibold text-xs tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-[#9ca3af] text-sm">لا توجد حجوزات</td></tr>
            ) : display.map(b => {
              const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
              return (
                <tr key={b.id} className="border-b border-[#f0f0f0] hover:bg-[#f9fafb] transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#116dff]/10 flex items-center justify-center text-[#116dff] text-xs font-bold shrink-0">
                        {b.guest_name?.[0] || "?"}
                      </div>
                      <span className="text-[#17191c] font-medium whitespace-nowrap">{b.guest_name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#6b7280] font-mono text-xs whitespace-nowrap" dir="ltr">{b.phone || "—"}</td>
                  <td className="px-4 py-3.5 text-[#6b7280] whitespace-nowrap">{TYPE_LABELS[b.type] || b.type}</td>
                  <td className="px-4 py-3.5 text-[#17191c] whitespace-nowrap max-w-[110px] truncate">{b.venue_name || "—"}</td>
                  <td className="px-4 py-3.5 text-[#6b7280] font-mono text-xs whitespace-nowrap" dir="ltr">{b.date || "—"}</td>
                  <td className="px-4 py-3.5 text-[#6b7280] font-mono text-xs whitespace-nowrap" dir="ltr">{b.time || "—"}</td>
                  <td className="px-4 py-3.5 text-[#6b7280] text-center">{b.guests_count ?? "—"}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  {!compact && (
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                        className="bg-[#f4f5f7] border border-[#e8e8e8] rounded-lg px-2 py-1.5 text-xs text-[#17191c] focus:outline-none focus:border-[#116dff] cursor-pointer">
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">تأكيد</option>
                        <option value="cancelled">إلغاء</option>
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!compact && (
        <div className="px-6 py-3 border-t border-[#e8e8e8] flex items-center justify-between">
          <span className="text-[#9ca3af] text-xs">{filtered.length} من {bookings.length} حجز</span>
        </div>
      )}
    </div>
  );
}