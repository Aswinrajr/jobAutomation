import { useState, useEffect } from "react";
import api from "../services/api";
import { Card, Button } from "../components/ui/Components";
import {
  FiBriefcase,
  FiMapPin,
  FiExternalLink,
  FiEdit3,
  FiX,
  FiCopy,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showOnlyApplied, setShowOnlyApplied] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get("/jobs/match");
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/applications");
      setApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const isApplied = (jobId) => {
    return applications.some((app) => (app.job?._id || app.job) === jobId);
  };

  const applyForJob = async (jobId) => {
    try {
      await api.post("/applications/apply", {
        jobId,
      });
      fetchApplications();
      alert("Application tracked! Good luck.");
    } catch (err) {
      alert(err.response?.data?.message || "Error tracking application");
    }
  };

  const generateCoverLetter = async (job) => {
    setSelectedJob(job);
    setCoverLetter("");
    setGenerating(true);

    try {
      const { data } = await api.post("/applications/generate-cover-letter", {
        jobId: job._id,
      });
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setCoverLetter(
        `ERROR: ${err.response?.data?.error || "Failed to generate cover letter. Please check your API key or connection."}`,
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 uppercase tracking-tight">
            {showOnlyApplied ? "Application History" : "Job Matches"}
          </h1>
          <p className="text-gray-400 mt-1">
            {showOnlyApplied
              ? "All jobs currently being tracked by the automation bot"
              : "Curated list based on your professional profile"}
          </p>
        </div>
        <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setShowOnlyApplied(false)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!showOnlyApplied ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:text-gray-300"}`}
          >
            ALL MATCHES
          </button>
          <button
            onClick={() => setShowOnlyApplied(true)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showOnlyApplied ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:text-gray-300"}`}
          >
            ONLY APPLIED
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {(() => {
          const displayList = showOnlyApplied
            ? applications.map((app) => ({
                ...app.job,
                matchScore:
                  app.matchScore ||
                  (app.notes?.match(/Score: (\d+)%/) || [])[1] ||
                  0,
                appliedAt: app.createdAt,
              }))
            : jobs;

          return displayList.map((job) => {
            if (!job || !job._id) return null;
            const applied = showOnlyApplied || isApplied(job._id);
            const appData = applications.find(
              (a) => (a.job?._id || a.job) === job._id,
            );

            return (
              <Card
                key={job._id}
                className="group overflow-hidden"
                hoverEffect={true}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Match Score */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2
                    ${
                      job.matchScore > 75
                        ? "border-purple-500 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        : job.matchScore > 40
                          ? "border-blue-500 text-blue-400 bg-blue-500/10"
                          : "border-gray-700 text-gray-500 bg-gray-900/50"
                    }`}
                    >
                      <span className="text-xl font-bold">
                        {job.matchScore || 0}%
                      </span>
                      <span className="text-[10px] uppercase font-black tracking-tighter">
                        Match
                      </span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors">
                            {job.title}
                          </h3>
                          {applied && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-md">
                              <FiCheckCircle /> Applied
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 font-medium">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="text-purple-500" />{" "}
                        {job.location || "Remote"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiBriefcase className="text-blue-500" /> {job.source}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-2 min-w-[170px]">
                    {applied && appData && (
                      <div className="mb-2 bg-green-500/5 border border-green-500/10 rounded-xl p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">
                            Verified ID
                          </span>
                          <FiCheckCircle className="text-green-500 text-[10px]" />
                        </div>
                        <p className="text-[10px] font-mono text-gray-300 truncate">
                          {appData.trackingId || "TRK-XXXX"}
                        </p>
                      </div>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-[10px] border-gray-800 hover:border-purple-500/30 font-bold"
                      onClick={() => generateCoverLetter(job)}
                    >
                      <FiEdit3 className="text-purple-400" /> AI Letter
                    </Button>

                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-[10px] bg-gray-900 border-gray-800 hover:bg-gray-800 font-bold"
                      >
                        Apply <FiExternalLink />
                      </Button>
                    </a>

                    {applied ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-[10px] bg-blue-500/5 border-blue-500/20 text-blue-400 font-black tracking-widest hover:bg-blue-500/10"
                        onClick={() => {
                          if (appData) {
                            alert(
                              `--- JOB APPLICATION RECEIPT ---\n\nRef: ${appData.trackingId}\n\nSTAMPED LOGS:\n${appData.verificationLog?.map((v) => `[${v.status}] ${v.step} (${new Date(v.timestamp).toLocaleTimeString()})`).join("\n") || "No logs available"}\n\nStatus: DISPATCHED TO GATEWAY`,
                            );
                          }
                        }}
                      >
                        <FiActivity className="mr-1" /> Show Receipt
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => applyForJob(job._id)}
                        className="w-full font-bold shadow-lg shadow-purple-500/20"
                      >
                        Track Apply
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          });
        })()}

        {!loading &&
          (showOnlyApplied ? applications.length === 0 : jobs.length === 0) && (
            <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-3xl">
              <FiBriefcase className="text-4xl mx-auto mb-4 opacity-10" />
              {showOnlyApplied
                ? "You haven't applied to any jobs yet. Run the automation to start!"
                : "No matching jobs found. Try running the automation or uploading a new resume."}
            </div>
          )}
      </div>

      {/* AI Cover Letter Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0f1115] w-full max-w-2xl rounded-3xl border border-gray-800 shadow-2xl shadow-purple-500/10 overflow-hidden"
            >
              <div className="flex items-center justify-between p-8 border-b border-gray-800 bg-gray-900/20">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FiEdit3 className="text-purple-500" />
                  Neural Letter Generator
                </h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="p-8">
                <div className="mb-6 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                    TARGETING POSITION
                  </p>
                  <p className="font-bold text-gray-200">
                    {selectedJob.title} at {selectedJob.company}
                  </p>
                </div>

                <div className="bg-black/50 rounded-2xl p-6 min-h-[300px] border border-gray-800 relative group">
                  {generating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-400 gap-4">
                      <div className="w-10 h-10 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
                      <p className="text-xs font-black uppercase tracking-widest animate-pulse">
                        Analyzing Job Context...
                      </p>
                    </div>
                  ) : (
                    <textarea
                      className="w-full h-[300px] bg-transparent text-gray-400 text-sm leading-relaxed resize-none focus:outline-none custom-scrollbar"
                      value={coverLetter}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/30">
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  className="rounded-xl px-8"
                  disabled={generating || !coverLetter}
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetter);
                    alert("Copied to clipboard!");
                  }}
                >
                  <FiCopy className="mr-2" /> Copy text
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;
