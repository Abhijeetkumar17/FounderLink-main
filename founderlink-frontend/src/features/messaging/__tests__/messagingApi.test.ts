import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the axiosConfig module
vi.mock('../../../core/interceptors/axiosConfig', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from '../../../core/interceptors/axiosConfig';
import {
  sendMessage,
  getConversationMessages,
  getMyConversations,
  startConversation,
} from '../api/messagingApi';

const mockedApi = vi.mocked(api);

describe('Messaging API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: sendMessage
  // ═══════════════════════════════════════════════════════════

  it('should call POST /messages with correct data', async () => {
    const messageData = { receiverId: 2, content: 'Hello!' };
    mockedApi.post.mockResolvedValue({ data: { data: { id: 1, ...messageData } } });

    await sendMessage(messageData);
    expect(mockedApi.post).toHaveBeenCalledWith('/messages', messageData);
  });

  it('should send message with numeric receiverId', async () => {
    mockedApi.post.mockResolvedValue({ data: {} });

    await sendMessage({ receiverId: 42, content: 'Test' });
    expect(mockedApi.post).toHaveBeenCalledWith('/messages', { receiverId: 42, content: 'Test' });
  });

  it('should send message with string receiverId', async () => {
    mockedApi.post.mockResolvedValue({ data: {} });

    await sendMessage({ receiverId: '42', content: 'Test' });
    expect(mockedApi.post).toHaveBeenCalledWith('/messages', { receiverId: '42', content: 'Test' });
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: getConversationMessages
  // ═══════════════════════════════════════════════════════════

  it('should call GET /messages/conversation/:id', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [] } });

    await getConversationMessages(42);
    expect(mockedApi.get).toHaveBeenCalledWith('/messages/conversation/42');
  });

  it('should support string conversationId', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [] } });

    await getConversationMessages('abc');
    expect(mockedApi.get).toHaveBeenCalledWith('/messages/conversation/abc');
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: getMyConversations
  // ═══════════════════════════════════════════════════════════

  it('should call GET /messages/conversations', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [] } });

    await getMyConversations();
    expect(mockedApi.get).toHaveBeenCalledWith('/messages/conversations');
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: startConversation
  // ═══════════════════════════════════════════════════════════

  it('should call POST /messages/conversations?otherUserId=:id', async () => {
    mockedApi.post.mockResolvedValue({ data: { data: { conversationId: 1 } } });

    await startConversation(5);
    expect(mockedApi.post).toHaveBeenCalledWith('/messages/conversations?otherUserId=5');
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception handling
  // ═══════════════════════════════════════════════════════════

  it('should propagate errors from sendMessage', async () => {
    mockedApi.post.mockRejectedValue(new Error('Send failed'));

    await expect(sendMessage({ receiverId: 2, content: 'fail' })).rejects.toThrow('Send failed');
  });

  it('should propagate errors from getConversationMessages', async () => {
    mockedApi.get.mockRejectedValue({ response: { status: 403 } });

    await expect(getConversationMessages(1)).rejects.toEqual(
      expect.objectContaining({ response: expect.objectContaining({ status: 403 }) }),
    );
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: empty content
  // ═══════════════════════════════════════════════════════════

  it('should allow sending empty content (validation is server-side)', async () => {
    mockedApi.post.mockResolvedValue({ data: {} });

    await sendMessage({ receiverId: 2, content: '' });
    expect(mockedApi.post).toHaveBeenCalledWith('/messages', { receiverId: 2, content: '' });
  });
});
