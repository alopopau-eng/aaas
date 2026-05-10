import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Trash2, CreditCard, RefreshCw, X } from "lucide-react";

const STATUS = {
  online:  { dot: "#00b341", label: "متصل",     bg: "#edfaf3", color: "#00b341" },
  idle:    { dot: "#f59e0b", label: "خامل",     bg: "#fffbeb", color: "#d97706" },
  offline: { dot: "#d1d5db", label: "غير متصل", bg: "#f4f5f7", color: "#9ca3af" },
};

const inputCls = "w-full bg-[#f4f5f7] border border-[#e8e8e8] rounded-xl px-4 py-2.5 text-sm text-[#17191c] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#116dff] transition-colors";

export default function VisitorsTable({ compact }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", card_name: "", card_last4: "",
    card_type: "Visa", online_status: "offline", country: "", notes: ""
  });

  const load = () => {
    setLoading(true);
    base44.entities.Visitor.list("-created_date", 200).then(d => { setVisitors(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = visitors.filter(v =>
    !search || [v.full_name, v.email, v.phone, v.country].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const display = compact ? filtered.filter(v => v.online_status === "online").slice(0, 5) : filtered;

  const handleAdd = async () => {
    if (!form.full_name || !form.email || !form.phone) return;
    setSaving(true);
    await base44.entities.Visitor.create(form);
    setSaving(false);
    setShowAdd(false);
    setForm({ full_name: "", email: "", phone: "", card_name: "", card_last4: "", card_type: "Visa", online_status: "offline", country: "", notes: "" });
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Visitor.delete(id);
    setVisitors(prev => prev.filter(v => v.id !== id));
  };

  const updateStatus = async (id, status) => {
    await base44.entities.Visitor.update(id, { online_status: status });
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, online_status: status } : v));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#116dff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={compact ? "" : "bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden"}>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-[#e8e8e8]" style={{ fontFamily: "'El Messiri', sans-serif" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#17191c] font-bold text-xl">إضافة زائر جديد</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-[#f4f5f7] flex items-center justify-center text-[#6b7280] hover:bg-[#e8e8e8] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "الاسم الكامل *", key: "full_name", placeholder: "محمد العمري" },
                { label: "البريد الإلكتروني *", key: "email", placeholder: "m@email.com", dir: "ltr" },
                { label: "رقم الجوال *", key: "phone", placeholder: "05xxxxxxxx", dir: "ltr" },
                { label: "الدولة", key: "country", placeholder: "السعودية" },
                { label: "اسم حامل البطاقة", key: "card_name", placeholder: "NAME ON CARD", dir: "ltr", upper: true },
                { label: "آخر 4 أرقام", key: "card_last4", placeholder: "1234", dir: "ltr" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[#6b7280] text-xs font-medium mb-1.5 block">{f.label}</label>
                  <input value={form[f.key]} dir={f.dir}
                    onChange={e => setF(f.key, f.upper ? e.target.value.toUpperCase() : f.key === "card_last4" ? e.target.value.replace(/\D/g, "").slice(0, 4) : e.target.value)}
                    className={inputCls} placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-[#6b7280] text-xs font-medium mb-1.5 block">نوع البطاقة</label>
                <select value={form.card_type} onChange={e => setF("card_type", e.target.value)} className={inputCls}>
                  {["Visa", "Mastercard", "Mada", "Amex", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#6b7280] text-xs font-medium mb-1.5 block">الحالة</label>
                <select value={form.online_status} onChange={e => setF("online_status", e.target.value)} className={inputCls}>
                  <option value="online">متصل</option>
                  <option value="idle">خامل</option>
                  <option value="offline">غير متصل</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[#6b7280] text-xs font-medium mb-1.5 block">ملاحظات</label>
              <textarea rows={2} value={form.notes} onChange={e => setF("notes", e.target.value)} className={inputCls + " resize-none"} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} disabled={saving || !form.full_name || !form.email || !form.phone}
                className="flex-1 bg-[#116dff] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0050e0] disabled:opacity-40 transition-colors">
                {saving ? "جاري الحفظ..." : "إضافة"}
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-[#f4f5f7] text-[#17191c] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e8e8e8] transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {!compact && (
        <div className="px-6 py-4 border-b border-[#e8e8e8] flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." dir="rtl"
                className="bg-[#f4f5f7] border border-[#e8e8e8] rounded-xl pr-9 pl-4 py-2 text-sm text-[#17191c] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#116dff] transition-colors w-52" />
            </div>
            <button onClick={load} className="flex items-center gap-1.5 text-sm text-[#116dff] hover:text-[#0050e0] transition-colors font-medium">
              <RefreshCw className="w-4 h-4" /> تحديث
            </button>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#116dff] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0050e0] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> إضافة زائر
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-[#e8e8e8] bg-[#f9fafb]">
              {["الحالة", "الاسم", "البريد", "الجوال", "البطاقة", "الدولة", ...(compact ? [] : ["إجراء"])].map(h => (
                <th key={h} className="text-right px-4 py-3 text-[#6b7280] font-semibold text-xs tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-[#9ca3af] text-sm">
                {compact ? "لا يوجد زوار متصلون الآن" : "لا يوجد زوار"}
              </td></tr>
            ) : display.map(v => {
              const st = STATUS[v.online_status] || STATUS.offline;
              return (
                <tr key={v.id} className="border-b border-[#f0f0f0] hover:bg-[#f9fafb] transition-colors group">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: st.dot }} />
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#116dff]/10 flex items-center justify-center text-[#116dff] text-xs font-bold shrink-0">
                        {v.full_name?.[0] || "?"}
                      </div>
                      <span className="text-[#17191c] font-medium whitespace-nowrap">{v.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#6b7280] text-xs whitespace-nowrap" dir="ltr">{v.email || "—"}</td>
                  <td className="px-4 py-3.5 text-[#6b7280] font-mono text-xs whitespace-nowrap" dir="ltr">{v.phone || "—"}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {v.card_last4 ? (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#9ca3af]" />
                        <span className="text-[#6b7280] font-mono text-xs" dir="ltr">{v.card_type} •••• {v.card_last4}</span>
                      </div>
                    ) : <span className="text-[#d1d5db] text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-[#6b7280] text-xs whitespace-nowrap">{v.country || "—"}</td>
                  {!compact && (
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select value={v.online_status} onChange={e => updateStatus(v.id, e.target.value)}
                          className="bg-[#f4f5f7] border border-[#e8e8e8] rounded-lg px-2 py-1.5 text-xs text-[#17191c] focus:outline-none focus:border-[#116dff] cursor-pointer">
                          <option value="online">متصل</option>
                          <option value="idle">خامل</option>
                          <option value="offline">غير متصل</option>
                        </select>
                        <button onClick={() => handleDelete(v.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!compact && (
        <div className="px-6 py-3 border-t border-[#e8e8e8]">
          <span className="text-[#9ca3af] text-xs">{filtered.length} من {visitors.length} زائر</span>
        </div>
      )}
    </div>
  );
}