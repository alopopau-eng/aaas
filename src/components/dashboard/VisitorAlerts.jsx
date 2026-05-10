import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, User, Clock, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POLL_INTERVAL = 30000; // 30 seconds
const ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in ms

export default function VisitorAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const knownVisitors = useRef({}); // { id: { firstSeen, alerted5min, name } }
  const bellRef = useRef(null);

  const addAlert = (alert) => {
    const id = `${alert.type}-${alert.visitorId}-${Date.now()}`;
    setAlerts(prev => [{ ...alert, id }, ...prev].slice(0, 20));
    // Auto-play a soft notification sound via oscillator
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = alert.type === 'new' ? 880 : 660;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  };

  const checkVisitors = async () => {
    const visitors = await base44.entities.Visitor.filter({ online_status: 'online' });
    const now = Date.now();

    visitors.forEach(v => {
      const prev = knownVisitors.current[v.id];

      if (!prev) {
        // New visitor detected
        knownVisitors.current[v.id] = { firstSeen: now, alerted5min: false, name: v.full_name };
        addAlert({
          type: 'new',
          visitorId: v.id,
          title: 'زائر جديد دخل الموقع',
          desc: v.full_name || 'زائر مجهول',
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        // Check 5-minute active threshold
        if (!prev.alerted5min && now - prev.firstSeen >= ACTIVE_THRESHOLD) {
          knownVisitors.current[v.id].alerted5min = true;
          addAlert({
            type: 'active',
            visitorId: v.id,
            title: 'زائر نشط لأكثر من 5 دقائق',
            desc: v.full_name || 'زائر مجهول',
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          });
        }
      }
    });

    // Remove offline visitors from tracking
    const onlineIds = new Set(visitors.map(v => v.id));
    Object.keys(knownVisitors.current).forEach(id => {
      if (!onlineIds.has(id)) delete knownVisitors.current[id];
    });
  };

  useEffect(() => {
    checkVisitors();
    const interval = setInterval(checkVisitors, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const dismiss = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setIsOpen(o => !o); if (!isOpen) markAllRead(); }}
        className="relative w-9 h-9 rounded-xl bg-[#F7F8FA] border border-[#E8ECF0] flex items-center justify-center text-[#6B7280] hover:bg-[#E8ECF0] transition-colors"
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#116DFF] border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-12 w-80 bg-white rounded-2xl border border-[#E8ECF0] shadow-2xl z-50 overflow-hidden"
            dir="rtl"
          >
            <div className="px-4 py-3 border-b border-[#E8ECF0] flex items-center justify-between">
              <span className="font-bold text-[#1A202C] text-sm">تنبيهات الزوار</span>
              <div className="flex items-center gap-2">
                {alerts.length > 0 && (
                  <button onClick={() => setAlerts([])} className="text-[#A0AEC0] text-[11px] hover:text-red-400 transition-colors">
                    مسح الكل
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="py-10 text-center text-[#A0AEC0] text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-[#E2E8F0]" />
                  لا توجد تنبيهات
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {alerts.map(alert => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-start gap-3 px-4 py-3 border-b border-[#F0F2F5] hover:bg-[#F7F8FA] transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.type === 'new' ? 'bg-[#D1FAE5]' : 'bg-[#FEF3C7]'
                      }`}>
                        {alert.type === 'new'
                          ? <User className="w-4 h-4 text-[#059669]" />
                          : <Clock className="w-4 h-4 text-[#D97706]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A202C] text-xs font-bold">{alert.title}</p>
                        <p className="text-[#6B7280] text-xs truncate">{alert.desc}</p>
                        <p className="text-[#A0AEC0] text-[10px] mt-0.5">{alert.time}</p>
                      </div>
                      <button
                        onClick={() => dismiss(alert.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#A0AEC0] hover:text-red-400 transition-all shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="px-4 py-2 bg-[#F7F8FA] border-t border-[#E8ECF0]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#A0AEC0]">
                <Wifi className="w-3 h-3 text-[#22C55E]" />
                يتحقق كل 30 ثانية
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}