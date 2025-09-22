const DashboardCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      <div className="text-3xl text-blue-500 mr-4">{icon}</div>
      <div>
        <h4 className="text-gray-500 text-sm font-medium uppercase">{title}</h4>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;