import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Globe, Gamepad2, Mail, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export default function Navbar({ onNavigate, activeSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'chatbot-demo', label: 'AI Chatbots', icon: MessageSquare },
    { id: 'websites', label: 'Website Making', icon: Globe },
    { id: 'games', label: 'Game Cabin', icon: Gamepad2 },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0b0f19]/90 backdrop-blur-md border-b border-gray-800/80 py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            id="nav-logo"
            onClick={() => handleItemClick('hero')} 
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-[1px] shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <div className="flex items-center justify-center w-full h-full bg-[#0b0f19] rounded-[11px] transition-all duration-300 group-hover:bg-[#0e1626]">
                <Sparkles className="w-5 h-5 text-teal-400 transition-transform duration-500 group-hover:rotate-12" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-gray-100 to-teal-400 bg-clip-text text-transparent">
              CLEV<span className="text-teal-400 font-medium"> PRODUCTIONS</span>
              <span className="text-xs font-semibold align-super ml-0.5 text-teal-500">™</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div id="desktop-menu" className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5 hover:text-teal-300 ${
                    isActive ? 'text-teal-400 bg-teal-500/10 border-b-2 border-teal-500 rounded-b-none' : 'text-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-gray-400 group-hover:text-teal-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Contact Us Button */}
            <button
              id="nav-btn-contact"
              onClick={() => handleItemClick('contact')}
              className="ml-4 flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 transition-all duration-300 shadow-[0_4px_14px_rgba(20,184,166,0.4)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.6)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Mail className="w-4 h-4 text-slate-950" />
              <span>Contact Us</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div id="mobile-menu-btn-container" className="md:hidden flex items-center">
            <button
              id="mobile-toggle-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-[#0c1221] border-b border-gray-800"
          >
            <div id="mobile-drawer-content" className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    id={`mobile-nav-item-${item.id}`}
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'text-teal-400 bg-teal-500/10 border-l-4 border-teal-500'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                id="mobile-nav-btn-contact"
                onClick={() => handleItemClick('contact')}
                className="flex items-center justify-center space-x-2 w-full mt-4 px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 transition-all shadow-lg"
              >
                <Mail className="w-5 h-5 text-slate-950" />
                <span>Contact Us</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
