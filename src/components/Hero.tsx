import { motion } from 'motion/react';
import { Sparkles, MessageSquareCode, Rocket, ArrowRight, Bot, Cpu, Globe, Gamepad2 } from 'lucide-react';

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-gradient-to-b from-[#0b0f19] via-[#0d1527] to-[#0b0f19]"
    >
      {/* Decorative Grid and Ambient Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-ring" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              id="hero-badge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold tracking-wider uppercase mx-auto lg:mx-0"
            >
              <Sparkles className="w-4.5 h-4.5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Gen Digital Crafting</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              id="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight"
            >
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">CLEV PRODUCTIONS</span>
              <span className="text-teal-400 text-2xl sm:text-3xl align-super">™</span>
            </motion.h1>

            <motion.p
              id="hero-tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 font-sans leading-relaxed"
            >
              We specialize in custom <strong className="text-white">AI Chatbots</strong> (fully equipped with file upload and advanced voice note transcription), bespoke high-performance <strong className="text-white">Websites</strong>, and tailored browser <strong className="text-white">Games</strong>. 
            </motion.p>

            {/* Core Pillars List */}
            <motion.div
              id="hero-pillars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <div className="p-1 rounded bg-teal-500/10 text-teal-400 mt-0.5">✔</div>
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Chatbots</h3>
                  <p className="text-xs text-gray-400">Files, Voice, Images</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">✔</div>
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Websites</h3>
                  <p className="text-xs text-gray-400">Responsive, Sleek, Fast</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-gray-900/40 border border-gray-800/60">
                <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">✔</div>
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Web Games</h3>
                  <p className="text-xs text-gray-400">Playable Retro & Custom</p>
                </div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              id="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                id="hero-btn-demo"
                onClick={() => onNavigate('chatbot-demo')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all duration-300 shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_30px_rgba(20,184,166,0.5)] hover:-translate-y-0.5"
              >
                <Bot className="w-5 h-5 text-slate-950" />
                <span>Launch Chatbot Demo</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                id="hero-btn-games"
                onClick={() => onNavigate('games')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-base font-bold bg-slate-900/80 border border-gray-800 hover:border-gray-700 text-gray-200 hover:text-white transition-all duration-300"
              >
                <Cpu className="w-5 h-5 text-teal-400" />
                <span>Enter Game Cabin</span>
              </button>
            </motion.div>
          </div>

          {/* Hero Right Visuals */}
          <div id="hero-right-visual" className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-sm sm:max-w-md bg-[#0e1626]/80 rounded-2xl border border-gray-800 p-6 shadow-2xl backdrop-blur-sm"
            >
              {/* Header bar of mock app */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="px-2.5 py-0.5 rounded bg-gray-800 text-[10px] font-mono text-gray-400">
                  clev_core_v1.0.0.sys
                </div>
              </div>

              {/* Stacked floating visual widgets showing services */}
              <div className="space-y-4">
                {/* AI Bot Widget */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 to-slate-950/40 border border-teal-500/20 shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <MessageSquareCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Custom AI Chatbots</h4>
                      <p className="text-xs text-gray-400">Files & Advanced Voice Note</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    SPECIALTY
                  </span>
                </motion.div>

                {/* Web Dev Widget */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-950/40 border border-emerald-500/20 shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">High-Speed Websites</h4>
                      <p className="text-xs text-gray-400">Portfolios, E-commerce & SaaS</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    SPECIALTY
                  </span>
                </motion.div>

                {/* Games Widget */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-950/40 border border-cyan-500/20 shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Interactive Web Games</h4>
                      <p className="text-xs text-gray-400">Custom playable titles</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    CUSTOM
                  </span>
                </motion.div>
              </div>

              {/* Small interactive element overlay */}
              <div className="mt-5 p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono text-gray-400">Client satisfaction rate</span>
                </div>
                <span className="text-[12px] font-bold font-mono text-teal-400">100% Guaranteed</span>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
