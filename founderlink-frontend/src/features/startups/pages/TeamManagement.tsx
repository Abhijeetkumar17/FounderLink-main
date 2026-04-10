import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Search, UserPlus, Users, User, CheckCircle,
  Briefcase, X, ChevronDown, Filter, Pencil, Check,
  Info, Sparkles, GraduationCap, ArrowRight
} from 'lucide-react';
import Layout from '../../../layouts/Layout';
import { getCoFounderIds, getProfilesBatch, getAuthUserById } from '../../users/api/userApi';
import { getTeamByStartup, inviteCoFounder, updateMemberRole } from '../../teams/api/teamApi';

const INVITE_ROLES = [
  { value: 'CTO',              label: 'CTO – Chief Technology Officer' },
  { value: 'CPO',              label: 'CPO – Chief Product Officer' },
  { value: 'MARKETING_HEAD',   label: 'Marketing Head' },
  { value: 'ENGINEERING_LEAD', label: 'Engineering Lead' },
];

const ROLE_BADGE: Record<string, string> = {
  FOUNDER:         'badge-purple',
  CO_FOUNDER:      'badge-purple',
  CTO:             'badge-blue',
  CPO:             'badge-blue',
  MARKETING_HEAD:  'badge-green',
  ENGINEERING_LEAD:'badge-yellow',
};

const ROLE_LABEL: Record<string, string> = {
  FOUNDER:         'Founder',
  CO_FOUNDER:      'Co-Founder',
  CTO:             'CTO',
  CPO:             'CPO',
  MARKETING_HEAD:  'Marketing Head',
  ENGINEERING_LEAD:'Engineering Lead',
};

