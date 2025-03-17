import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../LoadingSpinner";

interface SnortResult {
  status: string;
  alerts: Array<{
    message: string;
    classification: string;
    priority: string;
    src_ip: string;
    dst_ip: string;
    timestamp: string;
    protocol: string;
  }>;
  stats: {
    packets_received: number;
    packets_analyzed: number;
    packets_dropped: number;
    alert_count: number;
    version?: string;
  };
  errors: string[];
}

const SnortIDS: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [interface_, setInterface] = useState("");
  const [duration, setDuration] = useState("60");
  const [result, setResult] = useState<SnortResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interface_.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/snort-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          interface: interface_, 
          duration: parseInt(duration)
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error executing Snort IDS");
      }

      if (data.status === "error") {
        throw new Error(data.message);
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-300"}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Snort IDS</h2>
        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Analyse le trafic réseau en temps réel pour détecter les intrusions et menaces potentielles.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="interface" 
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Interface Réseau
            </label>
            <input
              id="interface"
              type="text"
              value={interface_}
              onChange={(e) => setInterface(e.target.value)}
              placeholder="eth0, wlan0, etc."
              className="input-field"
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              L&apos;interface réseau à surveiller, par exemple eth0 ou wlan0
            </p>
          </div>

          <div>
            <label 
              htmlFor="duration" 
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Durée (secondes)
            </label>
            <input
              id="duration"
              type="number"
              min="10"
              max="600"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input-field"
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Durée de l&apos;analyse en secondes (10-600)
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !interface_.trim()}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner size="small" /> : "Démarrer l'analyse"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
          <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>{error}</p>
        </div>
      )}

      {loading && (
        <div className={`p-6 rounded-lg text-center ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-300"}`}>
          <LoadingSpinner size="large" />
          <p className={`mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Analyse en cours... Cela peut prendre quelques minutes.
          </p>
        </div>
      )}

      {result && !loading && (
        <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
            <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              Résultats de l&apos;analyse ({result.status})
            </h3>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Statistiques */}
            <div>
              <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                Statistiques
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Paquets reçus
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.packets_received || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Paquets analysés
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.packets_analyzed || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Paquets perdus
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.packets_dropped || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-red-300" : "text-red-600"}`}>
                    Alertes
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-red-200" : "text-red-700"}`}>
                    {result.stats.alert_count || result.alerts.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Alertes */}
            {result.alerts && result.alerts.length > 0 ? (
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Alertes détectées
                </h4>
                <div className="space-y-3">
                  {result.alerts.map((alert, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <h5 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {alert.message || "Alert non définie"}
                        </h5>
                        <span className={`px-2 py-0.5 text-xs rounded-full
                          ${alert.priority > "2" 
                            ? (isDark ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800")
                            : (isDark ? "bg-yellow-900/50 text-yellow-200" : "bg-yellow-100 text-yellow-800")
                          }`}>
                          {alert.classification || "Priority: " + (alert.priority || "Unknown")}
                        </span>
                      </div>
                      <div className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Source:</span> {alert.src_ip}
                          </div>
                          <div>
                            <span className="font-medium">Destination:</span> {alert.dst_ip}
                          </div>
                          <div>
                            <span className="font-medium">Protocole:</span> {alert.protocol}
                          </div>
                          <div>
                            <span className="font-medium">Timestamp:</span> {alert.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg text-center ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
                <p className={`${isDark ? "text-green-300" : "text-green-700"}`}>
                  Aucune alerte n&apos;a été détectée pendant cette analyse.
                </p>
              </div>
            )}

            {/* Erreurs */}
            {result.errors && result.errors.length > 0 && (
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Erreurs
                </h4>
                <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/30" : "bg-red-50"}`}>
                  <ul className={`list-disc pl-5 ${isDark ? "text-red-300" : "text-red-700"}`}>
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SnortIDS;
