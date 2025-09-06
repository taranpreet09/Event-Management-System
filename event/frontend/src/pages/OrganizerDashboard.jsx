import DashboardCard from "../components/DashboardCard";

const OrganizerDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Organizer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Events" value="12" icon="🎉" />
        <DashboardCard title="Total Tickets Sold" value="4,582" icon="🎟️" />
        <DashboardCard title="Total Revenue" value="$85,320" icon="💰" />
      </div>
    </div>
  );
};

export default OrganizerDashboard;