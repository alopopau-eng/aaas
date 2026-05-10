import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ChevronDown, ArrowLeft } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      dir="rtl"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/20 shadow-2xl py-2"
          : "bg-gradient-to-b from-background/90 to-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Right Nav (RTL) / Logo Area */}
        <div className="flex items-center gap-8 order-1">
          <Link to="/" className="flex items-center shrink-0 group">
            <img
              src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/6aa83a55c_strapi_viariyadh_com_logo_colore_horizontal_3a985d9e4a_1baadbb966_36690a39.svg"
              alt="ڤيا رياض"
              className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "inline";
              }}
            />
            <span
              className="font-bold text-2xl text-primary tracking-wider"
              style={{ display: "none", fontFamily: "'El Messiri', system-ui, sans-serif" }}
            >
              ڤيا رياض
            </span>
          </Link>
        </div>

        {/* Center Nav */}
        <nav className="hidden lg:flex items-center gap-5 order-2">
          {[
            { label: "الفندق", to: "/Stay" },
            { label: "المطاعم", to: "/Dine" },
            { label: "التسوق", to: "#" },
            { label: "السينما", to: "#" },
            { label: "خدمات الضيوف", to: "#" },
            { label: "المناسبات", to: "#" },
            { label: "قصتنا", to: "#" },
            { label: "الخريطة", to: "#" },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="relative text-sm text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap group"
              style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Left Actions (RTL) */}
        <div className="hidden lg:flex items-center gap-6 order-3">
          <a href="#" className="text-xs font-semibold text-foreground hover:text-primary transition-colors duration-300 tracking-widest uppercase">
            العربية
          </a>
          
          <div className="relative">
            <button
              onClick={() => setContactOpen(!contactOpen)}
              className="flex items-center gap-2 text-sm text-primary group"
              style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
            >
              <span className="relative overflow-hidden">
                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">اتصل بنا</span>
                <span className="absolute left-0 top-0 inline-block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-primary-foreground bg-primary px-2">اتصل بنا</span>
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${contactOpen ? "rotate-180" : ""}`} />
            </button>

            {contactOpen && (
              <div className="absolute top-full end-0 mt-6 w-[350px] bg-background/95 backdrop-blur-xl border border-primary/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-50 p-8 transform origin-top-left animate-in fade-in slide-in-from-top-4 duration-300" dir="rtl">
                <h6 className="text-foreground text-xl font-bold mb-6 pb-4 border-b border-border/30" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
                  تواصل مع ڤيا رياض
                </h6>
                <div className="space-y-6 mb-8">
                  <div className="group">
                    <div className="text-primary text-xs tracking-widest mb-1 uppercase">الاستفسارات العامة</div>
                    <a href="mailto:info@viariyadh.com" className="text-foreground text-sm group-hover:text-primary transition-colors">info@viariyadh.com</a>
                  </div>
                  <div className="group">
                    <div className="text-primary text-xs tracking-widest mb-1 uppercase">استفسارات التأجير</div>
                    <a href="mailto:leasing@viariyadh.com" className="text-foreground text-sm group-hover:text-primary transition-colors">leasing@viariyadh.com</a>
                  </div>
                  <div className="group">
                    <div className="text-primary text-xs tracking-widest mb-1 uppercase">الهاتف</div>
                    <a href="tel:+966920001819" className="text-foreground text-sm block mb-1 group-hover:text-primary transition-colors">+966 92 000 1819</a>
                    <span className="text-muted-foreground text-xs leading-relaxed block mt-2">2941 الهدا, طريق مكة المكرمة, الرياض</span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {[
                    { label: "احجز خدمة", to: "#" },
                    { label: "احجز إقامتك", to: "#" },
                    { label: "احجز مطعم", to: "/Booking" },
                    { label: "احجز سينما", to: "#" }
                  ].map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.to}
                      onClick={() => setContactOpen(false)}
                      className="flex items-center justify-between group p-3 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                    >
                      <span className="text-foreground text-sm font-medium group-hover:text-primary transition-colors">{link.label}</span>
                      <ArrowLeft className="w-4 h-4 text-primary transform transition-transform duration-300 group-hover:-translate-x-2" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden order-3">
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-transparent hover:text-primary transition-colors">
              <Menu className="w-8 h-8 stroke-[1.5]" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-l border-border/20 w-[85vw] sm:w-96 p-0" dir="rtl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-border/10">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/6aa83a55c_strapi_viariyadh_com_logo_colore_horizontal_3a985d9e4a_1baadbb966_36690a39.svg"
                    alt="ڤيا رياض"
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-foreground hover:text-primary transition-colors">
                  <X className="w-6 h-6 stroke-[1.5]" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-2">
                {[
                  { label: "الصفحة الرئيسية", to: "/" },
                  { label: "الفندق", to: "/Stay" },
                  { label: "المطاعم", to: "/Dine" },
                  { label: "التسوق", to: "#" },
                  { label: "السينما", to: "#" },
                  { label: "خدمات الضيوف", to: "#" },
                  { label: "المناسبات", to: "#" },
                  { label: "قصتنا", to: "#" },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-light text-foreground hover:text-primary py-3 transition-colors flex items-center justify-between group"
                    style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}
                  >
                    <span>{item.label}</span>
                    <ArrowLeft className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                ))}
              </nav>

              <div className="p-6 bg-secondary/30 border-t border-border/10">
                <a href="tel:+966920001819" className="flex items-center gap-4 text-foreground hover:text-primary transition-colors mb-4 group">
                  <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-lg" dir="ltr">+966 92 000 1819</span>
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {contactOpen && (
        <div className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm" onClick={() => setContactOpen(false)} />
      )}
    </header>
  );
}