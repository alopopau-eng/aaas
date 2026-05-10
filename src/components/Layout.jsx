import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { trackVisitor, markVisitorOffline } from "@/lib/visitorTracker";

export default function Layout() {
  useEffect(() => {
    trackVisitor();

    const handleOffline = () => markVisitorOffline();
    window.addEventListener("beforeunload", handleOffline);
    return () => {
      window.removeEventListener("beforeunload", handleOffline);
    };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden" dir="rtl">
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}