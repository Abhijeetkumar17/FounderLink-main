import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit, ArrowLeft, Save, Building2, Globe, Target, Layers, Info } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import { getStartupById, updateStartup } from '../api/startupApi';
import { Startup } from '../../../shared/types';

const EditStartup = () => {
  const { id } = useParams();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [loadingStartup, setLoadingStartup] = useState(true);

  useEffect(() => {
    if (!id) return;
    getStartupById(id as string)
      .then(res => {
        reset(res.data);
        setLoadingStartup(false);
      })
      .catch(() => {
        toast.error('Failed to load startup metrics');
        navigate('/founder/startups');
      });
  }, [id, reset, navigate]);

  const onSubmit = async (data: any) => {
    try {
      await updateStartup(id as string, { ...data, fundingGoal: parseFloat(data.fundingGoal) });
      toast.success('Mission parameters updated!');
      navigate('/founder/startups');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sync updates');
    }
  };

  const labelClass = 'block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1';
  const inputClass = 'w-full bg-dark-900/50 border border-dark-500 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all outline-none font-medium';
  const errorClass = 'text-red-500 text-[10px] font-bold mt-2 px-1 uppercase tracking-tight';

  if (loadingStartup) return (
    <Layout>
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Recalibrating mission data...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Abort Edit</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-500">
                <Edit size={24} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Edit Parameters</h1>
            </div>
            <p className="text-gray-500 mt-2 text-lg">Update your startup's growth trajectory and core mission statements.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="card bg-dark-800/40 border-dark-500 p-8 rounded-[40px] space-y-8">
                {/* Identity Layer */}
                <div className="space-y-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-dark-500/50 pb-4">
                    <Building2 size={16} className="text-accent" /> Identity Layer
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Startup Handle</label>
                      <input className={inputClass} placeholder="Nexus AI" {...register('name', { required: 'Required' })} />
                      {errors.name && <p className={errorClass}>{errors.name.message as string}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Active Sector</label>
                      <input className={inputClass} placeholder="Fintech" {...register('industry', { required: 'Required' })} />
                      {errors.industry && <p className={errorClass}>{errors.industry.message as string}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Core Mission Statement</label>
                    <textarea
                      rows={3}
                      className={`${inputClass} resize-none`}
                      {...register('description', { required: 'Required' })}
                    />
                    {errors.description && <p className={errorClass}>{errors.description.message as string}</p>}
                  </div>
                </div>

                {/* Growth Parameters */}
                <div className="space-y-6 pt-4">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-dark-500/50 pb-4">
                    <Target size={16} className="text-accent" /> Growth Parameters
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Friction Point (Problem)</label>
                      <textarea
                        rows={4}
                        className={`${inputClass} resize-none`}
                        {...register('problemStatement', { required: 'Required' })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Strategic Edge (Solution)</label>
                      <textarea
                        rows={4}
                        className={`${inputClass} resize-none`}
                        {...register('solution', { required: 'Required' })}
                      />
                    </div>
                  </div>
                </div>

                {/* Capital & Milestones */}
                <div className="space-y-6 pt-4">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-dark-500/50 pb-4">
                    <Layers size={16} className="text-accent" /> Capital & Milestones
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>Target Capital (₹)</label>
                      <input
                        type="number"
                        className={inputClass}
                        {...register('fundingGoal', { required: 'Required', min: 1 })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Verified Stage</label>
                      <select className={`${inputClass} appearance-none`} {...register('stage', { required: 'Required' })}>
                        <option value="IDEA">Idea</option>
                        <option value="MVP">MVP</option>
                        <option value="EARLY_TRACTION">Early Traction</option>
                        <option value="SCALING">Scaling</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Base Node</label>
                      <div className="relative">
                        <input className={inputClass} placeholder="Bengaluru, IN" {...register('location')} />
                        <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finalization */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-dark-500/50">
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 btn-primary py-5 rounded-[24px] text-lg font-black shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={20} /> Commit Updates
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)} 
                    className="px-10 py-5 bg-dark-900 border border-dark-500 text-gray-500 font-black uppercase tracking-widest rounded-[24px] hover:text-white hover:border-gray-500 transition-all text-sm"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Audit Sidebar */}
          <div className="space-y-6">
            <div className="card bg-yellow-500/5 border-yellow-500/20 p-8 rounded-[40px]">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Info size={18} className="text-yellow-500" /> Integrity Note
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Core parameter changes (like Funding Goal or Stage) may re-trigger a verification cycle. Existing investors will be notified of significant mission shifts.
              </p>
              <div className="mt-8 pt-8 border-t border-yellow-500/10">
                 <div className="flex items-center gap-3 mb-4 opacity-50">
                    <ShieldCheck size={16} className="text-yellow-500" />
                    <span className="text-[11px] font-black uppercase text-gray-500">Asset Protection Layer</span>
                 </div>
                 <p className="text-[10px] text-gray-600 font-bold leading-relaxed uppercase">
                    Major pivots are monitored to ensure transparency for all project backers.
                 </p>
              </div>
            </div>

            <div className="card p-6 rounded-[32px] border-dark-500 bg-dark-800/20 text-center">
               <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-1">Entity ID</span>
               <code className="text-xs text-accent font-black">{id}</code>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ShieldCheck = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default EditStartup;
