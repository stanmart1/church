import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export const useMemberDashboard = (userId: string | number) => {
  const [stats, setStats] = useState({
    downloadedSermons: 0,
    totalGiving: 0,
    eventsAttended: 0
  });
  const [recentSermons, setRecentSermons] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, sermonsData, eventsData] = await Promise.all([
        api.get(`/dashboard/member/${userId}/stats`),
        api.get(`/dashboard/member/${userId}/recent-sermons`),
        api.get(`/dashboard/member/${userId}/upcoming-events`)
      ]);
      setStats(statsData);
      setRecentSermons(sermonsData);
      setUpcomingEvents(eventsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, recentSermons, upcomingEvents, loading, refetch: fetchDashboardData };
};
