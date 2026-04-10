import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Layout from '../../../layouts/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-dark-800 border border-dark-500 flex items-center justify-center mb-8 shadow-2xl">
          <span className="text-4xl font-black text-accent shadow-glow">404</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Lost in the Network?</h1>
        <p className="text-gray-500 max-w-md mb-10 text-lg leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back to the platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="btn-primary px-8 py-3 flex items-center gap-2">
            <Home size={18} /> Return Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary px-8 py-3 flex items-center gap-2">
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
