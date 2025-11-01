export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  start_time?: string;
  startTime?: string;
  time?: string;
  end_time?: string;
  endTime?: string;
  location: string;
  type?: string;
  category?: string;
  capacity?: number;
  attendees?: number;
  maxAttendees?: number;
  registered_count?: number;
  registeredCount?: number;
  registrationDeadline?: string;
  organizer?: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  registeredAt: string;
  attended: boolean;
}
