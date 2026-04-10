import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Layout from '../../../layouts/Layout';

const Unauthorized = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8 shadow-2xl">
          <ShieldAlert size={48} className="text-red-500 shadow-glow-red" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Access Restricted</h1>
        <p className="text-gray-500 max-w-md mb-10 text-lg leading-relaxed">
          You don't have the required permissions to view this content. Please check your account role or contact the administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="btn-primary px-8 py-3 flex items-center gap-2">
            <Home size={18} /> Return Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary px-8 py-3 flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Unauthorized;
