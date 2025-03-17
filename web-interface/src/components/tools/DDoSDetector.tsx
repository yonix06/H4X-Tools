import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../LoadingSpinner";

interface DDoSAlert {
  timestamp: string;
  source_ip: string;
  packets_count: number;
  traffic_rate: string;
  attack_type?: string;
  protocol?: string;
  port?: string;
}

interface DDoSDetectorResult {
  status: string;
  interface?: string;
  monitoring_time?: string;
  threshold: number;
  window: number;
  alerts: DDoSAlert[];
  stats: {
    total_traffic: string;
    total_packets: number;
    peak_traffic_rate: string;
    unique_sources: number;
    duration: string;
  };
  logs?: string[];
  errors: string[];
}

const DDoSDetector: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [interface_, setInterface] = useState("");
  const [duration, setDuration] = useState("300");
  const [threshold, setThreshold] = useState("1000");
  const [window, setWindow] = useState("5");
  const [logFile, setLogFile] = useState("");
  const [useLogFile, setUseLogFile] = useState(false);
  const [result, setResult] = useState<DDoSDetectorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useLogFile && !logFile.trim()) return;
    if (!useLogFile && !interface_.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        threshold: parseInt(threshold),
        window: parseInt(window)
      };

      if (useLogFile) {
        payload.log_file = logFile;
      } else {
        payload.interface = interface_;
        payload.duration = parseInt(duration);
      }

      const response = await fetch("/api/tools/ddos-detector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error running DDoS detection");
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
        <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Détecteur DDoS</h2>
        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Analyse le trafic réseau pour détecter les tentatives d'attaques par déni de service distribué (DDoS).
        </p>

        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={!useLogFile}
                onChange={() => setUseLogFile(false)}
              />
              <span className={`ml-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Analyse en temps réel</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={useLogFile}
                onChange={() => setUseLogFile(true)}
              />
              <span className={`ml-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Analyse de fichier journal</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!useLogFile ? (
            <>
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
                  L'interface réseau à surveiller, par exemple eth0 ou wlan0
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
                  min="60"
                  max="3600"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field"
                />
                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Durée de l'analyse en secondes (60-3600)
                </p>
              </div>
            </>
          ) : (
            <div>
              <label 
                htmlFor="logFile" 
                className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Fichier Journal
              </label>
              <input
                id="logFile"
                type="text"
                value={logFile}
                onChange={(e) => setLogFile(e.target.value)}
                placeholder="/var/log/tcpdump.log"
                className="input-field"
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Chemin complet vers le fichier journal à analyser
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="threshold" 
                className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Seuil (paquets/sec)
              </label>
              <input
                id="threshold"
                type="number"
                min="100"
                max="100000"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="input-field"
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Nombre de paquets par seconde considéré comme suspect
              </p>
            </div>

            <div>
              <label 
                htmlFor="window" 
                className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Fenêtre d'analyse (secondes)
              </label>
              <input
                id="window"
                type="number"
                min="1"
                max="60"
                value={window}
                onChange={(e) => setWindow(e.target.value)}
                className="input-field"
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Période d'analyse pour la détection des pics de trafic
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (useLogFile ? !logFile.trim() : !interface_.trim())}
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
            <div className="flex justify-between items-center">
              <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                Résultats de l'analyse {result.interface ? `(${result.interface})` : ''}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full
                ${result.status === "completed" 
                  ? (isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800")
                  : (isDark ? "bg-yellow-900/50 text-yellow-200" : "bg-yellow-100 text-yellow-800")
                }`}>
                {result.status}
              </span>
            </div>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Statistiques */}
            <div>
              <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                Statistiques
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Trafic total
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.total_traffic || "N/A"}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Paquets totaux
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.total_packets || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Pic de trafic
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.peak_traffic_rate || "N/A"}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Sources uniques
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.unique_sources || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Durée de l'analyse
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.duration || "N/A"}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-red-300" : "text-red-600"}`}>
                    Alertes DDoS
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-red-200" : "text-red-700"}`}>
                    {result.alerts?.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Alertes */}
            {result.alerts && result.alerts.length > 0 ? (
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Alertes DDoS détectées
                </h4>
                <div className="space-y-3">
                  {result.alerts
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((alert, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <h5 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          Alerte trafic anormal
                        </h5>
                        {alert.attack_type && (
                          <span className={`px-2 py-0.5 text-xs rounded-full
                            ${isDark ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800"}`}>
                            {alert.attack_type}
                          </span>
                        )}
                      </div>
                      <div className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Source IP:</span> {alert.source_ip}
                          </div>
                          <div>
                            <span className="font-medium">Timestamp:</span> {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                          <div>
                            <span className="font-medium">Paquets:</span> {alert.packets_count}
                          </div>
                          <div>
                            <span className="font-medium">Débit:</span> {alert.traffic_rate}
                          </div>
                          {alert.protocol && (
                            <div>
                              <span className="font-medium">Protocole:</span> {alert.protocol}
                            </div>
                          )}
                          {alert.port && (
                            <div>
                              <span className="font-medium">Port:</span> {alert.port}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg text-center ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
                <p className={`${isDark ? "text-green-300" : "text-green-700"}`}>
                  Aucune attaque DDoS n'a été détectée pendant cette analyse.
                </p>
              </div>
            )}

            {/* Logs */}
            {result.logs && result.logs.length > 0 && (
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Journal détaillé
                </h4>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <details>
                    <summary className={`cursor-pointer font-medium ${isDark ? "text-gray-300" : "text-gray-600"} hover:underline`}>
                      Afficher les entrées du journal ({result.logs.length})
                    </summary>
                    <div className={`mt-2 p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                      {result.logs.join('\n')}
                    </div>
                  </details>
                </div>
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

export default DDoSDetector;