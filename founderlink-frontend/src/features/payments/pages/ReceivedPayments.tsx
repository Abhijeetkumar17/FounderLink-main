import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowRight, DollarSign, Wallet, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getPaymentsByFounder, acceptPayment, rejectPayment } from '../api/paymentApi';
import { Payment } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';

const ReceivedPayments = () => {
  const { userId } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!userId) return;
    try {
      const res = await getPaymentsByFounder(userId);
      setPayments(extractApiData<Payment[]>(res, []));
    } catch {
      toast.error('Failed to load received payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') await acceptPayment(id);
      else await rejectPayment(id);
      toast.success(`Payment ${action}ed`);
      fetchPayments();
    } catch {
      toast.error(`Failed to ${action} payment`);
    }
  };

  const successful = payments.filter(p => p.status === 'SUCCESS');
  const pending = payments.filter(p => p.status === 'AWAITING_APPROVAL' || p.status === 'PENDING');
  const totalRevenue = successful.reduce((sum, p) => sum + Number(p.amount), 0);

  const statusBadge = (status: string) => {
    if (status === 'SUCCESS' || status === 'COMPLETED') return 'bg-green-500/10 text-green-400';
    if (status === 'FAILED' || status === 'REJECTED') return 'bg-red-500/10 text-red-500';
    return 'bg-yellow-500/10 text-yellow-500';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Revenue Dashboard</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Inbound Capital
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Monitor investment inflows and verify incoming venture capital.</p>
          </div>
          <div className="flex items-center gap-4 bg-dark-800/40 border border-dark-500 px-6 py-4 rounded-3xl glassmorphism">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-600 uppercase">Gross Funding Received</p>
              <p className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</p>
            </div>
             <div className="p-3 bg-accent/10 rounded-2xl text-accent ml-2">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card bg-dark-800/40 border-dark-500 p-6 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Contributions</p>
               <p className="text-3xl font-black text-white">{payments.length}</p>
            </div>
            <CreditCard size={24} className="text-gray-500 opacity-20" />
          </div>
          <div className="card bg-dark-800/40 border-dark-500 p-6 flex items-center justify-between border-green-500/20">
            <div>
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Successfully Capitalized</p>
               <p className="text-3xl font-black text-green-400">{successful.length}</p>
            </div>
            <CheckCircle size={24} className="text-green-500 opacity-20" />
          </div>
          <div className="card bg-dark-800/40 border-dark-500 p-6 flex items-center justify-between border-yellow-500/20">
            <div>
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Awaiting Verification</p>
               <p className="text-3xl font-black text-yellow-500">{pending.length}</p>
            </div>
            <Clock size={24} className="text-yellow-500 opacity-20" />
          </div>
        </div>

        {/* Payment list */}
        <div className="card bg-dark-800/20 border-dark-500 rounded-[40px] overflow-hidden">
          <div className="px-8 py-6 border-b border-dark-500 flex items-center justify-between">
            <h2 className="font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <CreditCard size={18} className="text-accent" /> Incoming Transactions
            </h2>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-24 h-24 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6">
                <CreditCard size={40} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No capital detected</h3>
              <p className="text-gray-600 mt-2">Active investments will appear here for verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-dark-500/30">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Investor & Entity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Contribution</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500/30">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-accent/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent">
                             <img src={`https://ui-avatars.com/api/?name=${p.startupName}&background=1f2937&color=6366f1`} className="rounded-xl" alt="" />
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-accent-light transition-colors">{p.startupName}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter mt-0.5">
                              {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {p.paymentMethod || 'SECURED'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="font-black text-white text-lg">₹{Number(p.amount).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusBadge(p.status)}`}>
                          {p.status === 'AWAITING_APPROVAL' ? 'PENDING' : p.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         {p.status === 'AWAITING_APPROVAL' || p.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                               <button 
                                 onClick={() => handleAction(p.id, 'accept')}
                                 className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                               >
                                  Verify
                               </button>
                               <button 
                                 onClick={() => handleAction(p.id, 'reject')}
                                 className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                               >
                                  Return
                               </button>
                            </div>
                         ) : (
                            <div className="flex justify-end pr-4 text-gray-600">
                               <ShieldCheck size={20} />
                            </div>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Compliance Section */}
        <div className="card rounded-[40px] bg-dark-800/20 border-dark-500 p-8 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex-1">
              <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                 <ShieldCheck size={22} className="text-accent" /> Escrow Compliance
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                 Funds are held and matched against milestones. As a founder, you are required to verify each inbound payment. Once matched, the capital is immediately added to your venture's liquidity pool. Late verifications may delay stage funding cycles.
              </p>
           </div>
           <div className="flex gap-4">
              <div className="p-6 bg-dark-900 border border-dark-500 rounded-3xl text-center min-w-[120px]">
                 <Wallet size={24} className="text-accent mx-auto mb-2" />
                 <p className="text-lg font-black text-white">LOCKED</p>
                 <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Asset Status</p>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReceivedPayments;
