import { useState } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Components";
import { FiUploadCloud, FiFile, FiCheck, FiCpu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const CircularProgress = ({ progress }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-800"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="text-purple-500 transition-all duration-300 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-100">{progress}%</span>
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
          Parsing
        </span>
      </div>
    </div>
  );
};

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      handleUpload(selectedFile);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    return interval;
  };

  const handleUpload = async (selectedFile) => {
    const formData = new FormData();
    formData.append("resume", selectedFile);

    setUploading(true);
    setParsedData(null);
    const interval = simulateProgress();

    try {
      const { data } = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      clearInterval(interval);
      setProgress(100);

      // Artificial delay to show 100%
      setTimeout(() => {
        setParsedData(data.parsedContent);
        setUploading(false);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setError("Parsing failed. Please check your internet or file format.");
      setUploading(false);
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <FiCpu className="text-purple-500" />
          Neural Resume Parser
        </h1>
        <p className="text-gray-400 mt-1">
          Deep analysis of skills and experience. Upload to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <Card className="p-0 overflow-hidden border-gray-800 h-full">
          <div className="p-8 space-y-6">
            <div
              className={`
              border-2 border-dashed rounded-2xl p-12 text-center transition-all relative min-h-[300px] flex flex-col items-center justify-center
              ${uploading ? "border-purple-500/50 bg-purple-500/5" : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/20"}
            `}
            >
              {!uploading ? (
                <>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 text-3xl mb-2">
                      <FiUploadCloud />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-100">
                        {file ? file.name : "Drop Resume Here"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        PDF or DOCX (Max 5MB)
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                  <CircularProgress progress={progress} />
                  <p className="mt-6 text-gray-400 font-medium animate-pulse">
                    Analyzing experience clusters...
                  </p>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {!uploading && !parsedData && (
              <div className="flex items-center gap-3 p-4 bg-gray-900/40 rounded-xl text-xs text-gray-500 border border-gray-800">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                System ready for automated extraction
              </div>
            )}
          </div>
        </Card>

        {/* Results Section */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {parsedData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="space-y-6 border-purple-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400">
                      <FiCheck className="text-xl" />
                      <span className="font-bold uppercase tracking-widest text-xs">
                        Analysis Complete
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-[10px] font-black border border-purple-500/30 uppercase tracking-widest">
                      EXP: {parsedData.totalExperience || "N/A"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                      Extracted Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const skills =
                          parsedData.keywords || parsedData.skills || [];
                        return skills.length > 0 ? (
                          skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-lg text-xs border border-purple-500/20 hover:border-purple-500/40 transition-colors capitalize"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-gray-600 italic">
                            No tech stack detected. Try a more detailed resume.
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {parsedData.experience &&
                    parsedData.experience.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                          Experience Timeline
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {parsedData.experience.map((exp, i) => (
                            <div
                              key={i}
                              className="bg-black/20 p-4 rounded-xl border border-gray-800 group hover:border-gray-700 transition-colors"
                            >
                              <h4 className="text-gray-100 font-bold text-sm group-hover:text-purple-400 transition-colors">
                                {exp.title}
                              </h4>
                              <div className="flex justify-between text-[10px] text-gray-500 mt-1 mb-3 font-bold uppercase tracking-wider">
                                <span>{exp.company}</span>
                                <span className="text-purple-500/70">
                                  {exp.dates}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </Card>
              </motion.div>
            ) : (
              !uploading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[400px] flex flex-col items-center justify-center p-12 text-center text-gray-600 border border-gray-800 rounded-3xl bg-gray-900/10 border-dashed"
                >
                  <FiFile className="text-5xl mb-4 opacity-10" />
                  <p className="text-sm font-medium">
                    Automatic report will appear here
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
