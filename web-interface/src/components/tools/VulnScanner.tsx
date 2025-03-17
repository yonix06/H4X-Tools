import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../LoadingSpinner";

interface Vulnerability {
  id: string;
  port: string;
  service: string;
  host: string;
  title: string;
  output: string;
  cve_ids: string[];
  severity: string;
  severity_score: number;
}

interface VulnScannerResult {
  status: string;
  target: string;
  scan_type: string;
  intensity: string;
  vulnerabilities: Vulnerability[];
  open_ports: Array<{
    port: string;
    protocol: string;
    host: string;
  }>;
  services: Record<string, {
    name: string;
    product: string;
    version: string;
  }>;
  os_detection: Record<string, Array<{
    name: string;
    accuracy: string;
  }>>;
  stats: {
    duration: string;
    nmap_version?: string;
  };
  errors: string[];
}

const VulnScanner: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState("vuln");
  const [intensity, setIntensity] = useState("normal");
  const [result, setResult] = useState<VulnScannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/vuln-scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          target, 
          scan_type: scanType,
          intensity
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error running vulnerability scan");
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return isDark ? "bg-red-900 text-red-100" : "bg-red-200 text-red-900";
      case 'high':
        return isDark ? "bg-red-800/70 text-red-100" : "bg-red-100 text-red-900";
      case 'medium':
        return isDark ? "bg-yellow-800/70 text-yellow-100" : "bg-yellow-100 text-yellow-900";
      case 'low':
        return isDark ? "bg-blue-800/70 text-blue-100" : "bg-blue-100 text-blue-900";
      default:
        return isDark ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-300"}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Scanner de Vulnérabilités</h2>
        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Analyse une adresse IP, un hôte ou un réseau pour détecter les vulnérabilités connues.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="target" 
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Cible
            </label>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="192.168.1.1, example.com, 10.0.0.0/24"
              className="input-field"
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Adresse IP, nom d'hôte ou plage d'adresses IP (CIDR)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="scanType" 
                className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Type de scan
              </label>
              <select
                id="scanType"
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="input-field"
              >
                <option value="basic">Basique (ports et services)</option>
                <option value="vuln">Vulnérabilités</option>
                <option value="all">Complet (tous les tests)</option>
              </select>
            </div>

            <div>
              <label 
                htmlFor="intensity" 
                className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Intensité
              </label>
              <select
                id="intensity"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="input-field"
              >
                <option value="light">Légère (discrète)</option>
                <option value="normal">Normale</option>
                <option value="aggressive">Agressive (rapide mais bruyante)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !target.trim()}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner size="small" /> : "Lancer le scan"}
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
            Scan en cours... Cela peut prendre plusieurs minutes selon la cible et le type de scan.
          </p>
        </div>
      )}

      {result && !loading && (
        <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                Résultats pour {result.target}
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
            {/* Sommaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Ports ouverts
                </div>
                <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {result.open_ports?.length || 0}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Services détectés
                </div>
                <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {Object.keys(result.services || {}).length}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-50"}`}>
                <div className={`text-sm font-medium mb-1 ${isDark ? "text-red-300" : "text-red-600"}`}>
                  Vulnérabilités
                </div>
                <div className={`text-xl font-bold ${isDark ? "text-red-200" : "text-red-700"}`}>
                  {result.vulnerabilities?.length || 0}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Durée du scan
                </div>
                <div className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {result.stats?.duration || "N/A"}
                </div>
              </div>
            </div>

            {/* Vulnérabilités */}
            {result.vulnerabilities && result.vulnerabilities.length > 0 ? (
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Vulnérabilités détectées
                </h4>
                <div className="space-y-3">
                  {result.vulnerabilities
                    .sort((a, b) => b.severity_score - a.severity_score)
                    .map((vuln, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <h5 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {vuln.title || vuln.id}
                        </h5>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                      </div>
                      
                      {vuln.cve_ids && vuln.cve_ids.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {vuln.cve_ids.map((cve, cveIdx) => (
                            <span 
                              key={cveIdx} 
                              className={`px-2 py-0.5 text-xs rounded-full 
                                ${isDark ? "bg-purple-900/50 text-purple-200" : "bg-purple-100 text-purple-800"}`
                              }
                            >
                              {cve}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Port:</span> {vuln.port}
                          </div>
                          <div>
                            <span className="font-medium">Service:</span> {vuln.service}
                          </div>
                        </div>
                        
                        {vuln.output && (
                          <div className="mt-2">
                            <details>
                              <summary className="cursor-pointer font-medium hover:underline">Détails</summary>
                              <div className={`mt-2 p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                {vuln.output}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg text-center ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
                <p className={`${isDark ? "text-green-300" : "text-green-700"}`}>
                  Aucune vulnérabilité n'a été détectée. Cela ne garantit pas l'absence de vulnérabilités.
                </p>
              </div>
            )}

            {/* Ports Ouverts */}
            {result.open_ports && result.open_ports.length > 0 && (
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Ports ouverts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.open_ports.map((port, idx) => {
                    const portKey = `${port.host}:${port.port}/${port.protocol}`;
                    const service = result.services[portKey];
                    
                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                            {port.port}/{port.protocol}
                          </div>
                          {service && (
                            <span className={`px-2 py-0.5 text-xs rounded-full
                              ${isDark ? "bg-blue-900/50 text-blue-200" : "bg-blue-100 text-blue-800"}`}>
                              {service.name}
                            </span>
                          )}
                        </div>
                        
                        {service && (service.product || service.version) && (
                          <div className={`mt-1 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            {service.product} {service.version}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* OS Detection */}
            {result.os_detection && Object.keys(result.os_detection).length > 0 && (
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Détection de système d'exploitation
                </h4>
                <div className="space-y-3">
                  {Object.entries(result.os_detection).map(([host, matches], idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                    >
                      <div className={`font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Hôte: {host}
                      </div>
                      <div className="space-y-1">
                        {matches.map((match, matchIdx) => (
                          <div key={matchIdx} className="flex justify-between">
                            <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>{match.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full
                              ${isDark ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-800"}`}>
                              Précision: {match.accuracy}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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

export default VulnScanner;