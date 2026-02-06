import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Components";
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import { motion } from "framer-motion";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <Card className="flex items-center gap-4 p-5" hoverEffect={true}>
    <div className={`p-3 rounded-xl bg-opacity-10 ${color.bg}`}>
      <Icon className={`text-2xl ${color.text}`} />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
    </div>
  </Card>
);

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    interview: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get("/applications");
        setApplications(data);

        const s = {
          total: data.length,
          interview: data.filter((a) => a.status === "Interview").length,
          pending: data.filter(
            (a) => a.status === "Pending" || a.status === "Applied",
          ).length,
          rejected: data.filter((a) => a.status === "Rejected").length,
        };
        setStats(s);
      } catch (error) {
        console.error(error);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Overview of your application progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applied"
          value={stats.total}
          icon={FiBriefcase}
          color={{ bg: "bg-blue-500", text: "text-blue-500" }}
        />
        <StatCard
          label="Interviews"
          value={stats.interview}
          icon={FiCheckCircle}
          color={{ bg: "bg-green-500", text: "text-green-500" }}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={FiClock}
          color={{ bg: "bg-yellow-500", text: "text-yellow-500" }}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={FiActivity}
          color={{ bg: "bg-red-500", text: "text-red-500" }}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-200">Recent Applications</h2>

        {applications.length === 0 ? (
          <Card className="text-center py-12" hoverEffect={false}>
            <p className="text-gray-500">
              No applications yet. Go apply for some jobs!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app, i) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6"
                  hoverEffect={true}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100">
                      {app.job?.title || "Unknown Job"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {app.job?.company} • {app.job?.location || "Remote"}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        app.status === "Interview"
                          ? "bg-green-500/10 text-green-500"
                          : app.status === "Rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
