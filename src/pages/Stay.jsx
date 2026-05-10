import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const AnimatedElement = ({ children, className, delay = 0, animation = "fade-up" }) => {
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
    }, { threshold: 0.05, rootMargin: "0px 0px 100px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);

  let animClass = "";
  if (animation === "fade-up") animClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";
  if (animation === "fade-in") animClass = isVisible ? "opacity-100" : "opacity-0";
  if (animation === "slide-right") animClass = isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10";
  if (animation === "slide-left") animClass = isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10";

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${animClass} ${className || ""}`}>
      {children}
    </div>
  );
};

const rooms = [
  {
    name: "الجناح الملكي",
    image: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/f05b64c4c_www_viariyadh_com_Deluxe_Double_Room_40e249cc77_83195fa0.jpg",
  },
  {
    name: "غرفة ديلوكس",
    image: "https://strapi.viariyadh.com/uploads/St_Regis_Riyadh_Deluxe_Room_Bedroom_1_c5d8b7a2e1.jpg",
  },
  {
    name: "جناح سانت ريجس",
    image: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/af5704e90_www_viariyadh_com_Our_heritage_ace712fb87_f692a56b2f_964e66dd.webp",
  },
];

const exploreCards = [
  {
    label: "المطاعم في ڤيا",
    to: "/Dine",
    image: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/4ddb85a07_www_viariyadh_com_explore_desktop_dine_60eba179ba_53d63d1d4c_a9c7513a.webp",
  },
  {
    label: "تسوق في ڤيا",
    to: "#",
    image: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/3ae9bf98a_www_viariyadh_com_explore_desktop_shop_c75c1e6670_3ce44143fb_f085184378_ad643c19.webp",
  },
  {
    label: "إقامتك في ڤيا رياض",
    to: "/Stay",
    image: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/f05b64c4c_www_viariyadh_com_Deluxe_Double_Room_40e249cc77_83195fa0.jpg",
  },
];

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prev = () => setCurrentSlide(i => (i - 1 + rooms.length) % rooms.length);
  const next = () => setCurrentSlide(i => (i + 1) % rooms.length);

  return (
    <section className="relative w-full min-h-[75vh] flex items-end overflow-hidden bg-background" dir="rtl">
      {/* Background slides */}
      {rooms.map((room, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
        >
          <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>
      ))}

      {/* St. Regis logo watermark top center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center">
        <span className="text-foreground/60 text-xs tracking-[0.4em] uppercase font-light">ST. REGIS</span>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20 flex flex-col md:flex-row items-end gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-4">فندق ڤيا رياض</span>
          <h1
            className="font-bold text-foreground leading-tight"
            style={{ fontFamily: "'El Messiri', system-ui, sans-serif", fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            انغمس في أرقى إقامة فاخرة في مدينة الرياض
          </h1>
        </motion.div>

        {/* Slide navigation */}
        <div className="flex items-center gap-4 mb-2">
          <button onClick={prev} className="w-10 h-10 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-foreground/50 text-sm font-light" dir="ltr">{currentSlide + 1} / {rooms.length}</span>
          <button onClick={next} className="w-10 h-10 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function RoomDetailSection() {
  return (
    <section className="bg-background py-0 overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">

        {/* Text box – overlaps image */}
        <AnimatedElement
          animation="slide-right"
          className="lg:col-start-1 lg:col-span-5 relative z-20 flex"
        >
          <div className="bg-secondary border border-white/5 p-10 md:p-14 lg:p-16 my-12 lg:my-20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col justify-center">
            {/* Slider mini inside box */}
            <div className="flex items-center gap-3 mb-6">
              <button className="w-7 h-7 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                <ChevronRight className="w-3 h-3" />
              </button>
              <span className="text-foreground/40 text-xs" dir="ltr">6 / 1</span>
              <button className="w-7 h-7 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <h2
              className="text-foreground text-2xl md:text-3xl font-bold mb-6 leading-snug"
              style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
            >
              الجناح الملكي
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              يضم الجناح الملكي مساحات فاخرة توفر إطلالات على مدينة الرياض 24/24، وغرفة نوم واسعة، وصالة جلوس رفيعة، وحمام رخامي مزدوج.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              استمتع بخدمة الباتلر الشخصية وامتيازات حصرية للنزلاء ضمن تجربة لا مثيل لها في الرياض.
            </p>
            <Link
              to="/Booking"
              className="inline-flex items-stretch bg-background/50 border border-primary/30 hover:border-primary transition-colors duration-500 group self-start"
            >
              <span className="flex items-center px-5 text-sm font-bold tracking-widest text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                احجز الآن
              </span>
              <div className="w-10 border-r border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 overflow-hidden relative py-3">
                <ArrowLeft className="w-4 h-4 text-primary group-hover:text-primary-foreground transform translate-x-6 group-hover:translate-x-0 transition-transform duration-500 absolute" />
                <ArrowLeft className="w-4 h-4 text-primary group-hover:text-primary-foreground transform translate-x-0 group-hover:-translate-x-6 transition-transform duration-500" />
              </div>
            </Link>
          </div>
        </AnimatedElement>

        {/* Room image */}
        <AnimatedElement
          animation="fade-in"
          delay={150}
          className="lg:col-start-4 lg:col-span-9 relative z-10"
        >
          <div className="relative w-full h-full min-h-[350px] lg:min-h-[600px] overflow-hidden">
            <img
              src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/f05b64c4c_www_viariyadh_com_Deluxe_Double_Room_40e249cc77_83195fa0.jpg"
              alt="غرفة سانت ريجس"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent lg:to-transparent" />
          </div>
        </AnimatedElement>

      </div>
    </section>
  );
}

function HeritageSection() {
  return (
    <section className="bg-background py-0 overflow-hidden" dir="rtl">
      {/* Full-width image */}
      <AnimatedElement animation="fade-in">
        <div className="relative w-full aspect-[21/9] overflow-hidden">
          <img
            src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/def03166d_www_viariyadh_com_Mapa_19afd6e1af_0df447dbb1_b474f2d1.webp"
            alt="ڤيا رياض الخارج"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/60" />
        </div>
      </AnimatedElement>

      {/* Overlapping white/tan content box */}
      <div className="relative bg-card py-20 px-6 border-t border-primary/20 mt-[-2px]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle,_hsl(var(--foreground))_1px,_transparent_1px)] bg-[length:30px_30px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <AnimatedElement animation="fade-up">
            <span className="text-primary/70 text-xs tracking-[0.3em] uppercase block mb-6">ڤيا رياض</span>
            <h2
              className="text-card-foreground text-3xl md:text-5xl font-bold leading-tight mb-8 max-w-2xl"
              style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
            >
              أحدث وجهة فاخرة في العالم لتجربة الرفاهية المغروسة في التراث السعودي.
            </h2>
            <a
              href="#"
              className="inline-flex items-stretch border border-card-foreground/30 hover:border-primary transition-colors duration-500 group"
            >
              <span className="flex items-center px-5 py-3 text-xs font-bold tracking-widest text-card-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                اكتشف أكثر
              </span>
              <div className="w-10 border-r border-card-foreground/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 overflow-hidden relative">
                <ArrowLeft className="w-4 h-4 text-card-foreground group-hover:text-primary-foreground transform translate-x-6 group-hover:translate-x-0 transition-transform duration-500 absolute" />
                <ArrowLeft className="w-4 h-4 text-card-foreground group-hover:text-primary-foreground transform translate-x-0 group-hover:-translate-x-6 transition-transform duration-500" />
              </div>
            </a>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
}

function ExploreSection() {
  return (
    <section className="bg-background py-20 px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <AnimatedElement>
          <h2
            className="text-foreground text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
          >
            اكتشف ڤيا رياض
          </h2>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exploreCards.map((card, i) => (
            <AnimatedElement key={i} delay={i * 120} animation="fade-up">
              <Link to={card.to} className="group block relative aspect-[4/3] overflow-hidden">
                <img
                  src={card.image}
                  alt={card.label}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
                <div className="absolute inset-4 border border-primary/0 group-hover:border-primary/40 transition-colors duration-700 pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <h3
                    className="text-foreground text-xl font-bold"
                    style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
                  >
                    {card.label}
                  </h3>
                </div>
              </Link>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Stay() {
  return (
    <div className="bg-background text-foreground" dir="rtl">
      <HeroSection />
      <RoomDetailSection />
      <HeritageSection />
      <ExploreSection />
    </div>
  );
}