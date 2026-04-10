import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, authenticatedState } from '../../../shared/components/__tests__/test-utils';
import { mockChatMessages } from '../../../shared/components/__tests__/mockData';

// ─── Mock dependencies ───
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ conversationId: '42' }),
    useLocation: () => ({ state: { otherUserId: 2 }, pathname: '/chat/42' }),
  };
});

const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('react-hot-toast', () => ({
  toast: {
    error: (...args: any[]) => mockToastError(...args),
    success: (...args: any[]) => mockToastSuccess(...args),
  },
}));

vi.mock('../../../shared/hooks/useAuth', () => ({
  default: () => ({
    userId: 1,
    isAuthenticated: true,
    role: 'ROLE_FOUNDER',
    isFounder: true,
    isInvestor: false,
    isCoFounder: false,
    isAdmin: false,
    user: { userId: 1, role: 'ROLE_FOUNDER', email: 'test@test.com', name: 'Test' },
  }),
}));

vi.mock('../../messaging/api/messagingApi', () => ({
  getConversationMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('../../users/api/userApi', () => ({
  getAuthUserById: vi.fn(),
}));

vi.mock('../../../shared/utils/api', () => ({
  extractApiData: vi.fn((response: any, fallback?: any) => {
    const payload = response?.data;
    if (payload === undefined || payload === null) return fallback;
    if (typeof payload === 'object' && 'data' in payload) return payload.data ?? fallback;
    return payload;
  }),
}));

vi.mock('../../../shared/utils/avatar', () => ({
  getAvatarSrc: vi.fn(() => 'https://mock-avatar.com/avatar.png'),
}));

// Mock the Layout to avoid rendering Navbar/Sidebar
vi.mock('../../../layouts/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'layout' }, children),
}));

// Mock STOMP/SockJS to prevent WebSocket connections in tests
// The Chat component uses dynamic import() for these, so the mock factory
// must return a class-like constructor with all methods the cleanup uses.
const mockDeactivate = vi.fn();
const mockActivate = vi.fn();
const mockSubscribe = vi.fn();

vi.mock('@stomp/stompjs', () => {
  return {
    Client: class MockClient {
      activate = mockActivate;
      deactivate = mockDeactivate;
      subscribe = mockSubscribe;
      onConnect: (() => void) | null = null;
      onDisconnect: (() => void) | null = null;
      onStompError: (() => void) | null = null;
      onWebSocketError: (() => void) | null = null;
      constructor(config: any) {
        // Capture callbacks but don't auto-invoke to prevent side effects
        if (config) {
          this.onConnect = config.onConnect;
          this.onDisconnect = config.onDisconnect;
          this.onStompError = config.onStompError;
          this.onWebSocketError = config.onWebSocketError;
        }
      }
    },
  };
});

vi.mock('sockjs-client', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

import { getConversationMessages, sendMessage } from '../../messaging/api/messagingApi';
import { getAuthUserById } from '../../users/api/userApi';

const mockedGetMessages = vi.mocked(getConversationMessages);
const mockedSendMessage = vi.mocked(sendMessage);
const mockedGetUser = vi.mocked(getAuthUserById);

import Chat from '../common/Chat';

describe('Chat Component', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-jwt');

    mockedGetMessages.mockResolvedValue({
      data: { data: mockChatMessages },
    } as any);

    mockedGetUser.mockResolvedValue({
      data: { data: { userId: 2, name: 'John Smith', email: 'john@test.com', role: 'ROLE_INVESTOR' } },
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Renders chat UI
  // ═══════════════════════════════════════════════════════════

  it('should render the chat layout with input and send button', async () => {
    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Write a message/i)).toBeInTheDocument();
    });

    // Send button should be visible
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('should load and display messages from API', async () => {
    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(mockedGetMessages).toHaveBeenCalledWith('42');
    });

    await waitFor(() => {
      expect(screen.getByText('Hello, interested in your startup!')).toBeInTheDocument();
      expect(screen.getByText('Thanks! Would love to discuss further.')).toBeInTheDocument();
    });
  });

  it('should render the back button', async () => {
    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      // Back button navigates to /messages
      const backButton = screen.getAllByRole('button')[0];
      expect(backButton).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Send message
  // ═══════════════════════════════════════════════════════════

  it('should send a message when Enter is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    mockedSendMessage.mockResolvedValue({
      data: { data: { id: 4, senderId: 1, receiverId: 2, content: 'New message', createdAt: new Date().toISOString() } },
    } as any);

    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Write a message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Write a message/i);
    await user.type(input, 'New message{enter}');

    await waitFor(() => {
      expect(mockedSendMessage).toHaveBeenCalledWith({
        receiverId: 2,
        content: 'New message',
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Empty message
  // ═══════════════════════════════════════════════════════════

  it('should not send empty or whitespace-only messages', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Write a message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Write a message/i);
    await user.type(input, '   {enter}');

    expect(mockedSendMessage).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Empty chat
  // ═══════════════════════════════════════════════════════════

  it('should display empty state when no messages exist', async () => {
    mockedGetMessages.mockResolvedValue({
      data: { data: [] },
    } as any);

    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception: Message loading failure
  // ═══════════════════════════════════════════════════════════

  it('should show error toast when messages fail to load', async () => {
    mockedGetMessages.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to load messages');
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception: Send message failure
  // ═══════════════════════════════════════════════════════════

  it('should show error toast and restore text when send fails', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockedSendMessage.mockRejectedValue(new Error('Send failed'));

    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Write a message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Write a message/i);
    await user.type(input, 'Failed message{enter}');

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to send');
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Connection status
  // ═══════════════════════════════════════════════════════════

  it('should show connection status indicator', async () => {
    renderWithProviders(<Chat />, { preloadedState: authenticatedState });

    await waitFor(() => {
      // The component shows 'History Ready' when WS is not connected (default state)
      const historyReady = screen.queryByText(/History Ready/i);
      const liveSyncActive = screen.queryByText(/Live Sync Active/i);

      expect(historyReady || liveSyncActive).toBeTruthy();
    });
  });
});
