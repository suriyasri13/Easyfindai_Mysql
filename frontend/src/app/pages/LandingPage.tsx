import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Zap, ArrowRight, Brain } from 'lucide-react';
import TextType from '../components/ui/TextType';
import bgImage from '../../assets/background.png';
import Prism from '../components/ui/Prism';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden relative">
      
      {/* Premium Background with Image and Prism */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-110 animate-slow-zoom"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] z-10"></div>
        <div className="absolute inset-0 z-0 opacity-30">
           <Prism
            animationType="rotate"
            timeScale={0.3}
            height={4.5}
            baseWidth={6.5}
            scale={4.0}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
          />
        </div>
      </div>

      {/* Header / Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-slate-900/40 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-500">
              <Search className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">EaseFind<span className="text-blue-600">.AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#intelligence" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-colors">Intelligence</a>
            <a href="#protocols" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-colors">Protocols</a>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 active:scale-95">
              Join Protocol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-48 pb-32 lg:pt-64 lg:pb-48">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl">
            <Zap size={14} className="fill-blue-400 animate-pulse" />
            <span>Neural Reconciliation Engine v4.0</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter mb-10 leading-[1.05]">
            Recover what matters <br />
            <TextType 
              text={["faster than ever.", "with AI precision.", "across the campus.", "safely and securely."]}
              typingSpeed={70}
              pauseDuration={2000}
              deletingSpeed={40}
              showCursor={true}
              cursorCharacter="|"
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
            />
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            Advanced computer vision and neural matching to reunite lost belongings with their owners in record time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-32">
            <Link to="/register" className="w-full sm:w-auto bg-blue-600 text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-500/40 hover:bg-blue-500 hover:-translate-y-2 flex items-center justify-center gap-4 group active:scale-95">
              Submit Report <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto bg-white/5 backdrop-blur-xl text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all border border-white/10 hover:bg-white/10 flex items-center justify-center gap-4 shadow-xl active:scale-95">
              Explore Database
            </Link>
          </div>

          {/* Stats Grid */}
          <div id="protocols" className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto py-20 border-t border-white/5">
            {[
              { label: 'Security', val: '100%', sub: 'ENCRYPTED' },
              { label: 'Efficiency', val: 'INSTANT', sub: 'MATCHING' },
              { label: 'Intelligence', val: '99.9%', sub: 'ACCURACY' },
              { label: 'Scope', val: 'GLOBAL', sub: 'COVERAGE' }
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center group cursor-default">
                <span className="text-4xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors duration-500">{stat.val}</span>
                <span className="text-[10px] text-blue-400 uppercase tracking-[0.3em] font-black mt-2 opacity-60 group-hover:opacity-100 transition-opacity">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="intelligence" className="py-48 relative z-10 bg-slate-950/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 uppercase">Operational Excellence</h2>
            <p className="text-slate-400 text-xl font-medium leading-relaxed">Systematic reunification protocols powered by next-generation artificial intelligence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { 
                icon: <Brain size={36} />, 
                title: 'Neural Analysis', 
                desc: 'Deep learning models analyze item characteristics to identify potential matches with surgical precision.',
              },
              { 
                icon: <ShieldCheck size={36} />, 
                title: 'Secure Custody', 
                desc: 'Verification keys ensure that items are returned only to their verified legal owners.',
              },
              { 
                icon: <Zap size={36} />, 
                title: 'Real-time Sync', 
                desc: 'Instant notifications across all devices as soon as an intelligence match is detected.',
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-white/5 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/10 hover:-translate-y-4 transition-all duration-700 group shadow-2xl">
                <div className={`w-20 h-20 bg-blue-600/20 text-blue-400 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-500/20`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-tight group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-24 relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Search className="text-white h-6 w-6" />
            </div>
            <span className="text-3xl font-black tracking-tighter">EaseFind<span className="text-blue-600">.AI</span></span>
          </div>
          <div className="flex gap-12">
            {['Privacy', 'Terms', 'Network', 'Support'].map(link => (
              <a key={link} href="#" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{link}</a>
            ))}
          </div>
          <p className="text-slate-500 text-sm font-black uppercase tracking-widest">© {new Date().getFullYear()} Global Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
