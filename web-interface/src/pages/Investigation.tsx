import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import LoadingSpinner from "../components/LoadingSpinner";

interface Case {
  id: number;
  title: string;
  description: string;
  status: "active" | "closed" | "pending";
  severity: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

const Investigation: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newCase, setNewCase] = useState<Partial<Case>>({
    title: "",
    description: "",
    severity: "medium"
  });

  const fetchCases = async () => {
    try {
      const response = await fetch("/api/investigations");
      const data = await response.json();
      
      if (data.status === "success") {
        setCases(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch investigations");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async () => {
    if (!newCase.title) return;

    try {
      const response = await fetch("/api/investigations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newCase)
      });

      const data = await response.json();
      
      if (data.status === "success") {
        setCases([data.data, ...cases]);
        setIsNewCaseModalOpen(false);
        setNewCase({ title: "", description: "", severity: "medium" });
      } else {
        throw new Error(data.message || "Failed to create investigation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return isDark ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800";
      case "medium":
        return isDark ? "bg-yellow-900/50 text-yellow-200" : "bg-yellow-100 text-yellow-800";
      case "low":
        return isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800";
      default:
        return isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800";
      case "pending":
        return isDark ? "bg-yellow-900/50 text-yellow-200" : "bg-yellow-100 text-yellow-800";
      case "closed":
        return isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800";
      default:
        return isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`flex-1 h-full overflow-hidden ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Investigations
              </h1>
              <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Manage and track your investigations
              </p>
            </div>
            <button
              onClick={() => setIsNewCaseModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Investigation</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className={`p-4 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
                <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>{error}</p>
              </div>
            ) : cases.length === 0 ? (
              <div className={`
                text-center p-12 rounded-lg border-2 border-dashed
                ${isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-600"}
              `}>
                <svg 
                  className="w-12 h-12 mx-auto mb-4 opacity-50" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                  />
                </svg>
                <h3 className="text-lg font-medium mb-2">No investigations yet</h3>
                <p>Start by creating a new investigation</p>
                <button
                  onClick={() => setIsNewCaseModalOpen(true)}
                  className="mt-4 btn-secondary inline-flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Investigation</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cases.map(case_ => (
                  <div
                    key={case_.id}
                    className={`
                      p-6 rounded-xl shadow-lg border transition-all hover:shadow-xl
                      ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                    `}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {case_.title}
                        </h3>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Created {new Date(case_.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${getStatusColor(case_.status)}
                        `}>
                          {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                        </span>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${getSeverityColor(case_.severity)}
                        `}>
                          {case_.severity.charAt(0).toUpperCase() + case_.severity.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {case_.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Investigation Modal */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`
            w-full max-w-md rounded-xl shadow-xl
            ${isDark ? "bg-gray-800" : "bg-white"}
            p-6
          `}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              New Investigation
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={e => setNewCase({ ...newCase, title: e.target.value })}
                  className="input-field"
                  placeholder="Investigation title"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Description
                </label>
                <textarea
                  value={newCase.description}
                  onChange={e => setNewCase({ ...newCase, description: e.target.value })}
                  className="input-field min-h-[100px]"
                  placeholder="Investigation details"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Severity
                </label>
                <select
                  value={newCase.severity}
                  onChange={e => setNewCase({ ...newCase, severity: e.target.value as Case["severity"] })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCase}
                  className="btn-primary"
                  disabled={!newCase.title}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investigation;