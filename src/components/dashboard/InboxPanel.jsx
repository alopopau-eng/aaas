import { useState, useEffect } from 'react';
import { Search, RefreshCw, CalendarCheck, Hotel, Film, Clock, Phone, Mail, Users, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TYPE_ICONS = {
  restaurant: { icon: '🍽', label: 'مطعم', color: '#F59E0B', bg: '#FEF3C7' },
  hotel:      { icon: '🏨', label: 'فندق', color: '#6366F1', bg: '#EEF2FF' },
  cinema:     { icon: '🎬', label: 'سينما', color: '#EC4899', bg: '#FCE7F3' },
};

const STATUS_STYLE = {
  pending:   { bg: '#FFF3CD', color: '#856404', label: 'قيد الانتظار' },
  confirmed: { bg: '#D1FAE5', color: '#065F46', label: 'مؤكد' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'ملغى' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `منذ ${days} يوم`;
}

export default function InboxPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Booking.list('-created_date', 200);
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = !search || [b.guest_name, b.email, b.phone, b.venue_name].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'all' || b.type === filterType;
    return matchSearch && matchType;
  });

  const selectedBooking = bookings.find(b => b.id === selected);

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E8ECF0] flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
            <input
              placeholder="البحث في الطلبات..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#F7F8FA] border border-[#DFE3E8] rounded-lg pr-9 pl-4 py-2 text-sm text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#116DFF] w-56"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#F7F8FA] border border-[#DFE3E8] rounded-lg px-3 py-2 text-sm text-[#2D3748] focus:outline-none focus:border-[#116DFF]"
          >
            <option value="all">كل الأنواع</option>
            <option value="restaurant">مطعم</option>
            <option value="hotel">فندق</option>
            <option value="cinema">سينما</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#A0AEC0] text-xs">{bookings.length} طلب</span>
          <button onClick={load} className="flex items-center gap-1.5 text-sm text-[#116DFF] font-semibold hover:text-[#0047CC]">
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </div>

      <div className="flex" style={{ minHeight: 500 }}>
        {/* List */}
        <div className={`${selectedBooking ? 'w-2/5 border-l border-[#E8ECF0]' : 'w-full'} overflow-y-auto`} style={{ maxHeight: 600 }}>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#116DFF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#A0AEC0] text-sm">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#E2E8F0]" />
              لا توجد طلبات
            </div>
          ) : filtered.map(b => {
            const t = TYPE_ICONS[b.type] || TYPE_ICONS.restaurant;
            const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
            const isSelected = selected === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelected(isSelected ? null : b.id)}
                className={`w-full text-right px-5 py-4 border-b border-[#F0F2F5] hover:bg-[#F7F8FF] transition-colors flex items-start gap-3 ${isSelected ? 'bg-[#EEF2FF]' : ''}`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 mt-0.5" style={{ background: t.bg }}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[#1A202C] text-sm truncate">{b.guest_name || '—'}</span>
                    <span className="text-[10px] text-[#A0AEC0] whitespace-nowrap">{timeAgo(b.created_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: t.color }}>{t.label}</span>
                    <span className="text-[#6B7280] text-xs truncate">— {b.venue_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    <span className="text-[#A0AEC0] text-[11px]" dir="ltr">{b.date} {b.time}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedBooking && (() => {
          const t = TYPE_ICONS[selectedBooking.type] || TYPE_ICONS.restaurant;
          const st = STATUS_STYLE[selectedBooking.status] || STATUS_STYLE.pending;
          return (
            <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 600 }}>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: t.bg }}>
                  {t.icon}
                </div>
                <div>
                  <h3 className="text-[#1A202C] font-bold text-lg">{selectedBooking.guest_name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-3">
                {[
                  { icon: <span className="text-base">{t.icon}</span>, label: 'النوع', value: t.label },
                  { icon: <CalendarCheck className="w-4 h-4 text-[#116DFF]" />, label: 'الوجهة', value: selectedBooking.venue_name },
                  { icon: <Clock className="w-4 h-4 text-[#116DFF]" />, label: 'التاريخ والوقت', value: `${selectedBooking.date} — ${selectedBooking.time}`, dir: 'ltr' },
                  { icon: <Users className="w-4 h-4 text-[#116DFF]" />, label: 'عدد الضيوف', value: `${selectedBooking.guests_count} أشخاص` },
                  { icon: <Phone className="w-4 h-4 text-[#116DFF]" />, label: 'الجوال', value: selectedBooking.phone, dir: 'ltr' },
                  ...(selectedBooking.email ? [{ icon: <Mail className="w-4 h-4 text-[#116DFF]" />, label: 'البريد', value: selectedBooking.email, dir: 'ltr' }] : []),
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#F7F8FA] rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                      {row.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#A0AEC0] text-[10px] font-semibold uppercase tracking-wide">{row.label}</div>
                      <div className="text-[#1A202C] text-sm font-semibold truncate" dir={row.dir || 'rtl'}>{row.value || '—'}</div>
                    </div>
                  </div>
                ))}

                {selectedBooking.notes && (
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3">
                    <div className="text-[#92400E] text-[10px] font-semibold uppercase tracking-wide mb-1">ملاحظات</div>
                    <div className="text-[#78350F] text-sm leading-relaxed">{selectedBooking.notes}</div>
                  </div>
                )}

                <div className="text-[#A0AEC0] text-[11px] text-center pt-2">
                  تم الإرسال {timeAgo(selectedBooking.created_date)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}