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
      </div>


      {/* Header / Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform">
              <Search className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#1e293b]">EaseFind<span className="text-blue-600">.AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Intelligence', 'Protocols', 'Hotspots', 'Verification'].map((item) => (
              <a key={item} href="#" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1">
              Join Protocol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-48 pb-32 lg:pt-64 lg:pb-48">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-12 border border-blue-100 shadow-sm">
            <Zap size={14} className="fill-blue-600" />
            <span>AI-Driven Discovery Neural Network</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-[#1e293b] tracking-tighter mb-10 leading-[1.1]">
            Recover what matters <br />
            <TextType 
              text={["faster than ever.", "with AI precision.", "across the campus.", "safely and securely."]}
              typingSpeed={70}
              pauseDuration={2000}
              deletingSpeed={40}
              showCursor={true}
              cursorCharacter="|"
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700"
            />
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-500 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            Advanced computer vision and neural matching to reunite lost belongings with their owners in record time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-32">
            <Link to="/register" className="w-full sm:w-auto bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-2 flex items-center justify-center gap-4 group">
              Submit Report <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto bg-white text-[#1e293b] px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all border border-slate-100 hover:bg-slate-50 flex items-center justify-center gap-4 shadow-xl">
              Explore Database
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto py-20 border-t border-slate-50">
            {[
              { label: 'Security', val: '100%', sub: 'ENCRYPTED' },
              { label: 'Efficiency', val: 'INSTANT', sub: 'MATCHING' },
              { label: 'Intelligence', val: '99.9%', sub: 'ACCURACY' },
              { label: 'Scope', val: 'GLOBAL', sub: 'COVERAGE' }
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-4xl font-black text-[#1e293b] tracking-tighter">{stat.val}</span>
                <span className="text-[10px] text-blue-600 uppercase tracking-[0.3em] font-black mt-2">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-48 bg-slate-50/50 relative z-10 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl lg:text-7xl font-black text-[#1e293b] tracking-tighter mb-8 uppercase">Operational Excellence</h2>
            <p className="text-slate-500 text-xl font-medium leading-relaxed">Systematic reunification protocols powered by next-generation artificial intelligence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
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
              <div key={feature.title} className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 hover:-translate-y-4 transition-all duration-500 group">
                <div className={`w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-black text-[#1e293b] mb-6 tracking-tight">{feature.title}</h3>
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
