import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../LoadingSpinner";

interface BannedIP {
  ip: string;
  jail: string;
  timeOfBan: string;
  timeRemaining?: string;
  attempts?: number;
}

interface Jail {
  name: string;
  enabled: boolean;
  filter: string;
  activeBans: number;
  totalBans: number;
  findtime: string;
  maxretry: number;
  bantime: string;
}

interface Fail2banManagerResult {
  status: string;
  bannedIPs: BannedIP[];
  jails: Jail[];
  stats: {
    version: string;
    totalBans: number;
    activeJails: number;
    lastRestart: string;
  };
  logs: string[];
  errors: string[];
}

const Fail2banManager: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [result, setResult] = useState<Fail2banManagerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJail, setSelectedJail] = useState<string>("all");
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);

  const fetchFail2banData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tools/fail2ban-manager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jail: selectedJail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erreur de récupération des données Fail2ban");
      }

      if (data.status === "error") {
        throw new Error(data.message);
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFail2banData();
    
    // Configurer l'actualisation automatique
    let intervalId: NodeJS.Timeout;
    if (isAutoRefresh) {
      intervalId = setInterval(fetchFail2banData, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedJail, refreshInterval, isAutoRefresh]);

  const handleUnbanIP = async (ip: string, jail?: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/security/unban-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          ip,
          jail: jail || selectedJail
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.status === "error") {
        throw new Error(data.message || `Échec du déblocage de l'IP ${ip}`);
      }

      // Mettre à jour les données après le déblocage
      fetchFail2banData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-300"}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Gestionnaire Fail2ban</h2>
        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Gérez et visualisez les bannissements automatiques opérés par Fail2ban.
        </p>

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label 
              htmlFor="jailSelector" 
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Jail
            </label>
            <select
              id="jailSelector"
              value={selectedJail}
              onChange={(e) => setSelectedJail(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="all">Toutes les jails</option>
              {result?.jails.map((jail) => (
                <option key={jail.name} value={jail.name}>
                  {jail.name} ({jail.activeBans})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label 
              htmlFor="refreshInterval" 
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Actualisation (sec)
            </label>
            <input
              id="refreshInterval"
              type="number"
              min="5"
              max="600"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="input-field w-24"
              disabled={!isAutoRefresh}
            />
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
              />
              <span className={`ml-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Auto-actualiser</span>
            </label>
          </div>

          <div className="flex items-end ml-auto">
            <button
              onClick={fetchFail2banData}
              disabled={loading}
              className="btn-secondary flex items-center space-x-1"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Actualiser</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
          <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>{error}</p>
        </div>
      )}

      {loading && !result && (
        <div className={`p-6 rounded-lg text-center ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-300"}`}>
          <LoadingSpinner size="large" />
          <p className={`mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Chargement des données Fail2ban...
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Statistiques */}
          <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
            <div className={`px-4 py-3 border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
              <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                Statistiques Fail2ban
              </h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Version
                  </div>
                  <div className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.version || "N/A"}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Jails actives
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.activeJails || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-red-300" : "text-red-600"}`}>
                    Bans actifs
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-red-200" : "text-red-700"}`}>
                    {result.bannedIPs.length || 0}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                  <div className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Total bans
                  </div>
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {result.stats.totalBans || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des Jails */}
          <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
            <div className={`px-4 py-3 border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
              <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                Jails configurées
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                      Nom
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                      Statut
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                      Bans actifs
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                      Durée ban
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                      Tentatives max
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                  {result.jails.map((jail) => (
                    <tr key={jail.name} className={isDark ? "bg-gray-800" : "bg-white"}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                        {jail.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          jail.enabled 
                            ? (isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800") 
                            : (isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800")
                        }`}>
                          {jail.enabled ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                        {jail.activeBans}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                        {jail.bantime}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                        {jail.maxretry} en {jail.findtime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* IPs bannies */}
          <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
            <div className={`px-4 py-3 border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  IPs bannies {selectedJail !== "all" ? `(${selectedJail})` : ""}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${isDark ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800"}`}>
                  {result.bannedIPs.length} IPs
                </span>
              </div>
            </div>
            
            {result.bannedIPs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                  <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Adresse IP
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Jail
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Banni le
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Tentatives
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Temps restant
                      </th>
                      <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                    {result.bannedIPs.map((ban) => (
                      <tr key={`${ban.ip}-${ban.jail}`} className={isDark ? "bg-gray-800" : "bg-white"}>
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {ban.ip}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                          {ban.jail}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                          {new Date(ban.timeOfBan).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                          {ban.attempts || "N/A"}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                          {ban.timeRemaining || "Permanent"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleUnbanIP(ban.ip, ban.jail)}
                            className={`text-xs px-3 py-1 rounded-lg ${isDark ? "bg-red-900/50 text-red-200 hover:bg-red-800" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
                          >
                            Débloquer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`p-8 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Aucune IP bannie {selectedJail !== "all" ? `dans la jail ${selectedJail}` : ""}
              </div>
            )}
          </div>

          {/* Journaux */}
          {result.logs && result.logs.length > 0 && (
            <div className={`rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
              <div className={`px-4 py-3 border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  Journaux récents
                </h3>
              </div>
              
              <div className={`p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                <div className={`max-h-96 overflow-y-auto p-2 rounded text-xs font-mono whitespace-pre-wrap ${isDark ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                  {result.logs.join('\n')}
                </div>
              </div>
            </div>
          )}

          {/* Erreurs */}
          {result.errors && result.errors.length > 0 && (
            <div className={`rounded-lg border ${isDark ? "bg-red-900/20 border-red-800/40" : "bg-red-50 border-red-200"}`}>
              <div className={`px-4 py-3 border-b ${isDark ? "border-red-800/40 bg-red-900/30" : "border-red-200 bg-red-100/80"}`}>
                <h3 className={`font-medium ${isDark ? "text-red-200" : "text-red-800"}`}>
                  Erreurs
                </h3>
              </div>
              
              <div className="p-4">
                <ul className={`list-disc pl-5 ${isDark ? "text-red-300" : "text-red-700"}`}>
                  {result.errors.map((err, idx) => (
                    <li key={idx} className="mb-1">{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Fail2banManager;