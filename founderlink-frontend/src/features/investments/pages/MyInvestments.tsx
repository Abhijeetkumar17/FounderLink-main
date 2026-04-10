import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, CheckCircle, Clock, CreditCard, XCircle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getMyInvestments } from '../api/investmentApi';
import { getPaymentsByInvestor } from '../../payments/api/paymentApi';
import { extractApiData } from '../../../shared/utils/api';

interface InvestmentRecord {
  id: number | string;
  startupId: number;
  investorId?: number;
  amount: number;
  status: string;
  createdAt?: string;
  startupName?: string;
  source?: 'investment' | 'payment';
}

const CONFIRMED_STATUSES = new Set(['APPROVED', 'SUCCESS', 'COMPLETED']);
const FAILED_STATUSES = new Set(['FAILED', 'REJECTED']);

const formatCurrency = (amount: number) => `INR ${amount.toLocaleString('en-IN')}`;

const normalizeRecords = (records: any[], source: 'investment' | 'payment'): InvestmentRecord[] =>
  records.map((record, index) => ({
    id: record.id ?? `${source}-${record.startupId ?? 'unknown'}-${record.createdAt ?? index}`,
    startupId: Number(record.startupId ?? 0),
    investorId: record.investorId ? Number(record.investorId) : undefined,
    amount: Number(record.amount ?? 0),
    status: String(record.status ?? 'PENDING').toUpperCase(),
    createdAt: record.createdAt || record.paymentDate || record.updatedAt,
    startupName: record.startupName || record.startup?.name,
    source,
  }));

const dedupeRecords = (records: InvestmentRecord[]) => {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = [
      record.startupId,
      record.amount,
      record.status,
      record.createdAt || '',
      record.startupName || '',
    ].join('|');

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const MyInvestments = () => {
  const { userId } = useAuth();
  const [payments, setPayments] = useState<InvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadInvestments = async () => {
      try {
        const [investmentRes, paymentRes] = await Promise.allSettled([
          getMyInvestments(userId),
          getPaymentsByInvestor(userId),
        ]);

        const investmentRecords =
          investmentRes.status === 'fulfilled'
            ? normalizeRecords(extractApiData<any[]>(investmentRes.value, []), 'investment')
            : [];

        const paymentRecords =
          paymentRes.status === 'fulfilled'
            ? normalizeRecords(extractApiData<any[]>(paymentRes.value, []), 'payment')
            : [];

        const mergedRecords = dedupeRecords(
          investmentRecords.length > 0 ? [...investmentRecords, ...paymentRecords] : paymentRecords
        ).sort((a, b) => {
          const first = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const second = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return second - first;
        });

        if (!active) {
          return;
        }

        setPayments(mergedRecords);

        if (
          investmentRes.status === 'rejected' &&
          paymentRes.status === 'rejected'
        ) {
          toast.error('Failed to load investments');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInvestments();

    return () => {
      active = false;
    };
  }, [userId]);

  const successful = payments.filter((payment) => CONFIRMED_STATUSES.has(payment.status));
  const totalInvested = successful.reduce((sum, payment) => sum + Number(payment.amount), 0);

  const statusBadge = (status: string) => {
    if (CONFIRMED_STATUSES.has(status)) return 'bg-green-500/10 text-green-400';
    if (FAILED_STATUSES.has(status)) return 'bg-red-500/10 text-red-500';
    return 'bg-yellow-500/10 text-yellow-500';
  };

  const statusLabel = (status: string) => {
    if (status === 'APPROVED' || status === 'SUCCESS' || status === 'COMPLETED') return 'CONFIRMED';
    if (status === 'PENDING') return 'PENDING APPROVAL';
    return status;
  };

  const statusIcon = (status: string) => {
    if (CONFIRMED_STATUSES.has(status)) return <CheckCircle size={15} className="text-green-400" />;
    if (FAILED_STATUSES.has(status)) return <XCircle size={15} className="text-red-400" />;
    return <Clock size={15} className="text-yellow-400" />;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Investment Ledger</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">My Deployments</h1>
            <p className="text-gray-500 mt-2 text-lg">Detailed history of all capital contributions and transaction statuses.</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/investor/startups"
              className="btn-primary px-8 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
            >
              <TrendingUp size={20} />
              <span className="font-bold">Discover Startups</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-accent/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Cap Table Impact</span>
            </div>
            <p className="text-4xl font-black text-white">{formatCurrency(totalInvested)}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold line-clamp-1">Total Successfully Verified Capital</p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-green-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Integrity Check</span>
            </div>
            <p className="text-4xl font-black text-white">{successful.length}</p>
            <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1.5">Confirmed Transactions</p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6 group hover:border-yellow-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Network Flow</span>
            </div>
            <p className="text-4xl font-black text-white">{payments.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">Total Operation Attempts</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-dark-800/40 rounded-[32px] animate-pulse border border-dark-500/50" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-dark-500 rounded-[40px] bg-dark-800/5 shadow-inner">
            <div className="w-24 h-24 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6 border border-dark-500">
              <DollarSign size={40} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white">Investment Vault Empty</h3>
            <p className="text-gray-600 mt-2 max-w-sm mx-auto">No capital deployments detected on your account. Start reviewing verified startups to build your portfolio.</p>
            <Link
              to="/investor/startups"
              className="mt-8 px-10 py-4 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              Browse Opportunities <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="group p-6 bg-dark-700/30 rounded-[32px] border border-dark-500 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-accent/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent shadow-inner group-hover:border-accent/30 transition-all shrink-0">
                    {statusIcon(payment.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors">
                        {payment.startupName || `Startup #${payment.startupId}`}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-1">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'N/A'}
                      <span className="mx-2 opacity-30">•</span>
                      {payment.source === 'payment' ? 'PAYMENT SERVICE' : 'INVESTMENT SERVICE'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8">
                  <div className="text-right">
                    <p className="text-xl font-black text-white">{formatCurrency(payment.amount)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter mt-1 ${statusBadge(payment.status)}`}>
                      {statusLabel(payment.status)}
                    </span>
                  </div>
                  <Link
                    to={`/investor/startups/${payment.startupId}`}
                    className="p-3 rounded-2xl bg-dark-800 border border-dark-500 text-gray-500 group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all shadow-lg"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card rounded-[40px] bg-dark-800/20 border-dark-500 p-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
              <CreditCard size={22} className="text-accent" /> Secure Processing
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
              FounderLink uses enterprise-grade encryption. Every investment is tracked through the investment service and linked to the corresponding startup.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="p-5 bg-dark-900 border border-dark-500 rounded-3xl text-center">
              <span className="text-[10px] font-black text-gray-600 uppercase block mb-1">Status</span>
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black uppercase">Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyInvestments;
