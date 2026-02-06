import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui/Components";
import { FiBriefcase, FiMapPin, FiGlobe, FiCheckCircle } from "react-icons/fi";

const TrackJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    applyUrl: "",
    source: "External",
    status: "Applied", // Default status
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the Job
      const { data: jobData } = await api.post("/jobs", {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        location: formData.location,
        applyUrl: formData.applyUrl,
        source: formData.source,
      });

      // 2. Create the Application (Track it)
      await api.post("/applications/apply", {
        jobId: jobData._id,
        status: formData.status,
      });

      // 3. Redirect to Dashboard where they can see it
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Failed to track application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">
          Track New Application
        </h1>
        <p className="text-gray-400 mt-1">
          Manually add a job you've applied to on another site
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Senior React Developer"
            required
            icon={<FiBriefcase />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Netflix"
              required
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote"
              icon={<FiMapPin />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full group">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider transition-colors">
                Current Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-900/40 border border-gray-700/50 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interviewing</option>
                  <option value="Offer">Offer Received</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <Input
              label="Source / Platform"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g. LinkedIn"
            />
          </div>

          <Input
            label="Application/Job URL"
            name="applyUrl"
            value={formData.applyUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/jobs/..."
            required
            icon={<FiGlobe />}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider transition-colors">
              Notes / Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3.5 bg-gray-900/40 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
              placeholder="Paste job description or add notes here..."
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Application"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default TrackJob;
