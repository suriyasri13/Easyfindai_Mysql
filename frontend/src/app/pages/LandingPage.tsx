import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Zap, ArrowRight, Brain } from 'lucide-react';
import TextType from '../components/ui/TextType';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1e293b] overflow-x-hidden">
      {/* Top Accent Line */}
      <div className="fixed top-0 left-0 w-full h-2 bg-blue-600 z-[60]"></div>
      
      {/* Floating Lines Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="absolute w-full h-full opacity-[0.05] animate-wave" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,20 Q25,10 50,20 T100,20" fill="none" stroke="#2563eb" strokeWidth="0.1" />
          <path d="M0,50 Q25,40 50,50 T100,50" fill="none" stroke="#2563eb" strokeWidth="0.1" />
          <path d="M0,80 Q25,70 50,80 T100,80" fill="none" stroke="#2563eb" strokeWidth="0.1" />
        </svg>

        {/* Animated Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Header / Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-500">
              <Search className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#1e293b]">EaseFind<span className="text-blue-600">.AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Intelligence', 'Protocols', 'Hotspots', 'Verification'].map((item) => (
              <a key={item} href="#" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 active:scale-95">
              Join Protocol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-48 pb-32 lg:pt-64 lg:pb-48">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass border border-white/40 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-xl shadow-blue-500/5">
            <Zap size={14} className="fill-blue-600 animate-pulse" />
            <span>Neural Reconciliation Engine v4.0</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black text-[#1e293b] tracking-tighter mb-10 leading-[1.05]">
            Recover what matters <br />
            <TextType 
              text={["faster than ever.", "with AI precision.", "across the campus.", "safely and securely."]}
              typingSpeed={70}
              pauseDuration={2000}
              deletingSpeed={40}
              showCursor={true}
              cursorCharacter="|"
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"
            />
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-500/80 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            Advanced computer vision and neural matching to reunite lost belongings with their owners in record time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-32">
            <Link to="/register" className="w-full sm:w-auto bg-blue-600 text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-2 flex items-center justify-center gap-4 group active:scale-95">
              Submit Report <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto glass text-[#1e293b] px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all border border-white/60 hover:bg-white/80 flex items-center justify-center gap-4 shadow-xl active:scale-95">
              Explore Database
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto py-20 border-t border-slate-100/50">
            {[
              { label: 'Security', val: '100%', sub: 'ENCRYPTED' },
              { label: 'Efficiency', val: 'INSTANT', sub: 'MATCHING' },
              { label: 'Intelligence', val: '99.9%', sub: 'ACCURACY' },
              { label: 'Scope', val: 'GLOBAL', sub: 'COVERAGE' }
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center group cursor-default">
                <span className="text-4xl font-black text-[#1e293b] tracking-tighter group-hover:text-blue-600 transition-colors duration-500">{stat.val}</span>
                <span className="text-[10px] text-blue-600 uppercase tracking-[0.3em] font-black mt-2 opacity-60 group-hover:opacity-100 transition-opacity">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-48 relative z-10">
        {/* Subtle Section Divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-blue-200 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <h2 className="text-5xl lg:text-7xl font-black text-[#1e293b] tracking-tighter mb-8 uppercase">Operational Excellence</h2>
            <p className="text-slate-500 text-xl font-medium leading-relaxed">Systematic reunification protocols powered by next-generation artificial intelligence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { 
                icon: <Brain size={36} />, 
                title: 'Neural Analysis', 
                desc: 'Deep learning models analyze item characteristics to identify potential matches with surgical precision.',
                color: 'blue'
              },
              { 
                icon: <ShieldCheck size={36} />, 
                title: 'Secure Custody', 
                desc: 'Verification keys ensure that items are returned only to their verified legal owners.',
                color: 'indigo'
              },
              { 
                icon: <Zap size={36} />, 
                title: 'Real-time Sync', 
                desc: 'Instant notifications across all devices as soon as an intelligence match is detected.',
                color: 'blue'
              }
            ].map((feature) => (
              <div key={feature.title} className="glass p-12 rounded-[3.5rem] border border-white/60 hover:-translate-y-4 transition-all duration-700 group shadow-2xl shadow-blue-500/[0.02]">
                <div className={`w-20 h-20 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-500/20`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-black text-[#1e293b] mb-6 tracking-tight group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1e293b] text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-12">
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
