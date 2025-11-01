import { api } from '@/services/api';

export const useEvents = () => {
  const getEvents = (params?: { search?: string; status?: string; type?: string; page?: number; limit?: number }) =>
    api.get(`/events?${new URLSearchParams(params as any).toString()}`);

  const getMemberEvents = (memberId: string | number, registeredOnly?: boolean) =>
    api.get(`/events/member/${memberId}${registeredOnly ? '?registered_only=true' : ''}`);

  const getEvent = (id: string | number) =>
    api.get(`/events/${id}`);

  const createEvent = (data: any) =>
    api.post('/events', data);

  const updateEvent = (id: string | number, data: any) =>
    api.put(`/events/${id}`, data);

  const deleteEvent = (id: string | number) =>
    api.delete(`/events/${id}`);

  const registerForEvent = (id: string | number, memberId: string | number) =>
    api.post(`/events/${id}/register`, { member_id: memberId });

  const unregisterFromEvent = (id: string | number, memberId: string | number) =>
    api.delete(`/events/${id}/register/${memberId}`);

  const getEventAttendees = (id: string | number) =>
    api.get(`/events/${id}/attendees`);

  const markAttendance = (id: string | number, memberId: string | number, attended: boolean) =>
    api.put(`/events/${id}/attendance/${memberId}`, { attended });

  return { getEvents, getMemberEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent, getEventAttendees, markAttendance };
};
