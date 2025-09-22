import EventCard from '../components/EventCard';

const dummyEvents = [
  { id: 1, title: 'Tech Conference 2025', date: '2025-10-15', location: 'San Francisco, CA' },
  { id: 2, title: 'Marketing Summit', date: '2025-11-05', location: 'New York, NY' },
  { id: 3, title: 'Design Workshop', date: '2025-11-20', location: 'Chicago, IL' },
];

const EventList = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyEvents.map(event => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.date}
            location={event.location}
          />
        ))}
      </div>
    </div>
  );
};

export default EventList;