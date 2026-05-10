import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Hotel, UtensilsCrossed, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const DestinationEntity = base44.entities.Destination;

const AnimatedElement = ({ children, className, delay = 0, animation = "fade-up" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { 
        setTimeout(() => setIsVisible(true), delay); 
        observer.unobserve(el); 
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  let animClass = "";
  if (animation === "fade-up") animClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12";
  if (animation === "fade-in") animClass = isVisible ? "opacity-100" : "opacity-0";
  if (animation === "slide-right") animClass = isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12";
  if (animation === "slide-left") animClass = isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12";

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${animClass} ${className || ""}`}>
      {children}
    </div>
  );
};

// Custom Button Component matching the screenshot's luxury aesthetic
const LuxuryButton = ({ href, to, children, className = "" }) => {
  const inner = (
    <div className={`inline-flex items-stretch bg-background/50 backdrop-blur-sm border border-primary/30 hover:border-primary transition-colors duration-500 group ${className}`}>
      <span className="flex items-center px-6 text-sm font-bold tracking-widest text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
        {children}
      </span>
      <div className="w-12 border-r border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 overflow-hidden relative">
        <ArrowLeft className="w-4 h-4 text-primary group-hover:text-primary-foreground transform translate-x-8 group-hover:translate-x-0 transition-transform duration-500 absolute" />
        <ArrowLeft className="w-4 h-4 text-primary group-hover:text-primary-foreground transform translate-x-0 group-hover:-translate-x-8 transition-transform duration-500" />
      </div>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return <a href={href}>{inner}</a>;
};

function HeroSection() {
  return (
    <section className="relative w-full h-[100svh] bg-background">
      {/* Background Image with slow zoom */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/c2acbafd3_www_viariyadh_com_Homepage_07e9861f19_eaa5632f52_029b2f9b.webp"
          alt="عصر الفخامة الجديد"
          className="w-full h-full object-cover object-center animate-[slowZoom_20s_ease-in-out_infinite_alternate]"
        />
      </div>
      
      {/* Dark gradient overlays for contrast & mood */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/95" />
      <div className="absolute inset-0 bg-background/30 mix-blend-multiply" />
      
      {/* Decorative floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-[floatA_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-[floatB_14s_ease-in-out_infinite_reverse]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-5xl mx-auto"
      >
        <motion.span 
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-primary text-xs md:text-sm font-semibold uppercase mb-6 block" 
        >
          الوجهة: ڤيا رياض
        </motion.span>
        
        <h1
          className="text-foreground font-bold leading-tight mb-12 drop-shadow-2xl"
          style={{ fontFamily: "'El Messiri', system-ui, sans-serif", fontSize: "clamp(3rem, 10vw, 6rem)" }}
        >
          عصر الفخامة الجديد
        </h1>
        
      </motion.div>

      {/* Bouncing Down Arrow Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 cursor-pointer hover:text-primary transition-colors text-foreground/50"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <ChevronDown className="w-8 h-8 animate-[bounceDown_2s_infinite]" />
      </motion.div>
    </section>
  );
}

function ExploreSection() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    DestinationEntity.list().then(setDestinations).catch(() => {});
  }, []);

  const staticFallback = [
    { title: "مطاعم ڤيا رياض", subtitle: "مطاعم عالمية", link: "/Dine", link_text: "المزيد عن المطاعم", image_url: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/4ddb85a07_www_viariyadh_com_explore_desktop_dine_60eba179ba_53d63d1d4c_a9c7513a.webp" },
    { title: "متاجر ڤيا رياض", subtitle: "علامات راقية", link: "#", link_text: "المزيد عن المتاجر", image_url: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/3ae9bf98a_www_viariyadh_com_explore_desktop_shop_c75c1e6670_3ce44143fb_f085184378_ad643c19.webp" },
    { title: "سينما ڤيا رياض", subtitle: "تجربة استثنائية", link: "#", link_text: "المزيد عن السينمات الفريدة", image_url: "https://media.base44.com/images/public/69ffa3030b658fe6093efead/19d10f500_www_viariyadh_com_DSC_01376_f086307239_832682df.jpg" },
  ];

  const items = destinations.length > 0 ? destinations : staticFallback;

  return (
    <section className="bg-background py-32 px-4 relative" dir="rtl">
      {/* Decorative background lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "100px 100%" }} />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <AnimatedElement>
          <div className="text-center mb-20">
            <span className="text-primary text-xs md:text-sm tracking-[0.3em] uppercase block mb-4">
              اكتشف وجهة ڤيا رياض
            </span>
            <div className="w-16 h-[1px] bg-primary/50 mx-auto" />
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {items.map((item, index) => (
            <AnimatedElement key={item.id || index} delay={index * 150} animation="fade-up">
              <div className="group relative cursor-pointer block h-full">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-700" />
                  
                  {/* Subtle border reveal on hover */}
                  <div className="absolute inset-4 border border-primary/0 group-hover:border-primary/30 transition-colors duration-700 pointer-events-none" />
                </div>
                
                <div className="absolute bottom-0 inset-x-0 p-8 lg:p-12 flex flex-col items-center text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                  <span className="text-primary/80 text-xs tracking-[0.2em] font-semibold uppercase block mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    {item.subtitle}
                  </span>
                  <h3 className="text-foreground text-2xl lg:text-3xl font-bold mb-8" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                    {item.title}
                  </h3>
                  
                  <LuxuryButton to={item.link === "/Dine" ? "/Dine" : "#"} className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    {item.link_text}
                  </LuxuryButton>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section className="bg-background py-24 lg:py-32 overflow-hidden relative" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-0 relative">
          
          {/* Text Content Box (Right side in RTL, Overlapping) */}
          <AnimatedElement className="lg:col-start-1 lg:col-span-6 xl:col-span-5 relative z-20" animation="slide-right">
            <div className="bg-secondary p-10 md:p-16 lg:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-sm relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] before:from-primary/10 before:to-transparent before:pointer-events-none">
              <span className="text-primary text-xs tracking-[0.3em] font-bold uppercase block mb-6">
                الوجهة - ڤيا رياض
              </span>
              <h3
                className="text-foreground text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.2] mb-8"
                style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
              >
                ابحث عن المكان الذي تريد الذهاب إليه
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md">
                ستوضح لك خريطتنا التفاعلية الطريق إلى المتاجر والمطاعم التي تريد رؤيتها.
              </p>
              <LuxuryButton href="#">
                عرض اﻟﺨﺮﻳﻄﺔ اﻟﺘﻔﺎﻋﻠﻴﺔ
              </LuxuryButton>
            </div>
          </AnimatedElement>

          {/* Image (Left side in RTL) */}
          <AnimatedElement className="lg:col-start-5 lg:col-span-8 relative z-10" delay={200} animation="fade-in">
            <div className="relative aspect-square lg:aspect-[4/3] overflow-hidden">
              <div className="absolute inset-0 bg-background/20 z-10" />
              <img
                src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/def03166d_www_viariyadh_com_Mapa_19afd6e1af_0df447dbb1_b474f2d1.webp"
                alt="خريطة ڤيا رياض"
                className="w-full h-full object-cover object-center filter grayscale-[30%] contrast-[1.2] hover:grayscale-0 hover:scale-105 transition-all duration-[2s]"
              />
            </div>
          </AnimatedElement>

        </div>
      </div>
    </section>
  );
}

function HotelSection() {
  return (
    <section className="bg-background py-24 lg:py-32 overflow-hidden relative" dir="rtl">
      {/* Background glow to differentiate from Map section */}
      <div className="absolute top-1/2 right-0 w-[50vw] h-[50vw] -translate-y-1/2 translate-x-1/4 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-0 relative">
          
          {/* Image (Right side in RTL) */}
          <AnimatedElement className="lg:col-start-1 lg:col-span-8 relative z-10 order-2 lg:order-1" delay={200} animation="fade-in">
            <div className="relative aspect-[4/3] lg:aspect-video overflow-hidden">
              <div className="absolute inset-0 bg-background/20 z-10" />
              <img
                src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/f05b64c4c_www_viariyadh_com_Deluxe_Double_Room_40e249cc77_83195fa0.jpg"
                alt="فندق سانت ريجس"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-[2s]"
              />
            </div>
          </AnimatedElement>

          {/* Text Content Box (Left side in RTL, Overlapping) */}
          <AnimatedElement className="lg:col-start-7 lg:col-span-6 relative z-20 order-1 lg:order-2 lg:-ml-12" animation="slide-left">
            <div className="bg-secondary p-10 md:p-16 lg:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-sm">
              <span className="text-primary text-xs tracking-[0.3em] font-bold uppercase block mb-6">
                انغمس في رفاهية الاقامة
              </span>
              <h3
                className="text-foreground text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.2] mb-8"
                style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
              >
                فندق سانت ريجس في ڤيا رياض
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md">
                سانت ريجيس الرياض تقدم الفخامة بكل معنى الكلمة في كل لحظة. إنها تجربة فريدة من نوعها في الرياض.
              </p>
              <LuxuryButton to="/Stay">
                عرض الغرف
              </LuxuryButton>
            </div>
          </AnimatedElement>

        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="relative bg-background pt-32" dir="rtl">
      {/* Top Image Hero Area */}
      <div className="max-w-[1600px] mx-auto px-4 relative z-0">
        <AnimatedElement animation="fade-in">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
             <div className="absolute inset-0 bg-background/30 mix-blend-multiply z-10 pointer-events-none" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-80" />
             <img
                src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/af5704e90_www_viariyadh_com_Our_heritage_ace712fb87_f692a56b2f_964e66dd.webp"
                alt="The VIA Riyadh story"
                className="w-full h-full object-cover object-center"
             />
          </div>
        </AnimatedElement>
      </div>

      {/* Bottom Overlapping Tan Area */}
      <div className="w-full bg-card relative z-10 mt-[-100px] md:mt-[-200px] pt-[150px] md:pt-[250px] pb-32 px-4 border-t border-primary/20">
        {/* Subtle pattern overlay on the tan bg */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_hsl(var(--foreground))_1px,_transparent_1px)] bg-[length:32px_32px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-20 flex justify-center">
          <AnimatedElement animation="fade-up" delay={200} className="w-full">
            {/* The Floating Content Box */}
            <div className="bg-background/95 backdrop-blur-md p-12 md:p-20 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-primary/20 mt-[-250px] md:mt-[-350px]">
               <span className="text-primary text-xs md:text-sm tracking-[0.3em] font-bold uppercase block mb-6" dir="ltr">
                  THE VIA RIYADH STORY
               </span>
               <h3
                  className="text-foreground text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-12 max-w-2xl mx-auto"
                  style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
                  dir="ltr"
               >
                  The world's premier destination for experiencing luxury, steeped in local tradition and heritage.
               </h3>
               
               <div className="flex justify-center" dir="ltr">
                  <LuxuryButton href="#">
                    Discover our story
                  </LuxuryButton>
               </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.05); }
          66% { transform: translate(20px, -40px) scale(0.95); }
        }
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        @keyframes bounceDown {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-7px); }
        }
      `}</style>
      <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 selection:text-primary" dir="rtl">
        <HeroSection />
        <ExploreSection />
        <MapSection />
        <HotelSection />
        <StorySection />
      </div>
    </>
  );
}