import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border/20" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Logos */}
          <div className="space-y-6">
            <Link to="/">
              <img
                src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/6aa83a55c_strapi_viariyadh_com_logo_colore_horizontal_3a985d9e4a_1baadbb966_36690a39.svg"
                alt="ڤيا رياض"
                className="h-10 w-auto object-contain mb-4"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "block";
                }}
              />
              <span className="text-primary font-bold text-xl" style={{ display: "none", fontFamily: "'El Messiri', system-ui, sans-serif" }}>ڤيا رياض</span>
            </Link>
            <img
              src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/9803bb037_www_viariyadh_com_RC_Logo_8e1559f33c_835e72e250_63bc8f3b.webp"
              alt="Riyadh Commission"
              className="h-14 w-auto object-contain opacity-80"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <nav className="flex flex-col gap-2 mt-4">
              <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200">الصفحة الرئيسية</Link>
              <Link to="/Stay" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200">الفندق</Link>
              <Link to="/Dine" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200">المطاعم</Link>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200">التسوق</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200">السينما</a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200">قصتنا</a>
            </nav>
          </div>

          {/* Social & App */}
          <div>
            <strong className="text-foreground text-sm tracking-wider block mb-5 uppercase" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
              تابعنا على وسائل التواصل الإجتماعي
            </strong>
            <div className="flex items-center gap-4 mb-8">
              <a href="https://www.facebook.com/viariyadh/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <img
                  src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/91bc6235a_strapi_viariyadh_com_Social_facebook_d108b63de4_5b95bd5561_8a68f8c3.svg"
                  alt="Facebook"
                  className="w-6 h-6 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "block"; }}
                />
                <Facebook className="w-5 h-5" style={{ display: "none" }} />
              </a>
              <a href="https://instagram.com/viariyadh" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <img
                  src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/f7e7b9874_strapi_viariyadh_com_Social_instagram_84ae6c76a8_c4c4372516_84770678.svg"
                  alt="Instagram"
                  className="w-6 h-6 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "block"; }}
                />
                <Instagram className="w-5 h-5" style={{ display: "none" }} />
              </a>
              <a href="https://twitter.com/viariyadh" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <img
                  src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/7d88b74a7_strapi_viariyadh_com_Social_twitter_a187a57762_09d526bf13_43814673.svg"
                  alt="Twitter"
                  className="w-6 h-6 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "block"; }}
                />
                <Twitter className="w-5 h-5" style={{ display: "none" }} />
              </a>
            </div>
            <strong className="text-foreground text-sm tracking-wider block mb-4 uppercase" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
              قم بتحميل تطبيق ڤيا رياض
            </strong>
            <div className="flex gap-3 flex-wrap">
              <a href="https://apps.apple.com/us/app/via-riyadh/id1660007911" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/3ad0994d0_www_viariyadh_com_appstore_bd1a7d627a_d086098551_bbd292a0.jpg"
                  alt="App Store"
                  className="h-10 w-auto object-contain rounded opacity-90 hover:opacity-100 transition-opacity"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=sa.sela.viariyadh" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://media.base44.com/images/public/69ffa3030b658fe6093efead/a1b2702ed_www_viariyadh_com_playstore_4101b70d8b_2451e16449_8bd8ad57.jpg"
                  alt="Google Play"
                  className="h-10 w-auto object-contain rounded opacity-90 hover:opacity-100 transition-opacity"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <strong className="text-foreground text-sm tracking-wider block mb-5 uppercase" style={{ fontFamily: "'El Messiri', system-ui, sans-serif" }}>
              تواصل مع ڤيا رياض
            </strong>
            <div className="space-y-4">
              <div>
                <div className="text-muted-foreground text-xs mb-1">الاستفسارات العامة</div>
                <a href="mailto:info@viariyadh.com" className="text-primary text-sm hover:underline flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span>info@viariyadh.com</span>
                </a>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">استفسارات التأجير</div>
                <a href="mailto:leasing@viariyadh.com" className="text-primary text-sm hover:underline flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span>leasing@viariyadh.com</span>
                </a>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>2941, الهدا, 12912 - 8415<br />الرياض، المملكة العربية السعودية</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+966920001819" className="hover:text-primary transition-colors">+966 92 000 1819</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">© ڤيا رياض 2025</span>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground text-xs hover:text-primary transition-colors duration-200">سياسة الخصوصية</a>
            <a href="#" className="text-muted-foreground text-xs hover:text-primary transition-colors duration-200">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}