export default function TeamManagement() {
  const { startupId } = useParams<{ startupId: string }>();

  const [skillInput, setSkillInput]     = useState('');
  const [searchMode, setSearchMode]     = useState<'role' | 'role+skill'>('role');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching]       = useState(false);
  const [searched, setSearched]         = useState(false);

  const [selected, setSelected]         = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('CTO');
  const [inviteDescription, setInviteDescription] = useState('');
  const [inviting, setInviting]         = useState(false);

  const [members, setMembers]           = useState<any[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<number, any>>({});
  const [loadingTeam, setLoadingTeam]   = useState(true);

  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingRole, setEditingRole]         = useState('');
  const [updatingRole, setUpdatingRole]       = useState(false);

  const loadTeam = useCallback(async () => {
    if (!startupId) return;
    setLoadingTeam(true);
    try {
      const res = await getTeamByStartup(startupId);
      const teamMembers = res.data || [];
      setMembers(teamMembers);

      if (teamMembers.length > 0) {
        const ids = teamMembers.map((m: any) => m.userId);
        const profileMap: Record<number, any> = {};
        const authResults = await Promise.allSettled(ids.map((id: number) => getAuthUserById(id)));
        
        authResults.forEach((result: any, i: number) => {
          if (result.status === 'fulfilled') {
            const u = result.value.data;
            profileMap[ids[i]] = { userId: u.userId, name: u.name, email: u.email };
          }
        });

        try {
          const profileRes = await getProfilesBatch(ids, '');
          (profileRes.data || []).forEach((p: any) => {
            profileMap[p.userId] = { ...profileMap[p.userId], ...p };
          });
        } catch {}
        setMemberProfiles(profileMap);
      }
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoadingTeam(false);
    }
  }, [startupId]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  const handleSearch = async () => {
    if (searchMode === 'role+skill' && !skillInput.trim()) {
      toast.error('Please enter a skill');
      return;
    }

    setSearching(true);
    setSearched(false);
    try {
      const authRes = await getCoFounderIds();
      const coFounders = authRes.data || [];

      if (coFounders.length === 0) {
        setSearchResults([]);
        setSearched(true);
        return;
      }

      const allIds = coFounders.map((u: any) => u.userId);
      const skill = searchMode === 'role+skill' ? skillInput.trim() : '';
      const profileRes = await getProfilesBatch(allIds, skill);
      const profiles = profileRes.data || [];

      const profileMap: Record<number, any> = {};
      profiles.forEach((p: any) => { profileMap[p.userId] = p; });

      const merged = coFounders.filter((u: any) => {
        if (searchMode === 'role') return true;
        return !!profileMap[u.userId];
      }).map((auth: any) => {
        const p = profileMap[auth.userId] || {};
        return { ...auth, ...p, hasProfile: !!p.userId };
      });

      setSearchResults(merged);
      setSearched(true);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!selected || !startupId) return;
    setInviting(true);
    try {
      await inviteCoFounder({
        startupId: parseInt(startupId),
        invitedUserId: selected.userId,
        role: selectedRole,
        description: inviteDescription,
      });
      toast.success(`Invite sent to ${selected.name}!`);
      setSelected(null);
      setInviteDescription('');
      loadTeam();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Team Management</h1>
          <p className="text-gray-500 mt-2">Recruit top talent and manage your startup's core leadership.</p>
        </div>

        {/* Search Co-founders Section */}
        <div className="card space-y-6 bg-dark-800/40 border-dark-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-accent" /> Find Potential Partners
            </h2>
            <div className="flex bg-dark-700 p-1 rounded-xl border border-dark-500">
              <button 
                onClick={() => setSearchMode('role')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${searchMode === 'role' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                BY ROLE
              </button>
              <button 
                onClick={() => setSearchMode('role+skill')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${searchMode === 'role+skill' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                SKILLS FILTER
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            {searchMode === 'role+skill' && (
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  className="input-field pl-12 py-3 bg-dark-900 border-dark-400 group"
                  placeholder="e.g. React, Python, Product Design..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                />
              </div>
            )}
            <button 
              onClick={handleSearch} 
              disabled={searching}
              className="btn-primary px-8 flex items-center gap-2 shadow-lg shadow-accent/10 whitespace-nowrap"
            >
              <Search size={18} /> {searching ? 'Searching...' : 'Explore Catalog'}
            </button>
          </div>

          {/* Results Grid */}
          {searched && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dark-500">
              {searchResults.length === 0 ? (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-dark-500 rounded-3xl">
                  <span className="text-gray-600 font-bold uppercase tracking-widest">No candidates matching your criteria</span>
                </div>
              ) : (
                searchResults.map(user => (
                  <div 
                    key={user.userId} 
                    onClick={() => setSelected(user)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer group ${selected?.userId === user.userId ? 'border-accent bg-accent/5 ring-1 ring-accent/30' : 'bg-dark-700/30 border-dark-500 hover:border-dark-400'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent overflow-hidden">
                        {user.hasProfile ? <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} alt="" /> : <User size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white group-hover:text-accent-light transition-colors">{user.name}</h4>
                        <p className="text-[10px] text-gray-500 font-black uppercase mb-3">{user.email}</p>
                        
                        {user.hasProfile ? (
                          <div className="space-y-3">
                            <p className="text-xs text-gray-400 line-clamp-2 italic leading-relaxed">"{user.bio}"</p>
                            <div className="flex flex-wrap gap-1.5">
                              {user.skills?.split(',').slice(0, 3).map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent-light text-[9px] font-black uppercase border border-accent/20">{s.trim()}</span>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-600 font-bold flex items-center gap-1">
                              <GraduationCap size={12} /> {user.experience || 'Experience not specified'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-dark-800 rounded-2xl border border-dark-500 mt-2">
                             <p className="text-[10px] text-gray-500 font-bold leading-tight">
                               📋 This user hasn't set up their profile yet. You can still invite them to join the conversation.
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Invitation Modal-like Section */}
        {selected && (
          <div className="card shadow-2xl border-accent/40 bg-accent/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-xl"><UserPlus size={20} className="text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white">Invite {selected.name}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Define their role and provide context for the request</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-dark-600 rounded-full text-gray-500 transition-all"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Select Position</label>
                <div className="space-y-2">
                  {INVITE_ROLES.map(r => (
                    <button 
                      key={r.value} 
                      onClick={() => setSelectedRole(r.value)}
                      className={`w-full text-left p-3 rounded-2xl border text-sm font-bold transition-all ${selectedRole === r.value ? 'bg-accent border-accent text-white shadow-lg' : 'bg-dark-700 border-dark-500 text-gray-400 hover:border-dark-400'}`}
                    >
                      {r.label.split(' – ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Reason for invitation</label>
                <textarea 
                  className="input-field h-full min-h-[160px] py-4 bg-dark-900 border-dark-400 resize-none"
                  placeholder="Tell them why you want them on the team (e.g. 'Your background in AWS architecture is a perfect match for our fintech scaling phase...')"
                  value={inviteDescription}
                  onChange={e => setInviteDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleInvite} 
                disabled={inviting}
                className="btn-primary px-12 py-3 text-lg font-black shadow-xl shadow-accent/20 flex items-center gap-2 group"
              >
                {inviting ? '🚀 Transmitting...' : <>Send Official Invite <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
          </div>
        )}

        {/* Team List Section */}
        <div className="card bg-dark-800/40 border-dark-500">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users size={20} className="text-accent" /> Your Core Team
          </h2>
          {loadingTeam ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-20 bg-dark-700 rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {members.map(m => {
                const p = memberProfiles[m.userId] || {};
                return (
                  <div key={m.id} className="p-4 bg-dark-700/50 rounded-3xl border border-dark-500 flex items-center justify-between group hover:border-accent/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-dark-900 border border-dark-500 flex items-center justify-center text-accent">
                         <img src={`https://ui-avatars.com/api/?name=${p.name || 'U'}&background=1f2937&color=6366f1`} className="rounded-xl" alt="" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{p.name || 'Loading...'}</h4>
                        <p className="text-[10px] text-gray-500 font-black uppercase">{m.role.replace('_', ' ')} • Joined {new Date(m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${m.role === 'FOUNDER' ? 'bg-accent/20 text-accent' : 'bg-dark-500 text-gray-400'}`}>
                        {m.role === 'FOUNDER' ? 'Creator' : 'Member'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
