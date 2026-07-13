import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatDemo from './components/ChatDemo';
import Portfolio from './components/Portfolio';
import GameCabin from './components/GameCabin';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');

  // Smooth scroll helper
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      // Offset for navbar
      const navbarOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Track scroll position to set active nav links automatically
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      
      const sections = ['hero-section', 'chatbot-demo', 'websites', 'games', 'contact'];
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            // map section element ids to navbar item ids
            if (sectionId === 'hero-section') {
              setActiveSection('hero');
            } else {
              setActiveSection(sectionId);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="app-root" className="min-h-screen flex flex-col justify-between selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Header Navigation */}
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero onNavigate={handleNavigate} />
        
        {/* Specialty 1: AI Chatbot Simulator */}
        <ChatDemo />

        {/* Specialty 2: Website Portfolios */}
        <Portfolio />

        {/* Specialty 3: Playable Web Games Cabin */}
        <GameCabin />

        {/* Contact Section */}
        <Contact />
      </main>

      {/* Footer Branding & Copyrights */}
      <Footer />

    </div>
  );
}
