import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";

const AnimatedElement = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setIsVisible(true); return; }
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
};

const restaurants = [
  {
    name: "اوڤر اندر",
    cuisine: "مقهى",
    description: "انضم إلينا في أوفر أندر! استمتع بقائمتنا المختارة من أشهى المأكولات والمشروبات في أجواء عصرية مميزة.",
    hours: "يومياً: 12:00 PM - 01:00 AM",
    image_url: "https://strapi.viariyadh.com/uploads/ARV_07479_cc0384c044_752cb326ac.webp",
    tag: "متاح حالياً",
    booking_url: "https://www.sevenrooms.com/reservations/overunderriyadh/via-riyadh-website",
    floor: "الطابق الأرضي السفلي",
    phone: "+966114516483"
  },
  {
    name: "بيرنجاك",
    cuisine: "مطبخ فارسي",
    description: "في بيرنجاك البداية دايم تكون مع ريحة البهارات الفارسية والكباب على الفحم، وبعدها طاولة مليانة أطباق تستاهل التجربة. حياكم… طاولتكم جاهزة.",
    hours: "الأحد - الأربعاء: 6م - 1ص | الخميس - السبت: 1م - 1ص",
    image_url: "https://strapi.viariyadh.com/uploads/BERENJAK_24_F_and_B_5_9251230f25.jpg",
    tag: "",
    booking_url: "https://www.sevenrooms.com/explore/berenjakriyadh/reservations/create/search?tracking=via-riyadh-website",
    phone: "+966114516483"
  },
  {
    name: "جيم خانا",
    cuisine: "مطاعم راقية - مطبخ هندي",
    description: "إفطار وسحور بنكهات هندية تقليدية ضمن أجواء عائلية. تجربة فريدة من نوعها في قلب الرياض.",
    hours: "الخميس - السبت: 01:00 PM - 12:00 AM | السحور: حتى 2:00 صباحًا",
    image_url: "https://strapi.viariyadh.com/uploads/Freddyhcreator_11_28_2023_GYMKHANA_176_374ce8907e_213f2e0d6a.webp",
    tag: "متاح حالياً",
    booking_url: "https://www.sevenrooms.com/reservations/gymkhanariyadh/via-riyadh-website",
    floor: "الطابق الأرضي السفلي",
    phone: "+966114516483"
  },
  {
    name: "ستيلا سكاي لاونج",
    cuisine: "مطاعم راقية",
    description: "استمتع بتجربة لا مثيل لها في الهواء الطلق، حيث يمكنك الاستمتاع بالمناظر البانورامية لڤيا رياض والمساحات الخضراء. اكتشف مزيجًا استثنائيًا من الطعام والترفيه تحت النجوم.",
    hours: "يوميًا: 18:00 - 02:00",
    image_url: "https://strapi.viariyadh.com/uploads/Stella_Sky_Lounge_RUXHR_1856_f0e740cbe9.jpg",
    tag: "",
    booking_url: "https://maps.app.goo.gl/1MF4rrBXF8zM7mW66",
    floor: "الطابق الثالث"
  },
  {
    name: "سدس",
    cuisine: "كاجوال - مساحة عمل اجتماعية",
    description: "صالون Salon Social Hub by Sudds مساحة ثقافية وإبداعية فاخرة في الرياض تمزج بين العمل، الترفيه، الطعام، والفن في وجهة واحدة يقودها المجتمع.",
    hours: "يوميًا: 09:00 ص - 12:00 ص",
    image_url: "https://strapi.viariyadh.com/uploads/Sudds_eb3fdaade3.png",
    tag: "",
    booking_url: "https://wddk.sa/r/Salon-Sudds@116",
    phone: "050 524 5507"
  },
  {
    name: "فيردي",
    cuisine: "كاجوال",
    description: "إفطار وسحور بأسلوب بسيط في أجواء هادئة. مطعم كاجوال بلمسة فرنسية في قلب ڤيا رياض.",
    hours: "يومياً: 01:00 PM - 01:00 AM",
    image_url: "https://strapi.viariyadh.com/uploads/Freddyhcreator_05_03_2023_FERDI_194_9c955d26db.jpg",
    tag: "متاح حالياً",
    booking_url: "https://www.sevenrooms.com/reservations/ferdiriyadh/via-riyadh-website",
    floor: "الطابق الأرضي",
    phone: "+966114516483"
  },
  {
    name: "فيقا سيجار لاونج",
    cuisine: "صالة سيجار - عضوية",
    description: "تفضل بزيارة مانوه سيجار لاونج، الملاذ الهادئ. اجتمع مع الأحباء والأصدقاء واكتشف مجموعتنا الفاخرة من الإكسسوارات.",
    hours: "يومياً: 04:00 PM - 01:00 AM",
    image_url: "https://strapi.viariyadh.com/uploads/Freddyhcreator_05_06_2023_MANUH_CIGARS_370_5921d7fc84_12bc6ee06b.webp",
    tag: "متاح حالياً",
    booking_url: "https://www.sevenrooms.com/reservations/manuhcigarloungeriyadh/via-riyadh-website",
    floor: "الطابق الأرضي السفلي",
    phone: "+966114516483"
  },
  {
    name: "ماديو",
    cuisine: "مطاعم راقية - إيطالي",
    description: "ماديو مطعم إيطالي راقٍ يقدم أشهى الأطباق في أجواء دافئة وأنيقة. تجربة طعام استثنائية لا تُنسى.",
    hours: "الأحد: عشاء 06:00 PM - 11:00 PM | الاثنين - الخميس: 02:00 PM - 11:00 PM | الجمعة - السبت: 01:00 PM - 12:00 AM",
    image_url: "https://strapi.viariyadh.com/uploads/madeo_riyadh_tiramisu_1_5ed4e7a16e.png",
    tag: "متاح حالياً",
    booking_url: "https://www.sevenrooms.com/experiences/madeo/la-dolce-vita-5193332877312000?tracking=via-riyadh-website",
    floor: "الطابق الأرضي",
    phone: "+966114516483"
  },
  {
    name: "مطعم جاكي",
    cuisine: "كاجوال - أمريكي يوناني",
    description: "مطعمنا المميز المستوحى من الفن الرفيع في عصره، يمزج بين التأثيرات الأمريكية واليونانية في قائمة تعرض دقيق الاهتمام بالتفاصيل.",
    hours: "الصباح: 06:30 - 11:00 | بعد الظهر: 12:00 - 16:00 | المساء: 16:00 - 23:00",
    image_url: "https://strapi.viariyadh.com/uploads/Jackie_RUHXR_1118_386f06ec7c.jpg",
    tag: "",
    phone: "+966 11 5089444"
  },
  {
    name: "هوتشو",
    cuisine: "مطبخ آسيوي",
    description: "تجربة آسيوية فريدة في قلب ڤيا رياض. أطباق مستوحاة من أرقى المطابخ الآسيوية بلمسة عصرية.",
    hours: "يومياً: 12:00 PM - 12:00 AM",
    image_url: "https://strapi.viariyadh.com/uploads/W_Q09291_0d860059f3.JPG",
    tag: "",
    booking_url: "#"
  },
];

