const EventCard = ({ title, date, location }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <img src={`https://placehold.co/600x400/a0c4ff/333333?text=${title.replace(/\s+/g, '+')}`} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-1">Date: {date}</p>
        <p className="text-gray-600">Location: {location}</p>
      </div>
    </div>
  );
};

export default EventCard;