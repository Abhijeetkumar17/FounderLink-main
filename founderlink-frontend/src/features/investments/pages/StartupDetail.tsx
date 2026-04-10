import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, DollarSign, Heart, ArrowLeft, Zap, CheckCircle, CreditCard, HeartOff, ShieldPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getStartupById, followStartup, unfollowStartup, checkFollowStatus } from '../../startups/api/startupApi';
import { getPaymentsByStartup, createOrder, verifyPayment } from '../../payments/api/paymentApi';
import { Startup, Payment } from '../../../shared/types';
import { calculateFundingMetrics } from '../../../shared/utils/funding';
import { extractApiData } from '../../../shared/utils/api';

const formatCurrency = (amount: number) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

const StartupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInvestor, user, userId } = useAuth();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      const [startupRes, paymentRes, followRes] = await Promise.all([
        getStartupById(id),
        getPaymentsByStartup(id),
        isInvestor && userId ? checkFollowStatus(id) : Promise.resolve({ data: false }),
      ]);

      const startupData = extractApiData<Startup | null>(startupRes, null);
      const paymentData = extractApiData<Payment[]>(paymentRes, []);
      const followData = extractApiData<boolean | { following?: boolean }>(followRes, false);

      setStartup(startupData);
      setPayments(paymentData);
      setIsFollowing(typeof followData === 'boolean' ? followData : Boolean(followData?.following));
    } catch {
      toast.error('Failed to load startup details');
    } finally {
      setLoading(false);
    }
  }, [id, isInvestor, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFollow = async () => {
    if (!id || !isInvestor) return;

    try {
      if (isFollowing) {
        await unfollowStartup(id);
        toast.success('Unfollowed startup');
      } else {
        await followStartup(id);
        toast.success('Following startup!');
      }
      setIsFollowing((current) => !current);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const onInvest = async (data: any) => {
    if (!id || !startup) return;

    setPaymentLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        setPaymentLoading(false);
        return;
      }

      const orderRes = await createOrder({
        investorId: userId,
        founderId: startup.founderId,
        startupId: parseInt(id, 10),
        startupName: startup.name,
        investorName: user?.name || user?.email,
        amount: parseFloat(data.amount),
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'FounderLink',
        description: `Investment in ${startup.name}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success('Investment confirmed!');
              reset();
              fetchData();
            } else {
              toast.error('Payment verification failed');
            }
          } catch {
            toast.error('Error verifying payment');
          }
        },
        prefill: {
          name: (user as any)?.name || '',
          email: (user as any)?.email || '',
        },
        theme: { color: '#6366f1' },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading || !startup) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Loading startup details...</p>
        </div>
      </Layout>
    );
  }

  const { totalRaised, progress, remaining } = calculateFundingMetrics(payments, startup.fundingGoal);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Browse
        </button>

        <div className="card pt-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{startup.name}</h1>
                {startup.isApproved && (
                  <span className="badge-green flex items-center gap-1.5 py-1 px-3">
                    <CheckCircle size={14} /> Verified Startup
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 items-center text-sm">
                <span className="badge-blue px-3 py-1">{startup.industry}</span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <MapPin size={16} /> {startup.location}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 border-l border-dark-400 pl-3">
                  <ShieldPlus size={16} /> {startup.stage.replace('_', ' ')}
                </span>
              </div>
            </div>

            {isInvestor && (
              <div className="flex gap-3">
                <button
                  onClick={toggleFollow}
                  className={`btn-${isFollowing ? 'secondary' : 'primary'} flex items-center gap-2 min-w-[120px] justify-center transition-all`}
                >
                  {isFollowing ? <><HeartOff size={18} /> Unfollow</> : <><Heart size={18} /> Follow</>}
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-3xl">
            {startup.description}
          </p>

          <div className="bg-dark-700/50 rounded-2xl p-6 border border-dark-400 shadow-inner">
            <div className="flex justify-between items-end mb-4">
              <div className="space-y-1">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Funding Status</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{formatCurrency(totalRaised)}</span>
                  <span className="text-gray-500 font-medium">raised of {formatCurrency(startup.fundingGoal)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-accent-light">{progress.toFixed(1)}%</span>
              </div>
            </div>

            <div className="h-3 bg-dark-500 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-accent via-accent-light to-blue-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <p>PROGRESS: {progress.toFixed(0)}%</p>
              <p>REMAINING: {formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">The Problem</h3>
            <p className="text-gray-300 leading-relaxed">{startup.problemStatement || 'No specific problem statement provided.'}</p>
          </div>
          <div className="card overflow-hidden border-accent/10">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">The Solution</h3>
            <p className="text-gray-300 leading-relaxed">{startup.solution || 'No specific solution description provided.'}</p>
          </div>
        </div>

        {isInvestor && (
          <div className="card border-2 border-accent/20 bg-accent/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-xl">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Back this Startup</h2>
                <p className="text-gray-500 text-sm">Secure your equity stake with a direct investment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onInvest)} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-accent transition-colors">INR</span>
                <input
                  type="number"
                  className="input-field pl-14 text-lg font-bold py-3 bg-dark-800"
                  placeholder="0.00"
                  {...register('amount', { required: true, min: 1 })}
                />
              </div>
              <button
                type="submit"
                disabled={paymentLoading}
                className="btn-primary py-3 px-8 text-lg font-bold flex items-center gap-3 shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                <CreditCard size={20} />
                {paymentLoading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </form>
            {errors.amount && <p className="text-red-400 text-xs mt-2 font-semibold">Please enter a valid amount.</p>}

            <div className="mt-5 flex items-center justify-between text-xs text-gray-600 font-bold border-t border-dark-400 pt-4">
              <p className="flex items-center gap-1.5"><ShieldPlus size={14} /> SECURE TRANSACTION</p>
              <p>RAZORPAY SECURE • NO PLATFORM FEES</p>
            </div>
          </div>
        )}

        {payments.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              Recent Investments <span className="text-accent text-sm ml-2 px-2 py-0.5 bg-accent/10 rounded-full">{payments.length}</span>
            </h2>
            <div className="space-y-3">
              {payments.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl border border-dark-400 group hover:border-accent/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-accent">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold">{formatCurrency(Number(payment.amount))}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black">Anonymous Backer</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                    (payment.status as string) === 'SUCCESS' || (payment.status as string) === 'COMPLETED'
                      ? 'bg-green-500/10 text-green-400'
                      : (payment.status as string) === 'FAILED'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StartupDetail;
