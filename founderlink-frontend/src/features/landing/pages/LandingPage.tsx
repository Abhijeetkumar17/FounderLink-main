import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Users, ShieldCheck, TrendingUp, Globe, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden font-sans text-gray-200">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-lg shadow-accent/20">
            <Rocket className="text-white" size={20} />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Founder<span className="text-accent">Link</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Platform</a>
          <a href="#investors" className="hover:text-white transition-colors">For Investors</a>
          <a href="#startups" className="hover:text-white transition-colors">For Startups</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-white hover:text-accent transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-8 animate-in slide-in-from-bottom flex">
            <Sparkles size={14} /> The Next Generation of Startup Building
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-8">
            Connect. Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">Scale.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-medium mb-10 max-w-2xl leading-relaxed">
            The exclusive network where visionary founders meet strategic capital and elite talent. Turn your blueprint into an empire.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-accent text-white font-bold text-lg shadow-xl shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
              Launch Your Journey
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-dark-800/50 border border-dark-500 text-white font-bold text-lg hover:bg-dark-700 transition-all flex items-center justify-center">
              Explore Network
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-24">
            {[
              { icon: Globe, label: 'Global Network', value: '150+ Countries' },
              { icon: TrendingUp, label: 'Capital Deployed', value: '$2.4B+' },
              { icon: Users, label: 'Active Founders', value: '45,000+' },
              { icon: ShieldCheck, label: 'Success Rate', value: '94%' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-dark-800/30 border border-dark-500/50 backdrop-blur-xl">
                <stat.icon className="text-accent mb-3" size={24} />
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bento Grid Features Layout */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24 border-t border-dark-500/30">
        <div className="mb-16">
          <h2 className="text-4xl font-black text-white">Ecosystem Features</h2>
          <p className="text-gray-400 mt-2 font-medium">Everything you need to grow, all in one premium interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="md:col-span-2 p-8 rounded-[32px] bg-gradient-to-br from-dark-800/80 to-dark-900 border border-dark-500/50 shadow-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
              <Rocket className="text-accent" size={24} />
            </div>
            <h3 className="text-3xl font-black text-white mb-3">Founder Portals</h3>
            <p className="text-gray-400 text-lg max-w-md">Create compelling company profiles, manage equity structures, and pitch directly to verified syndicate leads globally.</p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-[32px] bg-dark-800/40 border border-dark-500/50 hover:bg-dark-800/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Investor Deals</h3>
            <p className="text-gray-400">Discover vetted startups, review automated due diligence, and wire funds securely.</p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-[32px] bg-dark-800/40 border border-dark-500/50 hover:bg-dark-800/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Users className="text-purple-400" size={24} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Elite Teams</h3>
            <p className="text-gray-400">Recruit top-tier Co-Founders, CTOs, and early engineering leads using our AI matchmaker.</p>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 p-8 rounded-[32px] bg-gradient-to-bl from-accent/10 to-dark-900 border border-dark-500/50 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6">
              <ShieldCheck className="text-green-400" size={24} />
            </div>
            <h3 className="text-3xl font-black text-white mb-3">Ironclad Security</h3>
            <p className="text-gray-400 text-lg max-w-md">Military-grade encryption protects your IP, transaction data, and communications inside the network.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-500/30 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Rocket size={18} />
            <span className="text-xl font-bold tracking-tight">FounderLink</span>
          </div>
          <p className="text-gray-600 text-sm font-medium">© {new Date().getFullYear()} FounderLink Ecosystem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
