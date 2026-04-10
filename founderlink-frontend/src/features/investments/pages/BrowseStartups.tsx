import { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Rocket, Zap, Target, TrendingUp, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import StartupCard from '../../../shared/components/StartupCard';
import { getAllStartups } from '../../startups/api/startupApi';
import { getPaymentsByStartup } from '../../payments/api/paymentApi';
import { Startup } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';

const STAGES = ['All', 'IDEA', 'MVP', 'EARLY_TRACTION', 'SCALING'];

const BrowseStartups = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filtered, setFiltered] = useState<Startup[]>([]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('All');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStartups(0, 50)
      .then(async (res) => {
        const startupPayload = extractApiData<any>(res, { content: [] });
        const data = Array.isArray(startupPayload) ? startupPayload : startupPayload?.content || [];
        const enriched = await Promise.all(
          data.map(async (startup: Startup) => {
            try {
              const paymentsRes = await getPaymentsByStartup(startup.id);
              return { ...startup, payments: extractApiData<any[]>(paymentsRes, []) };
            } catch {
              return startup;
            }
          })
        );
        setStartups(enriched);
        setFiltered(enriched);
      })
      .catch(() => toast.error('Failed to load startups'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = startups;
    if (search) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.industry.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (stage !== 'All') {
      result = result.filter(s => s.stage === stage);
    }
    if (location) {
      result = result.filter(s => s.location?.toLowerCase().includes(location.toLowerCase()));
    }
    setFiltered(result);
  }, [search, stage, location, startups]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Live Marketplace</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Browse Ventures
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Discover and back the next generation of disruptive startups.</p>
          </div>
          <div className="flex items-center gap-4 bg-dark-800/40 border border-dark-500 px-5 py-3 rounded-2xl glassmorphism">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-600 uppercase">Available Opportunities</p>
              <p className="text-2xl font-black text-white">{filtered.length}</p>
            </div>
            <div className="w-px h-8 bg-dark-500 mx-2" />
            <div className="p-2 bg-accent/10 rounded-xl text-accent">
              <Rocket size={20} />
            </div>
          </div>
        </div>

        {/* Unified Search & Filter Command Bar */}
        <div className="card border-dark-500/50 bg-dark-800/20 p-2 rounded-[32px] shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-[2] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={20} />
              <input
                className="w-full bg-dark-900/50 border-none rounded-[24px] pl-16 pr-6 py-4 text-white placeholder-gray-600 font-medium focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Search by company name, industry, or tech stack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative flex-1 group">
               <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
               <input
                className="w-full bg-dark-900/50 border-none rounded-[24px] pl-14 pr-6 py-4 text-white placeholder-gray-600 font-medium focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Filter by city..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-2 px-2 py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 mr-2 border-r border-dark-500 pr-4">
               <Filter size={14} className="text-gray-500" />
               <span className="text-[10px] font-black text-gray-600 uppercase">Stage:</span>
            </div>
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  stage === s
                    ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105'
                    : 'bg-dark-900/50 text-gray-500 hover:text-gray-300 border border-dark-500/50'
                }`}
              >
                {s === 'EARLY_TRACTION' ? 'Early Traction' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-dark-800/40 rounded-[32px] animate-pulse border border-dark-500/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-dark-500 rounded-[40px] bg-dark-800/5 shadow-inner">
            <div className="w-24 h-24 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6 border border-dark-500">
              <Search size={40} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white">No matches found</h3>
            <p className="text-gray-600 mt-2 max-w-sm mx-auto">We couldn't find any startups matching your current criteria. Consider broadening your search or resetting filters.</p>
            <button 
               onClick={() => { setSearch(''); setStage('All'); setLocation(''); }}
               className="mt-8 px-8 py-3 bg-dark-700 border border-dark-500 rounded-2xl text-white font-bold hover:bg-dark-600 transition-all hover:-translate-y-0.5"
            >
               Reset Parameters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filtered.map((s) => <StartupCard key={s.id} startup={s} />)}
          </div>
        )}

        {/* Ecosystem Insight Card */}
        <div className="card rounded-[32px] border-accent/10 bg-gradient-to-br from-accent/5 to-transparent p-8 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-accent/20 rounded-lg text-accent">
                    <Info size={18} />
                 </div>
                 <h4 className="text-lg font-black text-white">Investment Integrity</h4>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                 FounderLink ensures that all startups listed have passed initial administrative review. We track funding progress in real-time to provide investors with absolute transparency on capital allocation and stage milestones.
              </p>
           </div>
           <div className="flex gap-4 shrink-0">
              <div className="flex flex-col items-center p-4 bg-dark-900/50 rounded-2xl border border-dark-500 min-w-[100px]">
                 <TrendingUp size={20} className="text-green-500 mb-2" />
                 <span className="text-lg font-black text-white">92%</span>
                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Growth Avg</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-dark-900/50 rounded-2xl border border-dark-500 min-w-[100px]">
                 <Zap size={20} className="text-yellow-500 mb-2" />
                 <span className="text-lg font-black text-white">14h</span>
                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Avg Sync</span>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrowseStartups;
