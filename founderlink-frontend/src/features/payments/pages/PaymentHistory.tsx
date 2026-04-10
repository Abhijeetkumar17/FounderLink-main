import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowRight, Wallet, Activity, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getPaymentsByInvestor } from '../api/paymentApi';
import { Payment } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';

const PaymentHistory = () => {
  const { userId } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getPaymentsByInvestor(userId)
      .then(res => setPayments(extractApiData<Payment[]>(res, [])))
      .catch(() => toast.error('Failed to load payment history'))
      .finally(() => setLoading(false));
  }, [userId]);

  const successful = payments.filter(p => p.status === 'SUCCESS');
  const totalInvested = successful.reduce((sum, p) => sum + Number(p.amount), 0);

  const statusBadge = (status: string) => {
    if (status === 'SUCCESS' || status === 'COMPLETED') return 'bg-green-500/10 text-green-400';
    if (status === 'FAILED' || status === 'REJECTED') return 'bg-red-500/10 text-red-500';
    return 'bg-yellow-500/10 text-yellow-500';
  };

  const statusIcon = (status: string) => {
    if (status === 'SUCCESS') return <CheckCircle size={16} className="text-green-400" />;
    if (status === 'FAILED' || status === 'REJECTED') return <XCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-yellow-400" />;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Financial Audit</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Transaction History
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Detailed record of all capital outflows and settlement statuses.</p>
          </div>
          <div className="flex items-center gap-4 bg-dark-800/40 border border-dark-500 px-6 py-4 rounded-3xl glassmorphism">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-600 uppercase">Capital Deployed</p>
              <p className="text-2xl font-black text-white">₹{totalInvested.toLocaleString()}</p>
            </div>
             <div className="p-3 bg-accent/10 rounded-2xl text-accent ml-2">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        {/* Audit Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card bg-dark-800/40 border-dark-500 p-6 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Operations</p>
               <p className="text-3xl font-black text-white">{payments.length}</p>
            </div>
            <Activity size={24} className="text-gray-500 opacity-20" />
          </div>
          <div className="card bg-dark-800/40 border-dark-500 p-6 flex items-center justify-between border-green-500/20">
            <div>
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Settled</p>
               <p className="text-3xl font-black text-green-400">{successful.length}</p>
            </div>
            <ShieldCheck size={24} className="text-green-500 opacity-20" />
          </div>
          <div className="card bg-dark-800/40 border-dark-500 p-6 flex items-center justify-between border-yellow-500/20">
            <div>
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">In Process</p>
               <p className="text-3xl font-black text-yellow-500">{payments.length - successful.length}</p>
            </div>
            <Clock size={24} className="text-yellow-500 opacity-20" />
          </div>
        </div>

        {/* Payment list */}
        <div className="card bg-dark-800/20 border-dark-500 rounded-[40px] overflow-hidden">
          <div className="px-8 py-6 border-b border-dark-500 flex items-center justify-between">
            <h2 className="font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <CreditCard size={18} className="text-accent" /> Ledger Entries
            </h2>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-dark-900/50 px-3 py-1 rounded-lg">
               Real-time Sync
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6">
                <CreditCard size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest">No transaction history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-dark-500/30">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Entity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Sequence ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500/30">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-accent/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent">
                             {statusIcon(p.status)}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-accent-light transition-colors">{p.startupName || 'Startup'}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter mt-0.5">
                              {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono text-gray-600 uppercase tracking-tight">
                          {p.razorpayPaymentId || 'N/A — OFFLINE'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="font-black text-white text-lg">₹{Number(p.amount).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <Link 
                           to={`/investor/startups/${p.startupId}`}
                           className="p-2.5 rounded-xl bg-dark-900 border border-dark-500 text-gray-600 hover:text-white hover:border-accent group-hover:bg-accent transition-all inline-block"
                         >
                            <ArrowRight size={16} />
                         </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentHistory;
