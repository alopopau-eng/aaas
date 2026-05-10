import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarCheck, UserCheck, Clock, Users, Wifi } from "lucide-react";

export default function DashboardStats({ activeTab }) {
  const [bookings, setBookings] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    base44.entities.Booking.list().then(setBookings).catch(() => {});
    base44.entities.Visitor.list().then(setVisitors).catch(() => {});
  }, []);

  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const online = visitors.filter(v => v.online_status === "online").length;

  const allStats = [
    { label: "إجمالي الحجوزات", value: bookings.length, icon: CalendarCheck, color: "#116dff", bg: "#eff5ff", show: ["overview", "bookings"] },
    { label: "مؤكدة", value: confirmed, icon: UserCheck, color: "#00b341", bg: "#edfaf3", show: ["overview", "bookings"] },
    { label: "قيد الانتظار", value: pending, icon: Clock, color: "#f59e0b", bg: "#fffbeb", show: ["overview", "bookings"] },
    { label: "إجمالي الزوار", value: visitors.length, icon: Users, color: "#8b5cf6", bg: "#f3f0ff", show: ["overview", "visitors"] },
    { label: "متصلون الآن", value: online, icon: Wifi, color: "#00b341", bg: "#edfaf3", show: ["overview", "visitors"] },
  ];

  const stats = allStats.filter(s => !activeTab || s.show.includes(activeTab));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="bg-white rounded-2xl border border-[#e8e8e8] p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                {i === 4 ? "مباشر" : "الكل"}
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#17191c]">{s.value}</div>
              <div className="text-[#6b7280] text-xs mt-0.5">{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}