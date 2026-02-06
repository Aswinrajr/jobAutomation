import { useState, useEffect } from "react";
import api from "../services/api";
import { Card, Button } from "../components/ui/Components";
import {
  FiCpu,
  FiPlay,
  FiActivity,
  FiTerminal,
  FiTrash2,
  FiTarget,
  FiClock,
} from "react-icons/fi";
import { motion } from "framer-motion";

const Automation = () => {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ found: 0, applied: 0, matched: 0 });
  const [dailyReport, setDailyReport] = useState(null);
  const [activeResume, setActiveResume] = useState(null);

  useEffect(() => {
    fetchActiveProfile();
    fetchDailyReport();
  }, []);

  const fetchDailyReport = async () => {
    try {
      const { data } = await api.get("/automation/stats");
      setDailyReport(data);
    } catch (err) {
      console.error("Failed to fetch daily report", err);
    }
  };

  const fetchActiveProfile = async () => {
    try {
      const { data } = await api.get("/resume");
      setActiveResume(data);
    } catch (err) {
      console.error("No active profile found", err);
    }
  };

  const purgeSystem = async () => {
    if (
      !window.confirm(
        "This will delete all jobs and application history. Are you sure?",
      )
    )
      return;
    try {
      await api.delete("/automation/purge");
      setStats({ found: 0, applied: 0, matched: 0 });
      setLogs([
        { type: "info", text: "System Greased & Purged. Dummy data cleared." },
      ]);
    } catch (err) {
      alert("Purge failed: " + err.message);
    }
  };

  const startAutomation = async () => {
    setRunning(true);
    setLogs((prev) => [
      ...prev,
      { type: "info", text: "Initializing Job Scraper Bot..." },
    ]);

    try {
      setLogs((prev) => [
        ...prev,
        {
          type: "info",
          text: `Targeting: ${(activeResume?.parsedContent?.keywords || []).slice(0, 5).join(", ")}...`,
        },
        {
          type: "info",
          text: "Connecting to 'WeWorkRemotely' live RSS feed...",
        },
      ]);

      const { data } = await api.post("/automation/run");

      setStats({
        found: data.found,
        matched: data.matched,
        applied: data.applied,
      });

      // Parse logs from details
      const newLogs = data.details.map((d) => {
        if (d.status === "Success")
          return {
            type: "success",
            text: `[APPLIED] ${d.title} @ ${d.company} - ${d.message}`,
          };
        if (d.status === "Skipped")
          return {
            type: "warning",
            text: `[SKIPPED] ${d.title} - Already Applied`,
          };
        return { type: "error", text: `[IGNORED] ${d.title} - ${d.message}` };
      });

      setLogs((prev) => [...prev, ...newLogs]);
      setLogs((prev) => [
        ...prev,
        {
          type: "info",
          text: `Bot Cycle Complete. Applied to ${data.applied} jobs.`,
        },
      ]);
      fetchDailyReport(); // Refresh the visual report panel
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        { type: "error", text: "Bot Error: " + error.message },
      ]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <FiCpu className="text-purple-500" />
            Auto-Apply Bot
          </h1>
          <p className="text-gray-400 mt-1">
            Automatically scrape, match, and apply to jobs based on your
            profile.
          </p>
        </div>
        <Button
          variant="secondary"
          className="text-red-400 hover:text-red-300 border-red-500/20"
          onClick={purgeSystem}
        >
          <FiTrash2 /> Reset System
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
              <FiTerminal /> valid_bot_session_01
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${running ? "bg-green-500 animate-pulse" : "bg-gray-600"}`}
              ></span>
              <span className="text-sm font-mono text-gray-400">
                {running ? "ONLINE" : "IDLE"}
              </span>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl border border-gray-800 h-[400px] p-4 overflow-y-auto font-mono text-sm space-y-2 custom-scrollbar">
            {logs.length === 0 && (
              <p className="text-gray-600 italic">Waiting for command...</p>
            )}
            {logs.map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i}
                className={`
                            ${log.type === "info" && "text-blue-400"}
                            ${log.type === "success" && "text-green-400"}
                            ${log.type === "warning" && "text-yellow-400"}
                            ${log.type === "error" && "text-gray-500"}
                        `}
              >
                <span className="opacity-50 mr-2">
                  {new Date().toLocaleTimeString()} &gt;{" "}
                </span>
                {log.text}
              </motion.div>
            ))}
            {running && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-purple-400"
              >
                <span className="opacity-50 mr-2">
                  {new Date().toLocaleTimeString()} &gt;{" "}
                </span>
                _ Processing...
              </motion.div>
            )}
          </div>

          <Button
            onClick={startAutomation}
            disabled={running}
            className={`w-full ${running ? "opacity-50 cursor-not-allowed" : ""}`}
            variant="primary"
          >
            {running ? (
              <span className="flex items-center gap-2">
                <FiActivity className="animate-spin" /> Running...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiPlay /> Start Automation Agent
              </span>
            )}
          </Button>
        </Card>

        {/* Stats Panel */}
        <div className="space-y-6">
          {activeResume && (
            <Card className="bg-purple-900/10 border-purple-500/20">
              <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                <FiTarget /> Target Profile
              </h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">
                  ACTIVE RESUME
                </p>
                <p className="text-sm text-gray-200 font-semibold truncate bg-black/20 p-2 rounded-lg border border-white/5">
                  {activeResume.originalFileName}
                </p>
                <div className="pt-2">
                  <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">
                    Core Keywords
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeResume.parsedContent?.keywords
                      ?.slice(0, 10)
                      .map((k) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] rounded-md"
                        >
                          {k}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">
              Jobs Scanned
            </h3>
            <p className="text-4xl font-bold text-white">{stats.found}</p>
          </Card>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">
              Matched Profile
            </h3>
            <p className="text-4xl font-bold text-blue-400">{stats.matched}</p>
          </Card>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 border-green-500/20 bg-green-500/5">
            <h3 className="text-green-400/70 text-sm font-semibold uppercase tracking-wider mb-2">
              Auto-Applied
            </h3>
            <p className="text-4xl font-bold text-green-400">{stats.applied}</p>
          </Card>

          {dailyReport && (
            <Card className="bg-blue-900/10 border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest">
                  Today's Report
                </h3>
                <span className="bg-blue-500/20 px-2 py-0.5 rounded text-[10px] text-blue-400 font-black">
                  LIVE
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="text-3xl font-black text-white">
                    {dailyReport.count}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">
                    Applied Today
                  </p>
                </div>
                <div className="border-t border-blue-500/10 pt-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {dailyReport.applications?.map((app, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] text-gray-400 py-1 border-b border-white/5 last:border-0"
                    >
                      <span className="text-blue-400 font-bold">
                        {app.job?.company}
                      </span>{" "}
                      - {app.job?.title}
                    </div>
                  ))}
                  {dailyReport.count === 0 && (
                    <p className="text-[10px] text-gray-600 italic">
                      No applications sent yet today.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <h3 className="text-yellow-500/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <FiClock /> Scheduled Run
            </h3>
            <p className="text-lg font-bold text-gray-200">10:00 AM</p>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              Bot will wake up and scan top 50 matches every morning.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Automation;
