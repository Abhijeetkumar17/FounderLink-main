import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Search, Rocket, ArrowRight, Zap, Target, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import { getMyInvitations } from '../../teams/api/teamApi';
import { getStartupById } from '../../startups/api/startupApi';
import { Startup } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';

export default function CoFounderDashboard() {
  const navigate = useNavigate();

  const [invitations, setInvitations]   = useState<any[]>([]);
  const [teamsJoined, setTeamsJoined]   = useState<any[]>([]);
  const [startupMap, setStartupMap]     = useState<Record<number, Startup>>({});
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    getMyInvitations()
      .then(res => {
        const allInvites = extractApiData<any[]>(res, []);
        setInvitations(allInvites);
        const accepted = allInvites.filter((i: any) => i.status === 'ACCEPTED');
        setTeamsJoined(accepted);
        const uniqueIds = [...new Set(allInvites.map((i: any) => i.startupId))];
        Promise.all(uniqueIds.map(id => getStartupById(id as number).then(r => [id, extractApiData<Startup | null>(r, null)]).catch(() => [id, null])))
          .then(entries => setStartupMap(Object.fromEntries(entries)));
      })
      .catch(() => {
        setInvitations([]);
        setTeamsJoined([]);
        setStartupMap({});
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = invitations.filter(i => i.status === 'PENDING');

  const ROLE_LABEL: Record<string, string> = {
    CTO: 'CTO',
    CPO: 'CPO',
    MARKETING_HEAD: 'Marketing Head',
    ENGINEERING_LEAD: 'Engineering Lead',
    CO_FOUNDER: 'Co-Founder',
  };

  const ROLE_BADGE: Record<string, string> = {
    CTO: 'bg-blue-500/10 text-blue-400',
    CPO: 'bg-blue-500/10 text-blue-400',
    MARKETING_HEAD: 'bg-green-500/10 text-green-400',
    ENGINEERING_LEAD: 'bg-yellow-500/10 text-yellow-500',
    CO_FOUNDER: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Partner Node</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Ecosystem Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your team memberships and explore new ventures.</p>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/cofounder/startups" 
              className="btn-primary px-8 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
            >
              <Search size={20} />
              <span className="font-bold">Browse Ventures</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Units</span>
            </div>
            <p className="text-4xl font-black text-white">{teamsJoined.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold flex items-center gap-1.5 line-clamp-1">
              Teams Joined & Integrated
            </p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-yellow-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Inbox</span>
            </div>
            <p className="text-4xl font-black text-white">{pending.length}</p>
            <p className="text-xs text-yellow-500 mt-2 font-bold flex items-center gap-1.5">
               <Zap size={12} /> New Invitations Awaiting
            </p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-green-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-400 group-hover:scale-110 transition-transform">
                <Search size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pipeline</span>
            </div>
            <p className="text-4xl font-black text-white">42+</p>
            <p className="text-xs text-gray-500 mt-2 font-bold flex items-center gap-1.5">
               <Target size={12} /> Opportunities Found
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teams Joined */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Briefcase size={20} className="text-accent" /> Active Projects
              </h2>
              <Link to="/cofounder/startups" className="text-xs font-black text-accent hover:text-accent-light uppercase tracking-widest flex items-center gap-2 group">
                Find New Ventures <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-dark-800/50 rounded-3xl animate-pulse border border-dark-500" />
                ))}
              </div>
            ) : teamsJoined.length === 0 ? (
              <div className="p-12 text-center bg-dark-800/20 border-2 border-dashed border-dark-500 rounded-[40px]">
                <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6 border border-dark-500 shadow-xl">
                  <Rocket size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Initialize your presence</h3>
                <p className="text-gray-600 mt-2 max-w-xs mx-auto mb-8">You haven't joined any teams yet. Explore startups seeking co-founders or check your invitations.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Link to="/cofounder/startups" className="btn-primary px-8 py-3 text-lg font-black shadow-2xl shadow-accent/20">
                     Explore Market
                   </Link>
                   <Link to="/cofounder/invitations" className="btn-secondary px-8 py-3 text-lg font-black">
                     Check Invitations
                   </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {teamsJoined.map((inv: any) => {
                  const s = startupMap[inv.startupId];
                  return (
                    <div
                      key={inv.id}
                      className="p-5 bg-dark-700/30 rounded-[32px] border border-dark-500 flex items-center justify-between hover:border-accent/40 transition-all group shadow-sm hover:shadow-accent/5"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent shadow-inner group-hover:border-accent/30 transition-all">
                           <span className="text-xl font-black">{s?.name?.charAt(0) || 'S'}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors">{s?.name || `Startup #${inv.startupId}`}</h4>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                            {s?.industry || 'Unspecified'} • Joined {new Date(inv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-2">
                         <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ROLE_BADGE[inv.role] || 'bg-dark-600 text-gray-400'}`}>
                           {ROLE_LABEL[inv.role] || inv.role}
                         </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Ecosystem Stats */}
          <div className="space-y-6">
            <div className="card border-accent/20 bg-accent/5 p-6 rounded-[32px]">
               <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                 <Zap size={18} className="text-accent" /> Control Center
               </h3>
               <div className="space-y-3">
                  <Link to="/cofounder/invitations" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                     <span className="text-sm font-bold text-gray-300">New Invitations</span>
                     <div className="flex items-center gap-2">
                        {pending.length > 0 && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                        <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                     </div>
                  </Link>
                  <Link to="/messages" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                     <span className="text-sm font-bold text-gray-300">Message Inbox</span>
                     <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link to="/cofounder/startups" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                     <span className="text-sm font-bold text-gray-300">Market Research</span>
                     <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
               </div>
            </div>

            <div className="card p-6 rounded-[32px] bg-gradient-to-br from-dark-800 to-dark-900 border-dark-500 overflow-hidden relative">
               <div className="absolute -right-4 -top-4 opacity-5">
                  <Briefcase size={120} />
               </div>
               <h3 className="text-lg font-black text-white mb-4">Partner Success</h3>
               <p className="text-xs text-gray-500 leading-relaxed font-medium">
                 Your role as a co-founder is critical. Ensure your profile is clear about your skills to attract the right venture opportunities.
               </p>
               <div className="mt-8">
                  <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase mb-2">
                     <span>Profile Strength</span>
                     <span>85%</span>
                  </div>
                  <div className="w-full h-1 bg-dark-700 rounded-full overflow-hidden">
                     <div className="h-full bg-accent w-[85%]" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
