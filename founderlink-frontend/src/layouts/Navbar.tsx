import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, MessageSquare, LogOut } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { setUnreadCount } from '../store/slices/notificationSlice';
import { getUnreadNotifications } from '../features/notifications/api/notificationApi';
import useAuth from '../shared/hooks/useAuth';
import { extractApiData } from '../shared/utils/api';
import { getAvatarSrc, getStoredAvatar } from '../shared/utils/avatar';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userId, isFounder, isInvestor, isCoFounder } = useAuth();
  const unreadCount = useSelector((s: any) => s.notifications.unreadCount);
  const [avatarVersion, setAvatarVersion] = useState(0);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!userId) return;
    const fetchUnread = () => {
      getUnreadNotifications(userId)
        .then(res => dispatch(setUnreadCount(extractApiData<any[]>(res, []).length)))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [userId, dispatch]);

  useEffect(() => {
    const handleAvatarUpdate = () => setAvatarVersion((current) => current + 1);
    window.addEventListener('profile-avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('profile-avatar-updated', handleAvatarUpdate);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const dashboardLink = isFounder
    ? '/founder/dashboard'
    : isInvestor
    ? '/investor/dashboard'
    : isCoFounder
    ? '/cofounder/dashboard'
    : '/admin/dashboard';

  const avatarSrc = getStoredAvatar(userId) || getAvatarSrc(userId, user?.name || user?.email, user?.email?.[0]?.toUpperCase() || 'U');

  return (
    <nav className="bg-dark-800 border-b border-dark-500 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to={dashboardLink} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-white text-xs font-bold">FL</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">FounderLink</span>
      </Link>

      <div className="flex items-center gap-1">
        {(isFounder || isInvestor || isCoFounder) && (
          <>
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/messages"
              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors"
            >
              <MessageSquare size={19} />
            </Link>
          </>
        )}
        <Link
          to="/profile"
          className="p-1 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors"
        >
          <img
            key={avatarVersion}
            src={avatarSrc}
            alt="Profile"
            className="w-8 h-8 rounded-xl object-cover border border-dark-500"
          />
        </Link>
        <span className="text-sm text-gray-500 hidden md:block mx-2 border-l border-dark-400 pl-3">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-red-400 transition-colors"
          title="Sign out"
        >
          <LogOut size={19} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
