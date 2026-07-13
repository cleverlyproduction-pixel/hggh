import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, Send, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { ContactFormData } from '../types';

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    projectType: 'chatbot',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitted(true);
    triggerGmailCompose();
  };

  const triggerGmailCompose = () => {
    setIsRedirecting(true);
    
    // Construct rich email fields
    const subject = encodeURIComponent(`Hi CLEV PRODUCTIONS! Project Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Hi CLEV PRODUCTIONS,\n\n` +
      `My name is ${formData.name} (${formData.email}). I am writing to "give you a hi" and inquire about your custom services!\n\n` +
      `Project Category: ${formData.projectType.toUpperCase()}\n\n` +
      `Project Scope:\n${formData.message}\n\n` +
      `Looking forward to collaborating with CLEV!\n\n` +
      `Best regards,\n${formData.name}`
    );

    // Desktop Friendly Gmail Web Direct Compose
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=cleverlyproduction@gmail.com&su=${subject}&body=${body}`;
    // Fallback standard mailto
    const mailtoUrl = `mailto:cleverlyproduction@gmail.com?subject=${subject}&body=${body}`;

    // Try opening Gmail Web first, then mailto as fallback
    setTimeout(() => {
      // Open in a new tab
      window.open(gmailWebUrl, '_blank');
      setIsRedirecting(false);
    }, 1200);
  };

  const directHiCompose = () => {
    const subject = encodeURIComponent("Hi CLEV PRODUCTIONS!");
    const body = encodeURIComponent("Hi CLEV PRODUCTIONS,\n\nI wanted to reach out and say hi! I am interested in building a chatbot / website / game with you.");
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=cleverlyproduction@gmail.com&su=${subject}&body=${body}`;
    
    window.open(gmailWebUrl, '_blank');
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-[#0b0f19] to-[#070a12] relative border-t border-gray-900">
      {/* Decorative ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Give us a hi card */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                <span>Contact US</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                Give us a hi! Let's build together.
              </h2>
              
              <p className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed">
                Have a customized chatbot, high-fidelity website, or playable web game in mind? Say hi! When you tap submit or our direct email button, it opens Gmail pre-drafted to <strong className="text-white">cleverlyproduction@gmail.com</strong>.
              </p>
            </div>

            {/* Direct Connect Card */}
            <div className="p-6 rounded-2xl bg-[#0e1626]/80 border border-gray-800 space-y-4 shadow-xl">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest block">
                Direct Gmail Launcher
              </span>
              
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Corporate Email:</span>
                <span className="text-base sm:text-lg font-mono font-bold text-white block truncate select-all">
                  cleverlyproduction@gmail.com
                </span>
              </div>

              <button
                id="btn-direct-gmail"
                onClick={directHiCompose}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold bg-gray-900 border border-gray-800 hover:border-gray-700 text-teal-400 hover:text-teal-300 hover:bg-gray-800/40 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Just say "Hi" in Gmail</span>
              </button>
            </div>

            {/* Quick Guarantees list */}
            <div className="space-y-3.5">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>24-Hour initial response guaranteed</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>Bespoke custom specification drafts</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>100% Secure communication</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-[#0e1626]/40 border border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  id="contact-form"
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-gray-800 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/70 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Your Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-gray-800 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/70 transition-all"
                      />
                    </div>
                  </div>

                  {/* Project Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Specialty Choice</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'chatbot', label: 'AI Chatbot' },
                        { id: 'website', label: 'Website' },
                        { id: 'game', label: 'Custom Game' },
                        { id: 'other', label: 'Saying Hi' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, projectType: item.id as any }))}
                          className={`py-3 rounded-xl text-xs font-bold border transition-all text-center ${
                            formData.projectType === item.id
                              ? 'bg-teal-500/10 border-teal-500 text-teal-400 shadow'
                              : 'bg-slate-950/40 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message details */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Project details / Greeting</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Give us a hi! Tell us what awesome chatbot, website, or game you would like to make depending on your choice..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-gray-800 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/70 transition-all resize-none"
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    id="btn-form-submit"
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all duration-300 shadow-lg cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Send & Compose in Gmail</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  id="submit-success-panel"
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-white text-xl">Draft Created!</h3>
                    <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                      We have compiled your data and drafted your inquiry template. Redirecting you to compose in Gmail to complete your message to <strong className="text-white">cleverlyproduction@gmail.com</strong>...
                    </p>
                  </div>

                  {isRedirecting && (
                    <div className="flex items-center justify-center space-x-2 text-xs text-teal-400 font-mono">
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      <span>Opening Secure Tab...</span>
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      id="btn-trigger-manual-compose"
                      onClick={triggerGmailCompose}
                      className="px-5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-teal-400 font-bold text-xs hover:border-gray-700 hover:text-teal-300 transition-all flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Manual Redirect</span>
                    </button>
                    <button
                      id="btn-edit-again"
                      onClick={() => setIsSubmitted(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-950 text-gray-400 font-bold text-xs hover:text-white transition-all border border-gray-900"
                    >
                      <span>Edit Information</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          
        </div>

      </div>
    </section>
  );
}
