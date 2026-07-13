import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Smartphone, Laptop, CheckCircle2, ArrowUpRight, Code } from 'lucide-react';

interface Project {
  title: string;
  category: string;
  description: string;
  tech: string[];
  image: string;
}

export default function Portfolio() {
  const [selectedView, setSelectedView] = useState<'desktop' | 'mobile'>('desktop');

  const projects: Project[] = [
    {
      title: "OmniStore E-Commerce",
      category: "E-Commerce Integration",
      description: "A lightning-fast shopping experience featuring instant search, filter presets, integrated stripe checkout, and a highly responsive multi-page admin panel.",
      tech: ["React 19", "Tailwind v4", "Stripe SDK", "Vite"],
      image: "https://picsum.photos/seed/omnistore/800/500"
    },
    {
      title: "SaaS Analytics Dashboard",
      category: "Dashboard & Tooling",
      description: "Real-time user monitoring console using interactive Recharts nodes, multiple coordinate tables, fluid transition views, and lazy loading modules.",
      tech: ["TypeScript", "Recharts", "Node.js", "Express"],
      image: "https://picsum.photos/seed/saas-dashboard/800/500"
    },
    {
      title: "Vortex Gaming Hub",
      category: "Interactive Landing Page",
      description: "A highly immersive, dark-themed editorial landing page for an esports platform, packed with custom WebGL animations, parallax banners, and dynamic bracket fixtures.",
      tech: ["React", "Motion", "Tailwind CSS", "Canvas API"],
      image: "https://picsum.photos/seed/vortex/800/500"
    }
  ];

  return (
    <section id="websites" className="py-24 bg-[#0a0d16] relative border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Globe className="w-3.5 h-3.5" />
              <span>Website Making</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Bespoke Digital Portals Coded For All Devices
            </h2>
            <p className="mt-4 text-gray-400 font-sans text-sm sm:text-base max-w-2xl">
              We engineer custom web platforms from scratch. No clunky template builders. Every line of code is handwritten to guarantee ultimate speed, flawless responsive layouts for mobile phones, and superior search engine optimization (SEO).
            </p>
          </div>

          {/* Device Mock Controls */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="inline-flex rounded-xl bg-gray-900 border border-gray-800 p-1">
              <button
                id="viewport-desktop-btn"
                onClick={() => setSelectedView('desktop')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedView === 'desktop' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Desktop View</span>
              </button>
              <button
                id="viewport-mobile-btn"
                onClick={() => setSelectedView('mobile')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedView === 'mobile' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Grid of Portfolios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              id={`portfolio-card-${idx}`}
              whileHover={{ y: -6 }}
              key={project.title}
              className="bg-[#0e1424] rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl flex flex-col group"
            >
              
              {/* Project Image Shell simulating Desktop or Mobile screen ratio */}
              <div className="relative overflow-hidden bg-slate-950 flex items-center justify-center p-3 h-56 transition-all duration-300">
                
                {/* Dynamic Responsive Frame Wrapper */}
                <div 
                  className={`relative overflow-hidden rounded-lg shadow-2xl transition-all duration-500 ease-out border border-gray-800 ${
                    selectedView === 'mobile' ? 'w-[160px] h-full' : 'w-full h-full'
                  }`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {selectedView === 'mobile' && (
                    <div className="absolute inset-x-0 top-0 h-4 bg-black/90 flex items-center justify-center">
                      <div className="w-12 h-1 bg-white/20 rounded-full" />
                    </div>
                  )}
                </div>

                <div className="absolute top-4 left-4 bg-teal-500/95 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  {project.category}
                </div>
              </div>

              {/* Card Copy */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-teal-300 transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech tags */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map(tag => (
                      <span key={tag} className="text-[10px] font-mono bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Core Guarantee */}
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-mono border-t border-gray-800/60 pt-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Responsive Layout • Touch Optimized</span>
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Feature Bento Grid Summary */}
        <div id="website-features-grid" className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0e1424]/40 border border-gray-800/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <Code className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-display font-bold text-white text-sm">Semantic & Clean</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Zero fluff, semantic TypeScript architectures configured with Vite for peak compilation benchmarks.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1424]/40 border border-gray-800/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-display font-bold text-white text-sm">Mobile First Priority</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Painstakingly styled with responsive breakpoints, fluid layout grids, and optimized mobile touch feedback.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1424]/40 border border-gray-800/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-display font-bold text-white text-sm">Lightning PageSpeeds</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Every asset compressed, custom asset delivery routes, and lazy loading to hit near-perfect Web Vitals scores.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1424]/40 border border-gray-800/40 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-display font-bold text-white text-sm">SEO Built-In</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Structured JSON-LD schema headers, customized sitemaps, and optimized search metadata in standard configurations.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
