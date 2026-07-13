import { Sparkles, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleEmailClick = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=cleverlyproduction@gmail.com&su=Inquiry&body=Hi%20CLEV%20PRODUCTIONS!', '_blank');
  };

  return (
    <footer id="footer" className="bg-[#070a12] border-t border-gray-900/60 py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Trademark */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[#070a12] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white uppercase">
              CLEV<span className="text-teal-400 font-medium"> Productions</span>
              <span className="text-[10px] font-semibold align-super text-teal-500">™</span>
            </span>
          </div>

          {/* Quick email display */}
          <button 
            id="footer-btn-email"
            onClick={handleEmailClick}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 hover:text-teal-400 text-xs text-gray-400 font-mono transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>cleverlyproduction@gmail.com</span>
          </button>

          {/* Copyright */}
          <p className="text-xs text-gray-500 font-mono">
            &copy; {currentYear} CLEV PRODUCTIONS&trade;. Coded with extreme precision. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
