import { useState, useEffect } from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import { api } from '../../services/api';

interface ServiceTime {
  id: number;
  day: string;
  time: string;
  service: string;
  description?: string;
}

export default function ServicesPage() {
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceTimes = async () => {
      try {
        const response = await api.get('/content/service-times');
        setServiceTimes(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching service times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTimes();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl opacity-90">Join us in worship and fellowship</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : serviceTimes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 max-w-2xl mx-auto">
              <i className="ri-calendar-line text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-600 font-medium">No service times available</p>
              <p className="text-sm text-gray-500 mt-1">Please check back later for updated service schedules</p>
            </div>
          ) : (
            <div className={`grid gap-8 ${serviceTimes.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : serviceTimes.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {serviceTimes.map((service, index) => {
                const colors = [
                  { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'ri-sun-line' },
                  { bg: 'bg-green-100', text: 'text-green-600', icon: 'ri-moon-line' },
                  { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'ri-book-open-line' },
                  { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'ri-time-line' },
                ];
                const color = colors[index % colors.length];
                const formatTime = (time: string) => {
                  const [hours, minutes] = time.split(':');
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes} ${ampm}`;
                };
                return (
                  <div key={service.id} className="flex items-start space-x-4 p-8 bg-white rounded-lg shadow-md border border-gray-200 min-h-[200px] transition-all duration-500 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 cursor-pointer">
                    <div className={`w-12 h-12 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`${color.icon} ${color.text} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.service}</h3>
                      {service.description && <p className="text-gray-600 mb-2 text-sm">{service.description}</p>}
                      <p className={`text-sm ${color.text} font-medium`}>{service.day} • {formatTime(service.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
