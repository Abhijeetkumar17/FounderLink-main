import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, CheckCircle, Clock, XCircle, Plus, ArrowRight, Zap, Target, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getStartupsByFounder } from '../api/startupApi';
import { getPaymentsByStartup } from '../../payments/api/paymentApi';
import { Startup } from '../../../shared/types';
import { calculateFundingMetrics } from '../../../shared/utils/funding';
import { extractApiData } from '../../../shared/utils/api';

const FounderDashboard = () => {
  const { userId, user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getStartupsByFounder(userId)
      .then(async (res) => {
        const startups = extractApiData<Startup[]>(res, []);
        const enriched = await Promise.all(
          startups.map(async (startup) => {
            try {
              const paymentsRes = await getPaymentsByStartup(startup.id);
              return { ...startup, payments: extractApiData<any[]>(paymentsRes, []) };
            } catch {
              return startup;
            }
          })
        );
        setStartups(enriched);
      })
      .catch(() => toast.error('Failed to load startups'))
      .finally(() => setLoading(false));
  }, [userId]);

  const approved = startups.filter((s) => s.isApproved);
  const rejected = startups.filter((s) => s.isRejected);
  const pending  = startups.filter((s) => !s.isApproved && !s.isRejected);

  // Total funding across all startups
  const totalRaisedOverall = startups.reduce((acc, s) => {
    const { totalRaised } = calculateFundingMetrics(s.payments || [], s.fundingGoal);
    return acc + totalRaised;
  }, 0);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Founder Central</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your ventures and monitor ecosystem growth.</p>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/founder/startups/create" 
              className="btn-primary px-8 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
            >
              <Plus size={20} />
              <span className="font-bold">Register Startup</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform">
                <Rocket size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Ventures</span>
            </div>
            <p className="text-4xl font-black text-white">{startups.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold flex items-center gap-1.5 line-clamp-1">
              {approved.length} Verified by Admin
            </p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-green-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-400 group-hover:scale-110 transition-transform">
                <Target size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total Raised</span>
            </div>
            <p className="text-4xl font-black text-white">₹{totalRaisedOverall.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1.5">
               <TrendingUp size={12} /> Combined Capital
            </p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-yellow-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                <Clock size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">In Pipeline</span>
            </div>
            <p className="text-4xl font-black text-white">{pending.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">Awaiting verification</p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-red-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-400 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Ecosystem</span>
            </div>
            <p className="text-4xl font-black text-white">1.2K</p>
            <p className="text-xs text-gray-500 mt-2 font-bold flex items-center gap-1.5">
               <Users size={12} /> Active Backers
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Startup List */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Rocket size={20} className="text-accent" /> Your Ventures
              </h2>
              <Link to="/founder/startups" className="text-xs font-black text-accent hover:text-accent-light uppercase tracking-widest flex items-center gap-2 group">
                View All Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-dark-800/50 rounded-3xl animate-pulse border border-dark-500" />
                ))}
              </div>
            ) : startups.length === 0 ? (
              <div className="p-12 text-center bg-dark-800/20 border-2 border-dashed border-dark-500 rounded-[40px]">
                <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6 border border-dark-500 shadow-xl">
                  <Plus size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Launch your first mission</h3>
                <p className="text-gray-600 mt-2 max-w-xs mx-auto mb-8">Register your startup details to start seeking investment and building your team.</p>
                <Link to="/founder/startups/create" className="btn-primary px-10 py-3 text-lg font-black shadow-2xl shadow-accent/20">
                  Initialize Startup
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {startups.slice(0, 5).map((s) => {
                  const { progress } = calculateFundingMetrics(s.payments || [], s.fundingGoal);
                  return (
                    <Link 
                      key={s.id} 
                      to={`/founder/startups/${s.id}`}
                      className="p-6 bg-dark-700/30 rounded-[32px] border border-dark-500 flex flex-col md:flex-row md:items-center justify-between hover:border-accent/40 group transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent shadow-inner group-hover:border-accent/30 transition-all">
                           <span className="text-xl font-black">{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors">{s.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.industry}</span>
                             <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${s.isApproved ? 'bg-green-500/10 text-green-400' : s.isRejected ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                               {s.isApproved ? 'Verified' : s.isRejected ? 'Returned' : 'In Review'}
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 md:mt-0 flex items-center gap-8">
                        {/* Compact Progress */}
                        <div className="text-right">
                           <p className="text-[10px] text-gray-600 font-black uppercase tracking-tighter mb-1">Funding Reach</p>
                           <div className="flex items-center gap-3">
                              <div className="w-32 h-1.5 bg-dark-800 rounded-full overflow-hidden hidden sm:block">
                                 <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-sm font-black text-white">{progress.toFixed(0)}%</span>
                           </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-dark-800 border border-dark-500 text-gray-500 group-hover:bg-accent group-hover:text-white transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar - Activity/Quick Actions */}
          <div className="space-y-6">
            <div className="card border-accent/20 bg-accent/5 p-6 rounded-[32px]">
               <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                 <Zap size={18} className="text-accent" /> Quick Actions
               </h3>
               <div className="space-y-3">
                  <Link to="/founder/payments" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                     <span className="text-sm font-bold text-gray-300">View Payments</span>
                     <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link to="/founder/investments" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                     <span className="text-sm font-bold text-gray-300">Investment Requests</span>
                     <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link to="/messages" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                     <span className="text-sm font-bold text-gray-300">Open Inbox</span>
                     <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
               </div>
            </div>

            <div className="card p-6 rounded-[32px]">
               <h3 className="text-lg font-black text-white mb-6">Recent Alerts</h3>
               <div className="flex flex-col items-center justify-center py-12 text-center opacity-20">
                  <Clock size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No new notifications</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper for the link icon
const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default FounderDashboard;
