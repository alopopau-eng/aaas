import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Film } from "lucide-react";
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
    }, { threshold: 0.05, rootMargin: "0px 0px 100px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
};

const movies = [
  {
    title: "Mortal Kombat 2",
    titleAr: "مورتال كومبات 2",
    poster: "https://assets.voxcinemas.com/posters/P_HO00013102_1776659275498.jpg",
    slug: "mortal-kombat-2",
    genre: "أكشن",
  },
  {
    title: "The Devil Wears Prada 2",
    titleAr: "الشيطان يرتدي برادا 2",
    poster: "https://assets.voxcinemas.com/posters/P_HO00012735_1774844160941.jpg",
    slug: "the-devil-wears-prada-2",
    genre: "كوميديا",
  },
  {
    title: "Michael",
    titleAr: "مايكل",
    poster: "https://assets.voxcinemas.com/posters/P_HO00013057_1775544165007.jpg",
    slug: "michael",
    genre: "دراما",
  },
  {
    title: "El Kalam Ala Eh (Awel Leila)",
    titleAr: "الكلام على إيه (أول ليلة)",
    poster: "https://assets.voxcinemas.com/posters/P_HO00013129_1777639523794.jpg",
    slug: "el-kalam-ala-eh-awel-leila-arabic",
    genre: "كوميديا",
  },
  {
    title: "Bershama",
    titleAr: "برشامة",
    poster: "https://assets.voxcinemas.com/posters/P_HO00012959_1773660427800.jpg",
    slug: "bershama-arabic",
    genre: "كوميديا",
  },
  {
    title: "Hokum",
    titleAr: "هوكم",
    poster: "https://assets.voxcinemas.com/posters/P_HO00013119_1777016438423.jpg",
    slug: "hokum",
    genre: "دراما",
  },
  {
    title: "The Sheep Detectives",
    titleAr: "المحققون الأغنام",
    poster: "https://assets.voxcinemas.com/posters/P_HO00013015_1777639488079.jpg",
    slug: "the-sheep-detectives",
    genre: "مغامرة",
  },
  {
    title: "Deep Water",
    titleAr: "ديب ووتر",
    poster: "https://assets.voxcinemas.com/posters/P_HO00013080_1776336485839.jpg",
    slug: "deep-water",
    genre: "إثارة",
  },
  {
    title: "Super Mario Galaxy: The Movie",
    titleAr: "سوبر ماريو جالاكسي، الفيلم",
    poster: "https://assets.voxcinemas.com/posters/P_HO00012908_1774236922890.jpg",
    slug: "super-mario-galaxy-the-movie",
    genre: "رسوم متحركة",
  },
  {
    title: "Shabab Al Bomb 3",
    titleAr: "شباب البومب 3",
    poster: "https://assets.voxcinemas.com/posters/P_HO00012989_1773811164354.jpg",
    slug: "shabab-al-bomb-3",
    genre: "كوميديا",
  },
];

export default function Cinema() {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-foreground min-h-screen" dir="rtl">

      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-end overflow-hidden">
        <img
          src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/19d10f500_www_viariyadh_com_DSC_01376_f086307239_832682df.jpg"
          alt="سينما ڤيا رياض"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-16"
        >
          <span className="text-primary text-xs tracking-[0.35em] uppercase block mb-3">ڤيا رياض</span>
          <h1
            className="font-bold text-foreground"
            style={{ fontFamily: "'El Messiri', system-ui, sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            سينما ڤيا رياض
          </h1>
          <p className="text-muted-foreground mt-3 text-base max-w-lg">
            اكتشف أحدث الأفلام المعروضة في سينما ڤوكس داخل ڤيا رياض
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-secondary border-b border-border/20 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { label: "فيلم معروض", value: movies.length + "+" },
            { label: "قاعة سينما", value: "٨+" },
            { label: "تجربة مشاهدة", value: "IMAX & MAX" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-primary font-bold text-2xl md:text-3xl" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>{s.value}</div>
              <div className="text-muted-foreground text-xs tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Now Showing */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedElement>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-3">سينما ڤوكس</span>
                <h2 className="text-foreground text-3xl md:text-4xl font-bold" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                  يعرض حالياً
                </h2>
                <div className="w-12 h-px bg-primary mt-4" />
              </div>
              <Link
                to="/Booking?type=cinema"
                className="hidden md:flex items-center gap-2 text-primary text-xs tracking-widest uppercase border border-primary/40 px-5 py-2.5 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <span>احجز تذاكرك</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </AnimatedElement>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {movies.map((movie, i) => (
              <AnimatedElement key={i} delay={i * 60}>
                <a
                 href="#"
                 onClick={e => { e.preventDefault(); navigate(`/Booking?type=cinema&movie=${encodeURIComponent(movie.titleAr)}`); }}
                 className="group block"
                >
                  <div className="relative overflow-hidden aspect-[2/3] bg-secondary mb-3">
                    <img
                      src={movie.poster}
                      alt={movie.titleAr}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-secondary"><svg xmlns='http://www.w3.org/2000/svg' class='w-12 h-12 text-muted-foreground/30' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z'/></svg></div>`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="block text-white text-xs font-bold tracking-wide text-center">احجز تذاكرك</span>
                    </div>
                    <div className="absolute top-2 start-2">
                      <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 tracking-wider">{movie.genre}</span>
                    </div>
                  </div>
                  <h3
                    className="text-foreground text-sm font-bold leading-snug group-hover:text-primary transition-colors duration-300"
                    style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
                  >
                    {movie.titleAr}
                  </h3>
                </a>
              </AnimatedElement>
            ))}
          </div>

          <AnimatedElement delay={200}>
            <div className="text-center mt-12">
              <Link
                to="/Booking?type=cinema"
                className="inline-flex items-center gap-3 border border-primary/40 text-primary px-8 py-3.5 text-xs tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <span>احجز تذاكرك الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-20 px-6 border-t border-border/20">
        <div className="max-w-2xl mx-auto text-center">
          <Film className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-foreground text-3xl font-bold mb-4" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
            استمتع بتجربة سينمائية استثنائية
          </h2>
          <p className="text-muted-foreground mb-8">من IMAX إلى صالات VIP الفاخرة، عش كل لحظة بأسلوب لا مثيل له</p>
          <Link
            to="/Booking?type=cinema"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            <span>احجز تذاكرك الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}