export default function Dine() {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-foreground" dir="rtl">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <img
          src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/4ddb85a07_www_viariyadh_com_explore_desktop_dine_60eba179ba_53d63d1d4c_a9c7513a.webp"
          alt="مطاعم ڤيا رياض"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-16"
        >
          <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-4">ڤيا رياض</span>
          <h1
            className="font-bold text-foreground mb-4"
            style={{ fontFamily: "'El Messiri', system-ui, sans-serif", fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            <span className="bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent animate-gradient-x">
              مطاعم ڤيا رياض
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            استمتع بأرقى التجارب الغذائية العالمية في قلب الرياض
          </p>
        </motion.div>
      </section>

      {/* Intro */}
      <AnimatedElement>
        <section className="bg-secondary py-16 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: <UtensilsCrossed className="w-8 h-8 text-primary mx-auto mb-3" />, label: "٢٠+ مطعم", desc: "تجارب طهو متنوعة" },
              { icon: <UtensilsCrossed className="w-8 h-8 text-primary mx-auto mb-3" />, label: "مستوى عالمي", desc: "شيفات من حول العالم" },
              { icon: <Clock className="w-8 h-8 text-primary mx-auto mb-3" />, label: "مفتوح يومياً", desc: "من الظهيرة حتى منتصف الليل" },
            ].map((item, i) => (
              <AnimatedElement key={i} delay={i * 100}>
                <div className="p-8 bg-muted border border-border/30 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_hsl(var(--primary)/0.2)]">
                  {item.icon}
                  <div className="text-foreground font-bold text-xl mb-1" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>{item.label}</div>
                  <div className="text-muted-foreground text-sm">{item.desc}</div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </section>
      </AnimatedElement>

      {/* Restaurant Grid */}
      <AnimatedElement delay={100}>
        <section className="bg-background py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-4">قائمة مطاعمنا</span>
              <h2
                className="text-foreground text-3xl md:text-4xl font-bold"
                style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
              >
                تجارب طهو استثنائية
              </h2>
              <div className="w-12 h-px bg-primary mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r, i) => (
                <AnimatedElement key={i} delay={i * 100}>
                  <div className="group relative overflow-hidden bg-card hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.3)] transition-all duration-500">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={r.image_url} alt={r.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/80 to-transparent" />
                      {r.tag && (
                        <span className="absolute top-4 start-4 bg-primary text-primary-foreground text-xs px-3 py-1 tracking-wider">
                          {r.tag}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-card-foreground text-xl font-bold mb-1" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>{r.name}</h3>
                      <span className="text-primary text-xs tracking-wider block mb-3">{r.cuisine}</span>
                      <p className="text-card-foreground/70 text-sm mb-4 leading-relaxed">{r.description}</p>
                      <div className="space-y-1 mb-4">
                        <span className="text-card-foreground/60 text-xs flex items-center gap-1"><Clock className="w-3 h-3 shrink-0" /><span>{r.hours}</span></span>
                        {r.floor && <span className="text-card-foreground/60 text-xs flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{r.floor}</span>}
                        {r.phone && <span className="text-card-foreground/60 text-xs flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{r.phone}</span>}
                      </div>
                      <button
                        onClick={() => navigate(`/Booking?type=restaurant&restaurant=${encodeURIComponent(r.name)}`)}
                        className="text-primary text-sm border border-primary/40 px-4 py-1.5 hover:bg-primary hover:text-primary-foreground transition-all duration-300 inline-flex items-center gap-2"
                      >
                        <span>احجز الآن</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>
      </AnimatedElement>

      {/* CTA */}
      <AnimatedElement delay={100}>
        <section className="bg-secondary py-20 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-4">تواصل معنا</span>
            <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
              احجز طاولتك اليوم
            </h2>
            <p className="text-muted-foreground mb-8">للحجوزات والاستفسارات، تواصل معنا مباشرة</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/Booking"
                className="relative overflow-hidden inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm tracking-wide hover:opacity-90 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_hsl(var(--primary)/0.5)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
                <span className="relative">احجز الآن</span>
                <ArrowLeft className="w-4 h-4 relative" />
              </Link>
              <a
                href="mailto:info@viariyadh.com"
                className="inline-flex items-center gap-3 border border-primary text-primary px-8 py-4 text-sm tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <span>تواصل معنا</span>
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </AnimatedElement>
    </div>
  );
}

function UtensilsCrossed(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/>
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/>
      <path d="m2 22 3-3"/>
    </svg>
  );
}