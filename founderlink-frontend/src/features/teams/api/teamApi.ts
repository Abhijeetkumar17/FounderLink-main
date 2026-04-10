import api from '../../../core/interceptors/axiosConfig';

export const inviteCoFounder = (data: any) => api.post('/teams/invite', data);
export const acceptInvitation = (invitationId: string | number) => api.post(`/teams/join/${invitationId}`);
export const rejectInvitation = (invitationId: string | number) => api.put(`/teams/reject/${invitationId}`);
export const getTeamByStartup = (startupId: string | number) => api.get(`/teams/startup/${startupId}`);
export const getMyInvitations = () => api.get('/teams/invitations/my');
export const updateMemberRole = (memberId: string | number, data: any) => api.put(`/teams/${memberId}/role`, data);
