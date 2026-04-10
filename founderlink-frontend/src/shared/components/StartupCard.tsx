import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import { Startup } from '../types';
import { calculateFundingMetrics } from '../utils/funding';
import useAuth from '../hooks/useAuth';

interface StartupCardProps {
  startup: Startup;
  isFounder?: boolean;
}

const formatCurrency = (value: number | undefined) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const StartupCard = ({ startup, isFounder = false }: StartupCardProps) => {
  const { isFounder: currentUserIsFounder, isCoFounder } = useAuth();
  const { totalRaised, progress, remaining } = calculateFundingMetrics(startup.payments || [], startup.fundingGoal);

  const founderView = isFounder || currentUserIsFounder;

  const detailUrl = founderView
    ? `/founder/startups/${startup.id}`
    : isCoFounder
    ? `/cofounder/startups/${startup.id}`
    : `/investor/startups/${startup.id}`;

  return (
    <div className="card group hover:border-accent/40 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors">
            {startup.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={12} /> {startup.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <TrendingUp size={12} /> {startup.industry}
            </span>
          </div>
        </div>
        <div className="badge-blue text-[10px] uppercase tracking-wider">{startup.stage}</div>
      </div>

      <p className="text-gray-400 text-sm line-clamp-2 mb-5 h-10">
        {startup.description}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4 bg-dark-700/50 p-2.5 rounded-lg border border-dark-400">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Raised</p>
          <p className="text-sm font-bold text-green-400">{formatCurrency(totalRaised)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Target</p>
          <p className="text-sm font-bold text-white">{formatCurrency(startup.fundingGoal)}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-400 font-medium">{progress.toFixed(1)}% funded</span>
          <span className="text-gray-500">{formatCurrency(remaining)} left</span>
        </div>
        <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Link
        to={detailUrl}
        className="btn-secondary w-full flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-white transition-all"
      >
        View Details <ChevronRight size={14} />
      </Link>
    </div>
  );
};

export default StartupCard;
