import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Rocket, ArrowRight, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getStartupsByFounder, deleteStartup } from '../api/startupApi';
import { Startup } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';

const MyStartups = () => {
  const { userId } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!userId) return;
    getStartupsByFounder(userId)
      .then((res) => setStartups(extractApiData<Startup[]>(res, [])))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Delete this startup?')) return;
    setStartups(prev => prev.filter(s => s.id !== id));
    try {
      await deleteStartup(id);
      toast.success('Startup deleted');
    } catch {
      toast.error('Failed to delete');
      load();
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Portfolio Management</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              My Ventures
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your registered startups and team collaborations.</p>
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

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-dark-800/40 rounded-[32px] animate-pulse border border-dark-500/50" />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-dark-500 rounded-[40px] bg-dark-800/5 shadow-inner">
            <div className="w-24 h-24 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6 border border-dark-500">
              <Rocket size={40} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white">No active missions</h3>
            <p className="text-gray-600 mt-2 max-w-sm mx-auto">Launch your first startup to begin attracting investment and building your core team.</p>
            <Link 
               to="/founder/startups/create"
               className="mt-8 px-10 py-4 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
               Initialize Startup <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {startups.map((s) => (
              <div 
                key={s.id} 
                className="group p-6 bg-dark-800/40 border border-dark-500 rounded-[40px] hover:border-accent/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent shadow-inner group-hover:border-accent/30 transition-all shrink-0">
                     <span className="text-2xl font-black">{s.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-black text-white group-hover:text-accent-light transition-colors">{s.name}</h3>
                      <div className="flex gap-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${s.isApproved ? 'bg-green-500/10 text-green-400' : s.isRejected ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {s.isApproved ? 'Verified' : s.isRejected ? 'Declined' : 'Pending'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                          {s.stage === 'EARLY_TRACTION' ? 'Early Traction' : s.stage}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
                       {s.industry} <span className="opacity-30">•</span> {s.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={`/founder/team/${s.id}`}
                    className="p-3 bg-dark-900 border border-dark-500 rounded-2xl text-gray-400 hover:text-white hover:border-accent/40 hover:bg-accent/10 transition-all flex items-center gap-2"
                    title="Manage Team"
                  >
                    <Users size={18} />
                    <span className="text-xs font-bold md:hidden lg:block">Team</span>
                  </Link>
                  <Link
                    to={`/founder/startups/${s.id}/edit`}
                    className="p-3 bg-dark-900 border border-dark-500 rounded-2xl text-gray-400 hover:text-white hover:border-yellow-500/40 hover:bg-yellow-500/10 transition-all flex items-center gap-2"
                    title="Edit Metadata"
                  >
                    <Edit size={18} />
                    <span className="text-xs font-bold md:hidden lg:block">Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-3 bg-dark-900 border border-dark-500 rounded-2xl text-gray-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all flex items-center gap-2"
                    title="Terminate"
                  >
                    <Trash2 size={18} />
                    <span className="text-xs font-bold md:hidden lg:block">Delete</span>
                  </button>
                  <Link
                    to={`/founder/startups/${s.id}`}
                    className="ml-2 p-3 bg-accent text-white rounded-2xl hover:bg-accent-light transition-all shadow-lg shadow-accent/20"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Section */}
        <div className="card rounded-[40px] bg-dark-800/20 border-dark-500 p-8 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex-1">
              <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                 <Briefcase size={22} className="text-accent" /> Growth Services
              </h4>
              <p className="text-gray-500 leading-relaxed font-black text-xs uppercase tracking-widest mb-4">Ecosystem Support Layer</p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                 Founders with verified startups have access to our partner network of legal experts and seed investors. Ensure your documentation is up to date in the 'Edit' section for faster approval.
              </p>
           </div>
           <div className="flex gap-4">
              <div className="p-6 bg-dark-900/50 rounded-3xl border border-dark-500 text-center min-w-[120px]">
                 <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                 <p className="text-xl font-black text-white">100%</p>
                 <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Uptime</p>
              </div>
              <div className="p-6 bg-dark-900/50 rounded-3xl border border-dark-500 text-center min-w-[120px]">
                 <Clock size={24} className="text-yellow-500 mx-auto mb-2" />
                 <p className="text-xl font-black text-white">~24h</p>
                 <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Review</p>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyStartups;
