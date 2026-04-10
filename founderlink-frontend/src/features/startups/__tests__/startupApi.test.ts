import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the axiosConfig module
vi.mock('../../../core/interceptors/axiosConfig', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../../core/interceptors/axiosConfig';
import {
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup,
  approveStartup,
  rejectStartup,
  followStartup,
  unfollowStartup,
  checkFollowStatus,
  getStartupsByFounder,
  getAllStartupsAdmin,
} from '../api/startupApi';

const mockedApi = vi.mocked(api);

describe('Startup API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  //  CRUD Operations
  // ═══════════════════════════════════════════════════════════

  it('should call POST /startups to create a startup', async () => {
    const data = { name: 'TestStartup', industry: 'Tech', fundingGoal: 100000 };
    mockedApi.post.mockResolvedValue({ data: { data: { id: 1, ...data } } });

    await createStartup(data);
    expect(mockedApi.post).toHaveBeenCalledWith('/startups', data);
  });

  it('should call GET /startups with pagination params', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [] } });

    await getAllStartups(2, 20);
    expect(mockedApi.get).toHaveBeenCalledWith('/startups?page=2&size=20');
  });

  it('should use default pagination params', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [] } });

    await getAllStartups();
    expect(mockedApi.get).toHaveBeenCalledWith('/startups?page=0&size=10');
  });

  it('should call GET /startups/:id', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: { id: 1, name: 'Test' } } });

    await getStartupById(1);
    expect(mockedApi.get).toHaveBeenCalledWith('/startups/1');
  });

  it('should call GET /startups/:id with string id', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: { id: 1 } } });

    await getStartupById('abc');
    expect(mockedApi.get).toHaveBeenCalledWith('/startups/abc');
  });

  it('should call PUT /startups/:id to update', async () => {
    mockedApi.put.mockResolvedValue({ data: { data: { id: 1, name: 'Updated' } } });

    await updateStartup(1, { name: 'Updated' });
    expect(mockedApi.put).toHaveBeenCalledWith('/startups/1', { name: 'Updated' });
  });

  it('should call DELETE /startups/:id', async () => {
    mockedApi.delete.mockResolvedValue({ data: {} });

    await deleteStartup(1);
    expect(mockedApi.delete).toHaveBeenCalledWith('/startups/1');
  });

  // ═══════════════════════════════════════════════════════════
  //  Admin actions
  // ═══════════════════════════════════════════════════════════

  it('should call PUT /startups/:id/approve', async () => {
    mockedApi.put.mockResolvedValue({ data: {} });

    await approveStartup(5);
    expect(mockedApi.put).toHaveBeenCalledWith('/startups/5/approve');
  });

  it('should call PUT /startups/:id/reject', async () => {
    mockedApi.put.mockResolvedValue({ data: {} });

    await rejectStartup(5);
    expect(mockedApi.put).toHaveBeenCalledWith('/startups/5/reject');
  });

  it('should call GET /startups/admin/all', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [] } });

    await getAllStartupsAdmin();
    expect(mockedApi.get).toHaveBeenCalledWith('/startups/admin/all?page=0&size=100');
  });

  // ═══════════════════════════════════════════════════════════
  //  Following logic
  // ═══════════════════════════════════════════════════════════

  it('should call POST /startups/:id/follow', async () => {
    mockedApi.post.mockResolvedValue({ data: {} });

    await followStartup(10);
    expect(mockedApi.post).toHaveBeenCalledWith('/startups/10/follow');
  });

  it('should call POST /startups/:id/unfollow', async () => {
    mockedApi.post.mockResolvedValue({ data: {} });

    await unfollowStartup(10);
    expect(mockedApi.post).toHaveBeenCalledWith('/startups/10/unfollow');
  });

  it('should call GET /startups/:id/is-following', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: true } });

    await checkFollowStatus(10);
    expect(mockedApi.get).toHaveBeenCalledWith('/startups/10/is-following');
  });

  // ═══════════════════════════════════════════════════════════
  //  Founder-specific
  // ═══════════════════════════════════════════════════════════

  it('should call GET /startups/founder/:founderId', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [] } });

    await getStartupsByFounder(1);
    expect(mockedApi.get).toHaveBeenCalledWith('/startups/founder/1');
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception handling
  // ═══════════════════════════════════════════════════════════

  it('should propagate 404 errors', async () => {
    mockedApi.get.mockRejectedValue({ response: { status: 404, data: { message: 'Not Found' } } });

    await expect(getStartupById(999)).rejects.toEqual(
      expect.objectContaining({ response: expect.objectContaining({ status: 404 }) }),
    );
  });

  it('should propagate 500 errors', async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 500, data: { message: 'Internal Server Error' } } });

    await expect(createStartup({})).rejects.toEqual(
      expect.objectContaining({ response: expect.objectContaining({ status: 500 }) }),
    );
  });
});
