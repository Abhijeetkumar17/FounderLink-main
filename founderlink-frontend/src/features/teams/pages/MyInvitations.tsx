import { useEffect, useState } from 'react';
import { Mail, CheckCircle, XCircle, Clock, ArrowRight, Zap, Target, Users, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import { getMyInvitations, acceptInvitation, rejectInvitation } from '../api/teamApi';
import { getStartupById } from '../../startups/api/startupApi';
import { Startup } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';

const MyInvitations = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [startupMap, setStartupMap] = useState<Record<number, Startup>>({});
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const res = await getMyInvitations();
      const allInvites = extractApiData<any[]>(res, []);
      setInvitations(allInvites);
      
      const uniqueIds = Array.from(new Set(allInvites.map((i: any) => i.startupId)));
      const startupResults = await Promise.all(
        uniqueIds.map(id => getStartupById(id as number).then(r => [id, extractApiData<Startup | null>(r, null)]).catch(() => [id, null]))
      );
      setStartupMap(Object.fromEntries(startupResults as any));
    } catch {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') await acceptInvitation(id);
      else await rejectInvitation(id);
      toast.success(`Invitation ${action}ed`);
      fetchInvitations();
    } catch {
      toast.error(`Failed to ${action} invitation`);
    }
  };

  const pending = invitations.filter(i => i.status === 'PENDING');
  const past = invitations.filter(i => i.status !== 'PENDING');

  const ROLE_LABEL: Record<string, string> = {
    CTO: 'CTO',
    CPO: 'CPO',
    MARKETING_HEAD: 'Marketing Head',
    ENGINEERING_LEAD: 'Engineering Lead',
    CO_FOUNDER: 'Co-Founder',
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Opportunity Network</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Invitations
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage mission invites and partnership requests from verified founders.</p>
          </div>
          <div className="flex items-center gap-4 bg-dark-800/40 border border-dark-500 px-6 py-4 rounded-3xl glassmorphism">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-600 uppercase">Pending Requests</p>
              <p className="text-2xl font-black text-white">{pending.length}</p>
            </div>
             <div className="p-3 bg-accent/10 rounded-2xl text-accent ml-2">
              <Mail size={24} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Invitations */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 px-2">
                <Zap size={20} className="text-accent" /> Active Transmissions
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                   {[1, 2].map(i => <div key={i} className="h-32 bg-dark-800/40 rounded-[32px] animate-pulse border border-dark-500" />)}
                </div>
              ) : pending.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-dark-500 rounded-[40px] bg-dark-800/5 shadow-inner">
                  <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4 border border-dark-500">
                    <Mail size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Inboxes Clear</h3>
                  <p className="text-gray-600 mt-2">No pending partnership requests at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pending.map((inv) => {
                    const s = startupMap[inv.startupId];
                    return (
                      <div key={inv.id} className="p-6 bg-dark-800/40 border border-dark-500 rounded-[40px] hover:border-accent/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-3xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent shadow-inner group-hover:border-accent/30 transition-all shrink-0">
                              <span className="text-2xl font-black">{s?.name?.charAt(0) || 'S'}</span>
                           </div>
                           <div>
                              <div className="flex items-center gap-3">
                                 <h4 className="text-xl font-black text-white group-hover:text-accent-light transition-colors">{s?.name || `Startup #${inv.startupId}`}</h4>
                                 <span className="px-2.5 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                    {ROLE_LABEL[inv.role] || inv.role}
                                 </span>
                              </div>
                              <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-1">
                                 {s?.industry || 'Unknown'} • Sent {new Date(inv.createdAt).toLocaleDateString()}
                              </p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => handleAction(inv.id, 'accept')}
                             className="px-6 py-2.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-2xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                           >
                              Initialize Partnership
                           </button>
                           <button 
                             onClick={() => handleAction(inv.id, 'reject')}
                             className="px-6 py-2.5 bg-red-500/20 text-red-500 border border-red-500/30 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                           >
                              Decline
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Past Activity */}
            {past.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-400 flex items-center gap-3 px-2">
                  <Clock size={18} className="text-gray-500" /> Archive
                </h3>
                <div className="card bg-dark-800/10 border-dark-500/50 rounded-[32px] overflow-hidden">
                   <div className="divide-y divide-dark-500/30">
                      {past.slice(0, 5).map((inv) => (
                        <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-dark-900/40 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${inv.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-red-500'}`} />
                              <div>
                                 <p className="text-sm font-bold text-white">{startupMap[inv.startupId]?.name || `Mission #${inv.startupId}`}</p>
                                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">
                                    {inv.status} — {new Date(inv.createdAt).toLocaleDateString()}
                                 </p>
                              </div>
                           </div>
                           <span className="text-[10px] font-black text-gray-500 uppercase">{ROLE_LABEL[inv.role] || inv.role}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebars */}
          <div className="space-y-6">
            <div className="card border-accent/20 bg-accent/5 p-8 rounded-[40px] relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Target size={120} />
               </div>
               <h3 className="text-xl font-black text-white mb-6">Partnership DNA</h3>
               <p className="text-sm text-gray-400 leading-relaxed font-medium mb-8">
                  Joining a venture as a co-founder is a high-commitment action. Each mission listed here has passed administrative review. Ensure you've communicated with the founders via the encrypted messaging terminal before committing assets.
               </p>
               <div className="flex items-center gap-4 bg-dark-900/60 p-4 rounded-2xl border border-dark-500">
                  <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                    <Rocket size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase">Verification Level</p>
                    <p className="text-xs font-bold text-white">Full Protocol Clearance</p>
                  </div>
               </div>
            </div>

            <div className="card p-8 rounded-[40px] border-dark-500 bg-dark-800/20">
               <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                 <Users size={18} className="text-accent" /> Network Density
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-dark-900/40 p-4 rounded-2xl border border-dark-500">
                     <span className="text-xs font-bold text-gray-400">Response Rate</span>
                     <span className="text-sm font-black text-white">98%</span>
                  </div>
                  <div className="flex justify-between items-center bg-dark-900/40 p-4 rounded-2xl border border-dark-500">
                     <span className="text-xs font-bold text-gray-400">Integration Speed</span>
                     <span className="text-sm font-black text-white">~12h</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyInvitations;
