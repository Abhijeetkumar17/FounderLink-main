import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, RefreshCw, Send, Wifi } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getConversationMessages, sendMessage } from '../../messaging/api/messagingApi';
import { getAuthUserById } from '../../users/api/userApi';
import { extractApiData } from '../../../shared/utils/api';
import { getAvatarSrc } from '../../../shared/utils/avatar';

interface ChatMessage {
  id?: number | string;
  senderId: number;
  receiverId?: number;
  content: string;
  createdAt?: string;
}

const MESSAGING_WS_URL = 'http://localhost:8086/ws';
const formatRole = (role?: string) => role?.replace('ROLE_', '').replace('COFOUNDER', 'CO-FOUNDER') || 'USER';

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();
  const state = (location.state || {}) as { otherUserId?: string | number };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [resolvedOtherUserId, setResolvedOtherUserId] = useState<string | number | null>(state.otherUserId || null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => {
    if (otherUser?.name) return otherUser.name;
    if (otherUser?.email) return otherUser.email;
    if (resolvedOtherUserId) return `User #${resolvedOtherUserId}`;
    return 'Conversation';
  }, [otherUser, resolvedOtherUserId]);

  const avatarSrc = useMemo(
    () => getAvatarSrc(resolvedOtherUserId, otherUser?.name || otherUser?.email, 'U'),
    [resolvedOtherUserId, otherUser?.name, otherUser?.email]
  );

  const mergeMessage = (incomingMessage: ChatMessage) => {
    setMessages((currentMessages) => {
      if (currentMessages.some((message) => message.id && incomingMessage.id && message.id === incomingMessage.id)) {
        return currentMessages;
      }

      return [...currentMessages, incomingMessage].sort((first, second) => {
        const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
        return firstTime - secondTime;
      });
    });

    window.dispatchEvent(new CustomEvent('conversation-updated', {
      detail: {
        conversationId,
        message: incomingMessage,
      },
    }));
  };

  const loadMessages = async (silent = false) => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getConversationMessages(conversationId);
      const payload = extractApiData<any>(response, []);
      const loadedMessages: ChatMessage[] = Array.isArray(payload) ? payload : payload?.content || payload?.messages || [];

      setMessages(loadedMessages);

      if (!state.otherUserId && loadedMessages.length > 0) {
        const derivedOtherUserId =
          loadedMessages.find((message) => message.senderId !== userId)?.senderId ??
          loadedMessages.find((message) => message.receiverId !== userId)?.receiverId;

        if (derivedOtherUserId) {
          setResolvedOtherUserId(derivedOtherUserId);
        }
      }
    } catch {
      if (!silent) {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId, userId, state.otherUserId]);

  useEffect(() => {
    if (!conversationId || liveConnected) return;

    const interval = window.setInterval(() => {
      loadMessages(true);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [conversationId, userId, state.otherUserId, liveConnected]);

  useEffect(() => {
    if (!resolvedOtherUserId) return;

    let active = true;

    getAuthUserById(resolvedOtherUserId as number)
      .then((response) => {
        if (active) {
          setOtherUser(extractApiData<any>(response, null));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [resolvedOtherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!conversationId || !userId || !token) {
      setLiveConnected(false);
      return;
    }

    let active = true;
    let client: any = null;

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
          webSocketFactory: () => new SockJS(MESSAGING_WS_URL),
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
            client.subscribe(`/topic/conversation/${conversationId}`, (frame: any) => {
              try {
                const incomingMessage = JSON.parse(frame.body) as ChatMessage;
                mergeMessage(incomingMessage);
              } catch {
                loadMessages(true);
              }
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
      if (client) {
        client.deactivate();
      }
    };
  }, [conversationId, userId]);

  const handleSend = async () => {
    if (!text.trim() || !resolvedOtherUserId) return;

    setSending(true);
    const pendingText = text;
    setText('');

    try {
      const response = await sendMessage({ receiverId: resolvedOtherUserId, content: pendingText });
      const sentMessage = extractApiData<ChatMessage | null>(response, null);

      if (sentMessage) {
        mergeMessage(sentMessage);
      } else {
        await loadMessages(true);
      }
    } catch {
      toast.error('Failed to send');
      setText(pendingText);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-14rem)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/messages')}
              className="p-3 bg-dark-700 border border-dark-500 rounded-2xl hover:bg-dark-600 transition-all text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center overflow-hidden">
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              </div>

              <div>
                <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${liveConnected ? 'bg-green-500' : refreshing ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {liveConnected ? 'Live Sync Active' : refreshing ? 'Syncing History' : 'History Ready'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">
                  {formatRole(otherUser?.role)}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => loadMessages(true)}
            className="hidden sm:flex items-center gap-2 bg-dark-800/40 border border-dark-500 rounded-2xl px-4 py-2 text-[10px] text-gray-400 font-bold uppercase"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <Wifi size={14} className={liveConnected ? 'text-green-400' : 'text-gray-500'} />
            Refresh
          </button>
        </div>

        <div className="card flex-1 overflow-y-auto p-6 space-y-4 border-dark-500/50 shadow-inner bg-dark-800/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-gray-300">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="px-8 py-10 rounded-[32px] border border-dark-500 bg-dark-900/40 text-center shadow-inner">
                <MessageSquare size={48} className="mb-4 text-accent-light mx-auto" />
                <p className="text-sm font-bold uppercase tracking-widest text-gray-200">
                  No messages yet. Start the conversation.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Your new messages will appear here in real time.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id ?? `${message.senderId}-${message.createdAt ?? index}`} className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md px-5 py-3 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                    message.senderId === userId
                      ? 'bg-gradient-to-br from-accent to-accent-light text-white rounded-br-none shadow-accent/10'
                      : 'bg-dark-700/80 text-gray-200 border border-dark-500 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-4 bg-dark-800/60 p-2 rounded-[32px] border border-dark-500 focus-within:border-accent/40 transition-all shadow-lg overflow-hidden glassmorphism">
          <input
            className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-white placeholder-gray-600 font-medium"
            placeholder="Write a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim() || !resolvedOtherUserId}
            className="p-3 bg-accent text-white rounded-[24px] hover:bg-accent-light transition-all shadow-lg shadow-accent/20 disabled:grayscale disabled:opacity-50 group"
          >
            <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
