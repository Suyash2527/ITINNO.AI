import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Map, Sparkles, Plane, Users, LayoutDashboard, Globe, Menu, X } from "lucide-react";
import { Auth } from "./Auth";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";

  const navLinks = [
    { to: "/", label: "Explore", icon: Map },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/community", label: "Community", icon: Users },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 md:py-6 ${isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-text/5" : ""}`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 bg-surface/80 backdrop-blur-md border border-text/10 px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-surface transition-colors group relative overflow-hidden">
            {/* Subtle glowing background effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            
            <motion.div 
              className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors relative z-10"
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </motion.div>
            <span className="text-lg md:text-xl font-serif tracking-widest text-text uppercase font-bold relative z-10">
              Itinno<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center bg-surface/80 backdrop-blur-md border border-text/10 rounded-full p-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-colors ${
                  location.pathname === link.to ? "bg-accent text-surface font-semibold" : "text-text hover:bg-text/5"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth (Desktop) */}
          <div className="hidden md:block">
            <Auth />
          </div>

          {/* Mobile Menu Toggle (Minimal) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text/60 hover:text-text transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Bottom Nav Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-surface/90 backdrop-blur-2xl border-t border-text/10 px-6 py-3 pb-8 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
      >
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-primary scale-110" : "text-text/40 hover:text-text/60"}`}
            >
              <div className={`p-2 rounded-xl ${isActive ? "bg-primary/10" : ""}`}>
                <link.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-0"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-text/40 hover:text-text/60 transition-all"
        >
          <div className="p-2 rounded-xl">
            <Users className="w-6 h-6 stroke-[1.5px]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0">
            Account
          </span>
        </button>
      </motion.div>

      {/* Mobile Side Nav / Account Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-surface border-l border-text/10 z-[110] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-text">Account</h3>
                  <p className="text-xs text-text/40 uppercase tracking-widest font-bold mt-1">Settings & Profile</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-background/50 rounded-2xl hover:bg-text/5 transition-colors"
                >
                  <X className="w-6 h-6 text-text" />
                </button>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-5 rounded-[1.5rem] transition-all border ${
                      location.pathname === link.to
                        ? "bg-primary/10 border-primary/20 text-primary font-bold"
                        : "bg-background/30 border-text/5 text-text/60 hover:bg-text/5"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${location.pathname === link.to ? "bg-primary/20" : "bg-text/5"}`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="text-lg">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-8 mt-auto border-t border-text/10">
                <div className="bg-background/50 p-6 rounded-[2rem] border border-text/5">
                  <Auth />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
