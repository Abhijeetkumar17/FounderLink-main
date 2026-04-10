import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, ChevronRight, Search, Users, UserPlus as UserPlusIcon, Zap, Target, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getMyConversations, startConversation } from '../../messaging/api/messagingApi';
import { getAuthUserById, getUsersByRole } from '../../users/api/userApi';
import { User } from '../../../shared/types';
import { extractApiData } from '../../../shared/utils/api';
import { getAvatarSrc } from '../../../shared/utils/avatar';

interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  createdAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface ConversationEventDetail {
  conversationId?: string | number;
  message?: {
    content?: string;
    createdAt?: string;
    senderId?: number;
  };
}

const formatRole = (role?: string) => role?.replace('ROLE_', '').replace('COFOUNDER', 'CO-FOUNDER') || 'USER';

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userMap, setUserMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [messageable, setMessageable] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);

  const navigate = useNavigate();
  const { userId, isFounder, isInvestor, isCoFounder } = useAuth();
  const exploreLink = isFounder ? '/founder/startups/browse' : isInvestor ? '/investor/startups' : '/cofounder/startups';

  const updateConversationPreview = useCallback((conversationId: string | number, message?: { content?: string; createdAt?: string; senderId?: number }) => {
    setConversations((currentConversations) => {
      const nextConversations = currentConversations.map((conversation) => {
        if (String(conversation.id) !== String(conversationId)) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: message?.content || conversation.lastMessage,
          lastMessageAt: message?.createdAt || new Date().toISOString(),
          unreadCount: message?.senderId && message.senderId !== userId ? (conversation.unreadCount ?? 0) + 1 : conversation.unreadCount ?? 0,
        };
      });

      return [...nextConversations].sort((first, second) => {
        const firstTime = first.lastMessageAt ? new Date(first.lastMessageAt).getTime() : 0;
        const secondTime = second.lastMessageAt ? new Date(second.lastMessageAt).getTime() : 0;
        return secondTime - firstTime;
      });
    });
  }, [userId]);

  const loadConversations = useCallback(async (silent = false) => {
    if (!userId) return;

    if (!silent) {
      setLoading(true);
    }

    const rolesToFetch = isFounder
      ? ['ROLE_INVESTOR', 'ROLE_COFOUNDER']
      : isInvestor
      ? ['ROLE_FOUNDER']
      : isCoFounder
      ? ['ROLE_FOUNDER']
      : [];

    try {
      const [conversationsRes, ...userArrays] = await Promise.all([
        getMyConversations(),
        ...rolesToFetch.map((role) => getUsersByRole(role)),
      ]);

      const loadedConversations = extractApiData<Conversation[]>(conversationsRes, []);
      setConversations(loadedConversations);

      const availableUsers: User[] = userArrays
        .map((response) => extractApiData<User[]>(response, []))
        .flat()
        .filter((user) => user.userId !== userId);

      setMessageable(availableUsers);

      const nextUserMap: Record<number, User> = {};
      availableUsers.forEach((user) => {
        nextUserMap[user.userId] = user;
      });

      const coveredIds = new Set(availableUsers.map((user) => user.userId));
      const extraIds = [...new Set(
        loadedConversations.map((conversation) => conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id)
      )].filter((id) => !coveredIds.has(id));

      if (extraIds.length > 0) {
        const extraUsers = await Promise.all(extraIds.map(async (id): Promise<[number, User | null]> => {
          try {
            const response = await getAuthUserById(id);
            return [id, extractApiData<User | null>(response, null)];
          } catch {
            return [id, null];
          }
        }));

        extraUsers.forEach(([id, data]) => {
          if (data) {
            nextUserMap[id] = data;
          }
        });
      }

      setUserMap(nextUserMap);
    } catch {
      if (!silent) {
        toast.error('Failed to load conversations');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [userId, isFounder, isInvestor, isCoFounder]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const handleConversationUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ConversationEventDetail>).detail;
      if (detail?.conversationId) {
        updateConversationPreview(detail.conversationId, detail.message);
      }
    };

    window.addEventListener('conversation-updated', handleConversationUpdated);
    return () => window.removeEventListener('conversation-updated', handleConversationUpdated);
  }, [updateConversationPreview]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userId || conversations.length === 0) {
      setLiveConnected(false);
      return;
    }

    let active = true;
    let client: any = null;
    const subscriptions: any[] = [];

    const connect = async () => {
      try {
        const [{ Client }, { default: SockJS }] = await Promise.all([
          import('@stomp/stompjs'),
          import('sockjs-client'),
        ]);

        if (!active) {
          return;
        }

        client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8086/ws'),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
            'X-User-Id': String(userId),
          },
          reconnectDelay: 5000,
          onConnect: () => {
            if (!active) {
              return;
            }

            setLiveConnected(true);

            conversations.forEach((conversation) => {
              const subscription = client.subscribe(`/topic/conversation/${conversation.id}`, (frame: any) => {
                try {
                  const message = JSON.parse(frame.body);
                  updateConversationPreview(conversation.id, message);
                } catch {
                  loadConversations(true);
                }
              });

              subscriptions.push(subscription);
            });
          },
          onDisconnect: () => {
            if (active) {
              setLiveConnected(false);
            }
          },
          onStompError: () => {
            if (active) {
              setLiveConnected(false);
            }
          },
          onWebSocketError: () => {
            if (active) {
              setLiveConnected(false);
            }
          },
        });

        client.activate();
      } catch {
        if (active) {
          setLiveConnected(false);
        }
      }
    };

    connect();

    return () => {
      active = false;
      setLiveConnected(false);
      subscriptions.forEach((subscription) => subscription.unsubscribe?.());
      client?.deactivate();
    };
  }, [conversations, userId, loadConversations, updateConversationPreview]);

  useEffect(() => {
    if (liveConnected || !userId) return;

    const interval = window.setInterval(() => {
      loadConversations(true);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [liveConnected, loadConversations, userId]);

  const filtered = search.trim().length > 0
    ? messageable.filter((user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelectUser = async (user: User) => {
    setSearch('');
    setShowDropdown(false);

    try {
      const response = await startConversation(user.userId);
      const conversation = extractApiData<Conversation | null>(response, null);
      if (!conversation) throw new Error('Conversation missing');
      navigate(`/messages/${conversation.id}`, { state: { otherUserId: user.userId } });
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Communication Hub</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Messages</h1>
            <p className="text-gray-500 mt-2 text-lg">Direct encrypted channels with your venture partners.</p>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search transmissions..."
              className="bg-dark-800/40 border border-dark-500 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all outline-none md:w-80 font-medium"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-dark-800 border border-dark-500 rounded-3xl shadow-2xl overflow-hidden glassmorphism">
                {filtered.slice(0, 6).map((user) => (
                  <button
                    key={user.userId}
                    onMouseDown={() => handleSelectUser(user)}
                    className="w-full text-left px-5 py-4 hover:bg-accent/10 border-b border-dark-500 last:border-0 transition-all flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-dark-700 border border-dark-500 flex items-center justify-center shrink-0 group-hover:border-accent/40 transition-all">
                      <span className="text-accent font-black text-sm">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold group-hover:text-accent-light transition-colors">{user.name || user.email}</p>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{formatRole(user.role)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card bg-dark-800/20 border-dark-500 rounded-[40px] overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-24 h-24 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6 border border-dark-500 shadow-inner">
                <MessageSquare size={40} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Inboxes Neutral</h3>
              <p className="text-gray-600 mt-2">Start a conversation from a project or profile.</p>
              <Link to={exploreLink} className="mt-8 inline-flex items-center gap-2 border border-dark-500 px-6 py-3 rounded-2xl text-xs font-black uppercase text-white hover:border-accent transition-all">
                Explore Ventures <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-dark-500/30">
              {conversations.map((conversation) => {
                const otherId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
                const otherUser = userMap[otherId];
                const hasPreview = Boolean(conversation.lastMessage?.trim());
                const rightStatus = conversation.lastMessageAt
                  ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : hasPreview
                  ? 'JUST NOW'
                  : 'NEW';

                return (
                  <button
                    key={conversation.id}
                    onClick={() => navigate(`/messages/${conversation.id}`, { state: { otherUserId: otherId } })}
                    className="w-full text-left block p-6 hover:bg-accent/[0.03] transition-all group border-l-4 border-l-transparent hover:border-l-accent"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-dark-900 border border-dark-500 flex items-center justify-center overflow-hidden relative shadow-inner group-hover:border-accent/40 transition-all">
                        <img
                          src={getAvatarSrc(otherId, otherUser?.name || otherUser?.email, 'U')}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {(conversation.unreadCount ?? 0) > 0 && (
                          <div className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-accent border-2 border-dark-800 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-black text-white group-hover:text-accent-light transition-colors truncate">
                            {otherUser?.name || otherUser?.email || `User #${otherId}`}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase">
                            <Clock size={12} />
                            {rightStatus}
                          </div>
                        </div>
                        <p className="text-gray-500 truncate font-medium text-sm pr-10">
                          {conversation.lastMessage || 'Start a conversation...'}
                        </p>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">
                          {formatRole(otherUser?.role)}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-gray-700 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          <div className="card bg-dark-900/40 p-8 border-dark-500 rounded-[40px] flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
              <Users size={100} />
            </div>
            <div className="p-4 bg-accent/10 rounded-[24px] text-accent">
              <UserPlusIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">Team Building</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Direct recruitment via profile pings.</p>
            </div>
          </div>
          <div className="card bg-dark-900/40 p-8 border-dark-500 rounded-[40px] flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
              <Target size={100} />
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-[24px] text-yellow-500">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">Venture Terms</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Discuss equity and funding directly.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
