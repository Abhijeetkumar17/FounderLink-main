import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, DollarSign, TrendingUp, ArrowRight, CheckCircle, Clock, XCircle, Wallet, Target, Activity } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getAllStartups } from '../../startups/api/startupApi';
import { getPaymentsByInvestor } from '../../payments/api/paymentApi';
import { Startup, Payment } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';

const InvestorDashboard = () => {
  const { userId } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startupRes = await getAllStartups();
        const startupPayload = extractApiData<any>(startupRes, { content: [] });
        setStartups(Array.isArray(startupPayload) ? startupPayload : startupPayload?.content || []);

        if (userId) {
          const paymentRes = await getPaymentsByInvestor(userId);
          setPayments(extractApiData<Payment[]>(paymentRes, []));
        }
      } catch (error) {
        console.error('Failed to fetch investor data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const confirmed = payments.filter((p) => p.status === 'SUCCESS');
  const totalInvested = confirmed.reduce((sum, p) => sum + Number(p.amount), 0);

  const statusIcon = (status: string) => {
    if (status === 'SUCCESS') return <CheckCircle size={16} className="text-green-400" />;
    if (status === 'FAILED') return <XCircle size={16} className="text-red-400" />;
    if (status === 'AWAITING_APPROVAL' || status === 'PENDING') return <Clock size={16} className="text-yellow-400" />;
    return <Clock size={16} className="text-gray-400" />;
  };

  const statusBadge = (status: string) => {
    if (status === 'SUCCESS' || status === 'COMPLETED') return 'bg-green-500/10 text-green-400';
    if (status === 'FAILED') return 'bg-red-500/10 text-red-500';
    if (status === 'AWAITING_APPROVAL' || status === 'PENDING') return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-dark-600 text-gray-400';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Investor Terminal</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Portfolio Overview</h1>
            <p className="text-gray-500 mt-2 text-lg">Track your deployments and discover new opportunities.</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/investor/startups"
              className="btn-primary px-8 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
            >
              <Search size={20} />
              <span className="font-bold">Explore Startups</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform">
                <Target size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Market Access</span>
            </div>
            <p className="text-4xl font-black text-white">{startups.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold flex items-center gap-1.5 line-clamp-1">Startups Available for Funding</p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-green-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-400 group-hover:scale-110 transition-transform">
                <Wallet size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total Deployed</span>
            </div>
            <p className="text-4xl font-black text-white">INR {totalInvested.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1.5">
              <TrendingUp size={12} /> Across {confirmed.length} Ventures
            </p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-yellow-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pending Sync</span>
            </div>
            <p className="text-4xl font-black text-white">{payments.length - confirmed.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">Payments Awaiting Verification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <DollarSign size={20} className="text-accent" /> Recent Activity
              </h2>
              <Link to="/investor/investments" className="text-xs font-black text-accent hover:text-accent-light uppercase tracking-widest flex items-center gap-2 group">
                Full History <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-dark-800/50 rounded-3xl animate-pulse border border-dark-500" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center bg-dark-800/20 border-2 border-dashed border-dark-500 rounded-[40px]">
                <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6 border border-dark-500 shadow-xl">
                  <TrendingUp size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Zero active stakes</h3>
                <p className="text-gray-600 mt-2 max-w-xs mx-auto mb-8">Begin backtesting your thesis by exploring verified local startups.</p>
                <Link to="/investor/startups" className="btn-primary px-10 py-3 text-lg font-black shadow-2xl shadow-accent/20">
                  Browse Opportunities
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {payments.slice(0, 5).map((p) => {
                  const createdAtLabel = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A';

                  return (
                    <div
                      key={p.id}
                      className="p-5 bg-dark-700/30 rounded-[32px] border border-dark-500 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent shadow-inner group-hover:border-accent/30 transition-all">
                          {statusIcon(p.status)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors">{p.startupName}</h4>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                            {createdAtLabel} • {p.paymentMethod || 'Razorpay'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-xl font-black text-white">INR {Number(p.amount).toLocaleString()}</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusBadge(p.status)}`}>
                          {p.status === 'AWAITING_APPROVAL' ? 'PENDING' : p.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card border-accent/20 bg-accent/5 p-6 rounded-[32px]">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <Search size={18} className="text-accent" /> Quick Access
              </h3>
              <div className="space-y-3">
                <Link to="/investor/payments" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                  <span className="text-sm font-bold text-gray-300">Transaction History</span>
                  <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/investor/startups" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                  <span className="text-sm font-bold text-gray-300">Marketplace</span>
                  <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/messages" className="flex items-center justify-between p-4 bg-dark-800/60 rounded-2xl border border-dark-500 hover:border-accent/30 transition-all group">
                  <span className="text-sm font-bold text-gray-300">Founder Messages</span>
                  <ArrowRight size={14} className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            <div className="card p-6 rounded-[32px] bg-gradient-to-br from-dark-800 to-dark-900 border-dark-500 overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <TrendingUp size={120} />
              </div>
              <h3 className="text-lg font-black text-white mb-4">Investment Guard</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                All transactions are secured and monitored. Funds are disbursed after admin verification of startup milestones.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-800 bg-dark-700" />)}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Join 500+ Active VCs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorDashboard;
