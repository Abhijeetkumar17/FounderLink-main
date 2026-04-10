import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Rocket, ArrowLeft, Send, Sparkles, Building2, Globe, Target, Layers } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import { createStartup } from '../api/startupApi';

const CreateStartup = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await createStartup({ ...data, fundingGoal: parseFloat(data.fundingGoal) });
      toast.success('Startup mission initialized!');
      navigate('/founder/startups');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create startup');
    }
  };

  const labelClass = 'block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1';
  const inputClass = 'w-full bg-dark-900/50 border border-dark-500 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all outline-none font-medium';
  const errorClass = 'text-red-500 text-[10px] font-bold mt-2 px-1 uppercase tracking-tight';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Return to Dashboard</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/20 rounded-xl text-accent">
                <Rocket size={24} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Launch New Venture</h1>
            </div>
            <p className="text-gray-500 mt-2 text-lg">Define your startup's core parameters to begin the verification process.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="card bg-dark-800/40 border-dark-500 p-8 rounded-[40px] space-y-8">
                {/* Basic Identity */}
                <div className="space-y-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-dark-500/50 pb-4">
                    <Building2 size={16} className="text-accent" /> Core Identity
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Startup Name</label>
                      <input className={inputClass} placeholder="e.g. Nexus AI" {...register('name', { required: 'Mission name is required' })} />
                      {errors.name && <p className={errorClass}>{errors.name.message as string}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Industry Sector</label>
                      <input className={inputClass} placeholder="e.g. Fintech / SaaS" {...register('industry', { required: 'Industry sector is required' })} />
                      {errors.industry && <p className={errorClass}>{errors.industry.message as string}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Venture Description</label>
                    <textarea
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder="High-level overview of your startup's mission and value proposition..."
                      {...register('description', { required: 'Description is required' })}
                    />
                    {errors.description && <p className={errorClass}>{errors.description.message as string}</p>}
                  </div>
                </div>

                {/* The "Why" - Mission Parameters */}
                <div className="space-y-6 pt-4">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-dark-500/50 pb-4">
                    <Target size={16} className="text-accent" /> Strategic Focus
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Problem Statement</label>
                      <textarea
                        rows={4}
                        className={`${inputClass} resize-none`}
                        placeholder="What specific market friction are you removing?"
                        {...register('problemStatement', { required: 'Required' })}
                      />
                      {errors.problemStatement && <p className={errorClass}>{errors.problemStatement.message as string}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Proposed Solution</label>
                      <textarea
                        rows={4}
                        className={`${inputClass} resize-none`}
                        placeholder="How does your technology/model solve this problem?"
                        {...register('solution', { required: 'Required' })}
                      />
                      {errors.solution && <p className={errorClass}>{errors.solution.message as string}</p>}
                    </div>
                  </div>
                </div>

                {/* Financial & Stage Metrics */}
                <div className="space-y-6 pt-4">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-dark-500/50 pb-4">
                    <Layers size={16} className="text-accent" /> Scaling Metrics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>Funding Goal (₹)</label>
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="5,00,000"
                        {...register('fundingGoal', { required: 'Required', min: { value: 1, message: 'Goal must be > 0' } })}
                      />
                      {errors.fundingGoal && <p className={errorClass}>{errors.fundingGoal.message as string}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Current Stage</label>
                      <select className={`${inputClass} appearance-none cursor-pointer`} {...register('stage', { required: 'Required' })}>
                        <option value="IDEA">Idea Phase</option>
                        <option value="MVP">MVP Prototype</option>
                        <option value="EARLY_TRACTION">Early Traction</option>
                        <option value="SCALING">Scaling / Growth</option>
                      </select>
                      {errors.stage && <p className={errorClass}>{errors.stage.message as string}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Base Location</label>
                      <div className="relative">
                        <input className={inputClass} placeholder="e.g. Mumbai, IN" {...register('location')} />
                        <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Action */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-dark-500/50">
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 btn-primary py-5 rounded-[24px] text-lg font-black shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={20} /> Initialize Mission
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)} 
                    className="px-10 py-5 bg-dark-900 border border-dark-500 text-gray-500 font-black uppercase tracking-widest rounded-[24px] hover:text-white hover:border-gray-500 transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <div className="card bg-accent/5 border-accent/20 p-8 rounded-[40px]">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-accent" /> Founder Guard
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium mb-8">
                Your startup details are reviewed by our analyst team within 24 hours. Verified startups enjoy higher visibility and trust scores in the investor marketplace.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 p-4 bg-dark-900/60 rounded-2xl border border-dark-500">
                  <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <span className="text-[11px] font-black text-gray-300 uppercase">Be precise with data</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-dark-900/60 rounded-2xl border border-dark-500">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-[11px] font-black text-gray-300 uppercase">Realistic funding goals</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-dark-900/60 rounded-2xl border border-dark-500">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-[11px] font-black text-gray-300 uppercase">Clear ROI roadmap</span>
                </li>
              </ul>
            </div>

            <div className="card p-8 rounded-[40px] border-dark-500 bg-dark-800/20 text-center">
               <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Support Protocol</h4>
               <p className="text-gray-500 text-xs font-medium leading-relaxed">
                 Need help defining your stage? <br />
                 <button type="button" className="text-accent hover:underline mt-1">Read the Handbook →</button>
               </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateStartup;
