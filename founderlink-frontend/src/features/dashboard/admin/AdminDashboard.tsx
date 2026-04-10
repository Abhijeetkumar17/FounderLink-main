import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck, Trash2, Users, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import { approveStartup, deleteStartup, getAllStartupsAdmin, rejectStartup } from '../../startups/api/startupApi';
import { getAllProfiles, getUsersByRole } from '../../users/api/userApi';
import { extractApiData } from '../../../shared/utils/api';

interface StartupRecord {
  id: number;
  founderId: number;
  name: string;
  description: string;
  industry: string;
  location: string;
  stage: string;
  fundingGoal: number;
  isApproved: boolean;
  isRejected?: boolean;
}

interface UserSummary {
  userId: number;
  name?: string;
  email?: string;
  role?: string;
  bio?: string;
  skills?: string;
  experience?: string;
}

const ROLE_ORDER = ['ROLE_ADMIN', 'ROLE_FOUNDER', 'ROLE_INVESTOR', 'ROLE_COFOUNDER'] as const;

const formatRole = (role?: string) => role?.replace('ROLE_', '').replace('COFOUNDER', 'CO-FOUNDER') || 'USER';
const formatCurrency = (amount: number) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

const AdminDashboard = () => {
  const [startups, setStartups] = useState<StartupRecord[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [startupRes, profileRes, ...roleResponses] = await Promise.all([
        getAllStartupsAdmin(),
        getAllProfiles(0, 100),
        ...ROLE_ORDER.map((role) => getUsersByRole(role)),
      ]);

      const startupPage = extractApiData<any>(startupRes, { content: [] });
      const profilePage = extractApiData<any>(profileRes, { content: [] });

      const startupList = Array.isArray(startupPage) ? startupPage : startupPage?.content || [];
      const profileList = Array.isArray(profilePage) ? profilePage : profilePage?.content || [];

      const authUsersByRole = roleResponses.flatMap((response, index) => {
        const role = ROLE_ORDER[index];
        const usersForRole = extractApiData<any[]>(response, []);
        return usersForRole.map((user) => ({
          userId: Number(user.userId),
          name: user.name,
          email: user.email,
          role,
        }));
      });

      const mergedUsers = new Map<number, UserSummary>();

      authUsersByRole.forEach((user) => {
        mergedUsers.set(user.userId, { ...mergedUsers.get(user.userId), ...user });
      });

      profileList.forEach((profile: any) => {
        const userId = Number(profile.userId);
        mergedUsers.set(userId, {
          ...mergedUsers.get(userId),
          userId,
          name: profile.name || mergedUsers.get(userId)?.name,
          email: profile.email || mergedUsers.get(userId)?.email,
          bio: profile.bio,
          skills: profile.skills,
          experience: profile.experience,
        });
      });

      setStartups(startupList);
      setUsers(
        Array.from(mergedUsers.values()).sort((first, second) => {
          const firstRoleIndex = ROLE_ORDER.indexOf((first.role as any) || 'ROLE_COFOUNDER');
          const secondRoleIndex = ROLE_ORDER.indexOf((second.role as any) || 'ROLE_COFOUNDER');
          return firstRoleIndex - secondRoleIndex || (first.name || '').localeCompare(second.name || '');
        })
      );

      setRoleCounts({
        ROLE_ADMIN: authUsersByRole.filter((user) => user.role === 'ROLE_ADMIN').length,
        ROLE_FOUNDER: authUsersByRole.filter((user) => user.role === 'ROLE_FOUNDER').length,
        ROLE_INVESTOR: authUsersByRole.filter((user) => user.role === 'ROLE_INVESTOR').length,
        ROLE_COFOUNDER: authUsersByRole.filter((user) => user.role === 'ROLE_COFOUNDER').length,
      });
    } catch {
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingStartups = useMemo(
    () => startups.filter((startup) => !startup.isApproved && !startup.isRejected),
    [startups]
  );

  const approvedStartups = useMemo(
    () => startups.filter((startup) => startup.isApproved),
    [startups]
  );

  const rejectedStartups = useMemo(
    () => startups.filter((startup) => startup.isRejected),
    [startups]
  );

  const handleStartupAction = async (startupId: number, action: 'approve' | 'reject' | 'delete') => {
    setWorkingId(startupId);

    try {
      if (action === 'approve') {
        await approveStartup(startupId);
        toast.success('Startup approved');
      } else if (action === 'reject') {
        await rejectStartup(startupId);
        toast.success('Startup rejected');
      } else {
        await deleteStartup(startupId);
        toast.success('Startup deleted');
      }

      await loadDashboard();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${action} startup`);
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">Admin Command</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Admin Control Center</h1>
            <p className="text-gray-500 mt-2 text-lg">Review startups, manage platform users, and keep the marketplace healthy.</p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="btn-secondary px-6 py-3 rounded-2xl flex items-center gap-3 w-fit"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh Workspace
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="card bg-dark-800/40 border-dark-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total Startups</span>
            </div>
            <p className="text-4xl font-black text-white">{startups.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">Across approved, pending, and rejected states</p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400">
                <Clock3 size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pending Review</span>
            </div>
            <p className="text-4xl font-black text-white">{pendingStartups.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">Startups waiting for admin action</p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-400">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Investors</span>
            </div>
            <p className="text-4xl font-black text-white">{roleCounts.ROLE_INVESTOR || 0}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">Active investor accounts discovered</p>
          </div>

          <div className="card bg-dark-800/40 border-dark-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Approved Startups</span>
            </div>
            <p className="text-4xl font-black text-white">{approvedStartups.length}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold">Live and available on the platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <div className="card rounded-[32px] p-6 border-dark-500">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-white">Startup Approvals</h2>
                <p className="text-sm text-gray-500 mt-1">Approve, reject, or remove startup submissions from one place.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Rejected</p>
                <p className="text-lg font-black text-red-400">{rejectedStartups.length}</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-dark-800/40 rounded-[24px] animate-pulse border border-dark-500/50" />)}
              </div>
            ) : startups.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-dark-500 rounded-[32px] bg-dark-800/5">
                <h3 className="text-2xl font-black text-white">No startup records found</h3>
                <p className="text-gray-600 mt-2">Once founders submit startups, they’ll appear here for review.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[48rem] overflow-auto pr-1">
                {startups.map((startup) => {
                  const isPending = !startup.isApproved && !startup.isRejected;
                  const founder = users.find((user) => user.userId === Number(startup.founderId));

                  return (
                    <div key={startup.id} className="rounded-[28px] border border-dark-500 bg-dark-800/20 p-5 space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-black text-white">{startup.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              startup.isApproved
                                ? 'bg-green-500/10 text-green-400'
                                : startup.isRejected
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {startup.isApproved ? 'Approved' : startup.isRejected ? 'Rejected' : 'Pending Review'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{startup.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <span>{startup.stage}</span>
                            <span>{startup.industry}</span>
                            <span>{startup.location}</span>
                            <span>{formatCurrency(startup.fundingGoal)}</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Founder: <span className="text-gray-300 font-semibold">{founder?.name || founder?.email || `User #${startup.founderId}`}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStartupAction(startup.id, 'approve')}
                                disabled={workingId === startup.id}
                                className="px-4 py-2 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-sm hover:bg-green-500/20 transition-all disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStartupAction(startup.id, 'reject')}
                                disabled={workingId === startup.id}
                                className="px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleStartupAction(startup.id, 'delete')}
                            disabled={workingId === startup.id}
                            className="px-4 py-2 rounded-2xl bg-dark-900 border border-dark-500 text-gray-300 font-bold text-sm hover:border-red-500/40 hover:text-red-400 transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card rounded-[32px] p-6 border-dark-500">
              <h2 className="text-2xl font-black text-white mb-5">Role Snapshot</h2>
              <div className="space-y-4">
                {ROLE_ORDER.map((role) => (
                  <div key={role} className="flex items-center justify-between p-4 rounded-2xl bg-dark-800/20 border border-dark-500">
                    <span className="text-sm font-bold text-gray-300">{formatRole(role)}</span>
                    <span className="text-xl font-black text-white">{roleCounts[role] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-[32px] p-6 border-dark-500">
              <h2 className="text-2xl font-black text-white mb-5">User Directory</h2>
              <div className="space-y-3 max-h-[34rem] overflow-auto pr-1">
                {users.length === 0 && !loading ? (
                  <div className="py-8 text-center text-gray-500">No users available.</div>
                ) : (
                  users.map((user) => (
                    <div key={user.userId} className="rounded-2xl border border-dark-500 bg-dark-800/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-bold">{user.name || `User #${user.userId}`}</p>
                          <p className="text-sm text-gray-500">{user.email || 'No email available'}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-accent/10 text-accent-light">
                          {formatRole(user.role)}
                        </span>
                      </div>
                      {user.skills && <p className="text-xs text-gray-400 mt-3">Skills: {user.skills}</p>}
                      {user.experience && <p className="text-xs text-gray-500 mt-1">Experience: {user.experience}</p>}
                      {user.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{user.bio}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card rounded-[32px] p-6 border-dark-500 bg-dark-800/20">
              <h2 className="text-xl font-black text-white mb-4">Admin Notes</h2>
              <div className="space-y-3 text-sm text-gray-400">
                <p>Approve startups to make them visible in the public marketplace.</p>
                <p>Reject unsuitable submissions to keep investor browsing clean.</p>
                <p>Delete records when admin intervention is needed across roles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
