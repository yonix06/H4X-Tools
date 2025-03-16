import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native-web';
import './App.css';

// Import des contextes et composants
import { useTheme } from './contexts/ThemeContext';
import { useHistory } from './contexts/HistoryContext';
import { HistoryPanel } from './components/HistoryPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import apiService, { ApiResponse } from './services/api';
import { Tool } from './services/types';

// Définition des catégories
const CATEGORIES = {
  OSINT: 'OSINT & Reconnaissance',
  NETWORK: 'Network Tools',
  CRYPTO: 'Cryptography',
  GENERATOR: 'Generators',
  MISC: 'Miscellaneous'
} as const;

type CategoryKey = keyof typeof CATEGORIES;

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { addToHistory } = useHistory();
  const isDark = theme === 'dark';

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  
  // Liste des outils disponibles avec leurs catégories
  const [tools] = useState<(Tool & { category: CategoryKey })[]>([
    {
      id: 'ig_scrape',
      name: 'Ig Scrape',
      category: 'OSINT',
      description: 'Scrapes information from IG accounts',
      inputs: [{ name: 'username', placeholder: 'Enter Instagram username', type: 'text', value: '' }],
    },
    {
      id: 'web_search',
      name: 'Web Search',
      category: 'OSINT',
      description: 'Searches the internet for the given query.',
      inputs: [{ name: 'query', placeholder: 'Enter search query', type: 'text', value: '' }],
    },
    {
      id: 'phone_lookup',
      name: 'Phone Lookup',
      category: 'OSINT',
      description: 'Looks up a phone number and returns information about it.',
      inputs: [{ name: 'phone', placeholder: 'Enter phone number', type: 'text', value: '' }],
    },
    {
      id: 'ip_lookup',
      name: 'Ip Lookup',
      category: 'OSINT',
      description: 'Looks up an IP/domain address and returns information about it.',
      inputs: [{ name: 'ip', placeholder: 'Enter IP or domain', type: 'text', value: '' }],
    },
    {
      id: 'port_scanner',
      name: 'Port Scanner',
      category: 'NETWORK',
      description: 'Scans for open ports in a given IP/domain address.',
      inputs: [
        { name: 'target', placeholder: 'Enter IP or domain', type: 'text', value: '' },
        { name: 'port_range', placeholder: 'Port range (e.g. 1-1000)', type: 'text', value: '1-1000' },
      ],
    },
    {
      id: 'username_search',
      name: 'Username Search',
      category: 'OSINT',
      description: 'Tries to find a given username from many different websites.',
      inputs: [{ name: 'username', placeholder: 'Enter username', type: 'text', value: '' }],
    },
    {
      id: 'cybercrime_int',
      name: 'Cybercrime Int',
      category: 'OSINT',
      description: 'Searches if given email/domain has been compromised and leaked.',
      inputs: [{ name: 'target', placeholder: 'Enter email or domain', type: 'text', value: '' }],
    },
    {
      id: 'email_search',
      name: 'Email Search',
      category: 'OSINT',
      description: 'Efficiently finds registered accounts from a given email.',
      inputs: [{ name: 'email', placeholder: 'Enter email', type: 'text', value: '' }],
    },
    {
      id: 'webhook_spammer',
      name: 'Webhook Spammer',
      category: 'MISC',
      description: 'Spams messages to a discord webhook.',
      inputs: [
        { name: 'webhook_url', placeholder: 'Enter webhook URL', type: 'text', value: '' },
        { name: 'message', placeholder: 'Enter message', type: 'text', value: '' },
        { name: 'count', placeholder: 'Enter count', type: 'number', value: '10' },
      ],
    },
    {
      id: 'whois_lookup',
      name: 'WhoIs Lookup',
      category: 'OSINT',
      description: 'Looks up a domain and returns information about it.',
      inputs: [{ name: 'domain', placeholder: 'Enter domain', type: 'text', value: '' }],
    },
    {
      id: 'sms_bomber',
      name: 'SMS Bomber',
      category: 'MISC',
      description: 'Spams messages to a given mobile number. (US numbers only)',
      inputs: [
        { name: 'phone', placeholder: 'Enter phone number', type: 'text', value: '' },
        { name: 'count', placeholder: 'Enter count', type: 'number', value: '5' },
      ],
    },
    {
      id: 'fake_info_generator',
      name: 'Fake Info Generator',
      category: 'GENERATOR',
      description: 'Generates fake information.',
      inputs: [{ name: 'locale', placeholder: 'Enter locale (e.g. en_US)', type: 'text', value: 'en_US' }],
    },
    {
      id: 'web_scrape',
      name: 'Web Scrape',
      category: 'OSINT',
      description: 'Scrapes links from a given url.',
      inputs: [{ name: 'url', placeholder: 'Enter URL', type: 'text', value: '' }],
    },
    {
      id: 'wifi_finder',
      name: 'Wi-Fi Finder',
      category: 'NETWORK',
      description: 'Scans for nearby Wi-Fi networks.',
      inputs: [],
    },
    {
      id: 'wifi_vault',
      name: 'Wi-Fi Vault',
      category: 'NETWORK',
      description: 'Scans for locally saved Wi-Fi passwords.',
      inputs: [],
    },
    {
      id: 'dir_buster',
      name: 'Dir Buster',
      category: 'NETWORK',
      description: 'Bruteforce directories on a website.',
      inputs: [
        { name: 'url', placeholder: 'Enter URL', type: 'text', value: '' },
        { name: 'wordlist', placeholder: 'Wordlist path (optional)', type: 'text', value: '' },
      ],
    },
    {
      id: 'local_user_enum',
      name: 'Local User Enum',
      category: 'NETWORK',
      description: 'Enumerates local user accounts on the current machine.',
      inputs: [],
    },
    {
      id: 'caesar_cipher',
      name: 'Caesar Cipher',
      category: 'CRYPTO',
      description: 'Cipher/decipher/bruteforce a message using the Caesar\'s code.',
      inputs: [
        { name: 'message', placeholder: 'Enter message', type: 'text', value: '' },
        { name: 'shift', placeholder: 'Enter shift (0 for bruteforce)', type: 'number', value: '0' },
        { name: 'mode', placeholder: 'Mode (encrypt/decrypt/bruteforce)', type: 'text', value: 'bruteforce' },
      ],
    },
    {
      id: 'basexx',
      name: 'BaseXX',
      category: 'CRYPTO',
      description: 'Encodes/decodes a message using Base64/32/16.',
      inputs: [
        { name: 'message', placeholder: 'Enter message', type: 'text', value: '' },
        { name: 'mode', placeholder: 'Mode (encode/decode)', type: 'text', value: 'encode' },
        { name: 'base', placeholder: 'Base (64/32/16)', type: 'text', value: '64' },
      ],
    },
  ]);

  // État actuel de l'application
  const [selectedTool, setSelectedTool] = useState<(Tool & { category: CategoryKey }) | null>(null);
  const [toolsOutput, setToolsOutput] = useState<{ [key: string]: ApiResponse<unknown> }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filtrer et grouper les outils par catégorie
  const groupedTools = useMemo(() => {
    const filtered = tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return Object.entries(CATEGORIES).reduce((acc, [category]) => {
      acc[category as CategoryKey] = filtered.filter(tool => tool.category === category);
      return acc;
    }, {} as Record<CategoryKey, typeof tools>);
  }, [tools, searchQuery]);

  // Mettre à jour les valeurs d'entrée pour l'outil sélectionné
  const handleInputChange = (toolId: string, inputName: string, value: string): void => {
    const updatedTools = [...tools];
    const toolIndex = updatedTools.findIndex((tool) => tool.id === toolId);
    
    if (toolIndex !== -1) {
      const inputIndex = updatedTools[toolIndex].inputs.findIndex((input) => input.name === inputName);
      
      if (inputIndex !== -1) {
        updatedTools[toolIndex].inputs[inputIndex].value = value;
      }
    }
  };

  // Sélectionner un outil et ses paramètres depuis l'historique
  const handleHistorySelect = (toolId: string, params: Record<string, string>) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
      // Mettre à jour les valeurs des inputs avec les paramètres historiques
      const updatedTool = {
        ...tool,
        inputs: tool.inputs.map(input => ({
          ...input,
          value: params[input.name] || input.value
        }))
      };
      setSelectedTool(updatedTool);
    }
  };

  // Exécuter l'outil sélectionné avec gestion de l'historique
  const executeTool = async (tool: Tool & { category: CategoryKey }): Promise<void> => {
    try {
      setIsLoading(true);

      const params = tool.inputs.reduce<Record<string, string>>((acc, input) => {
        acc[input.name] = input.value;
        return acc;
      }, {});

      let response: ApiResponse<unknown>;
      
      switch (tool.id) {
        case 'ig_scrape':
          response = await apiService.igScrape(params.username);
          break;
        case 'web_search':
          response = await apiService.webSearch(params.query);
          break;
        case 'phone_lookup':
          response = await apiService.phoneLookup(params.phone);
          break;
        case 'ip_lookup':
          response = await apiService.ipLookup(params.ip);
          break;
        case 'port_scanner':
          response = await apiService.portScanner(params.target, params.port_range);
          break;
        case 'username_search':
          response = await apiService.usernameSearch(params.username);
          break;
        case 'cybercrime_int':
          response = await apiService.cybercrimeInt(params.target);
          break;
        case 'email_search':
          response = await apiService.emailSearch(params.email);
          break;
        case 'webhook_spammer':
          response = await apiService.webhookSpammer(params.webhook_url, params.message, parseInt(params.count));
          break;
        case 'whois_lookup':
          response = await apiService.whoisLookup(params.domain);
          break;
        case 'sms_bomber':
          response = await apiService.smsBomber(params.phone, parseInt(params.count));
          break;
        case 'fake_info_generator':
          response = await apiService.fakeInfoGenerator(params.locale);
          break;
        case 'web_scrape':
          response = await apiService.webScrape(params.url);
          break;
        case 'wifi_finder':
          response = await apiService.wifiFinder();
          break;
        case 'wifi_vault':
          response = await apiService.wifiVault();
          break;
        case 'dir_buster':
          response = await apiService.dirBuster(params.url, params.wordlist);
          break;
        case 'local_user_enum':
          response = await apiService.localUserEnum();
          break;
        case 'caesar_cipher':
          response = await apiService.caesarCipher(
            params.message, 
            parseInt(params.shift), 
            params.mode as 'encrypt' | 'decrypt' | 'bruteforce'
          );
          break;
        case 'basexx':
          response = await apiService.basexx(
            params.message, 
            params.mode as 'encode' | 'decode', 
            params.base as '64' | '32' | '16'
          );
          break;
        default:
          // Utiliser la méthode générique si aucun cas spécifique n'est trouvé
          response = await apiService.executeTool(tool.id, params);
      }

      // Ajouter à l'historique
      addToHistory({
        timestamp: new Date().toISOString(),
        tool,
        params,
        response
      });

      // Mettre à jour l'état avec la réponse
      setToolsOutput(prev => ({
        ...prev,
        [tool.id]: response,
      }));
    } catch (error) {
      console.error(`Error executing ${tool.name}:`, error);
      
      const errorResponse: ApiResponse<unknown> = {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString(),
      };

      // Ajouter l'erreur à l'historique
      addToHistory({
        timestamp: new Date().toISOString(),
        tool,
        params: tool.inputs.reduce((acc, input) => ({ ...acc, [input.name]: input.value }), {}),
        response: errorResponse
      });

      // Mettre à jour l'état avec l'erreur
      setToolsOutput(prev => ({
        ...prev,
        [tool.id]: errorResponse,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Formater la sortie JSON pour l'affichage
  const formatOutput = (output: unknown): string => {
    if (!output) return '';
    try {
      return JSON.stringify(output, null, 2);
    } catch {
      return String(output);
    }
  };

  // Rendu de l'interface utilisateur
  return (
    <View style={{ 
      flex: 1, 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: isDark ? '#111827' : '#ffffff'
    }}>
      {isLoading && <LoadingSpinner message={`Running ${selectedTool?.name || 'tool'}...`} />}
      
      {/* Header */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#10b981' : '#059669',
            marginRight: 8
          }}>
            H4X-Tools
          </Text>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Web Interface
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              padding: 8,
              borderRadius: 4,
              marginRight: 16
            }}
          >
            <Text style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
              {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>v1.0.0</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
        {/* Sidebar - Tool List */}
        <View style={{ 
          width: '25%',
          backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
          padding: 16,
          overflow: 'auto'
        }}>
          <Text style={{ 
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: isDark ? '#10b981' : '#059669'
          }}>
            Available Tools
          </Text>
          
          {/* Search Bar */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={{
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                padding: 12,
                borderRadius: 6,
                color: isDark ? '#ffffff' : '#111827',
                width: '100%'
              }}
              placeholder="Search tools..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Tools List by Category */}
          <ScrollView style={{ height: '100%' }}>
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              categoryTools.length > 0 && (
                <View key={category} style={{ marginBottom: 16 }}>
                  <Text style={{ 
                    color: isDark ? '#10b981' : '#059669',
                    fontWeight: 'bold',
                    marginBottom: 8,
                    fontSize: 16
                  }}>
                    {CATEGORIES[category as keyof typeof CATEGORIES]}
                  </Text>
                  {categoryTools.map((tool) => (
                    <TouchableOpacity
                      key={tool.id}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        borderRadius: 6,
                        backgroundColor: selectedTool?.id === tool.id
                          ? (isDark ? '#047857' : '#d1fae5')
                          : (isDark ? '#374151' : '#e5e7eb')
                      }}
                      onPress={() => setSelectedTool(tool)}
                    >
                      <Text style={{ 
                        fontWeight: 'bold',
                        color: isDark ? '#ffffff' : '#111827'
                      }}>
                        {tool.name}
                      </Text>
                      <Text style={{ 
                        fontSize: 14,
                        color: isDark ? '#d1d5db' : '#4b5563',
                        marginTop: 4
                      }}>
                        {tool.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )
            ))}
          </ScrollView>
        </View>

        {/* Main Area - Tool Interface */}
        <View style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {selectedTool ? (
            <View>
              <Text style={{ 
                fontSize: 24,
                fontWeight: 'bold',
                color: isDark ? '#10b981' : '#059669',
                marginBottom: 8
              }}>
                {selectedTool.name}
              </Text>
              <Text style={{ 
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: 24
              }}>
                {selectedTool.description}
              </Text>

              {/* History Panel */}
              <HistoryPanel onSelectFromHistory={handleHistorySelect} />

              {/* Tool Inputs */}
              <View style={{ 
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                padding: 16,
                borderRadius: 6,
                marginBottom: 24
              }}>
                {selectedTool.inputs.length > 0 ? (
                  selectedTool.inputs.map((input) => (
                    <View key={input.name} style={{ marginBottom: 16 }}>
                      <Text style={{ 
                        color: isDark ? '#ffffff' : '#111827',
                        marginBottom: 4
                      }}>
                        {input.name.replace('_', ' ').toUpperCase()}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: isDark ? '#374151' : '#e5e7eb',
                          padding: 12,
                          borderRadius: 6,
                          color: isDark ? '#ffffff' : '#111827',
                          width: '100%'
                        }}
                        placeholder={input.placeholder}
                        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                        value={input.value}
                        onChangeText={(text: string) => handleInputChange(selectedTool.id, input.name, text)}
                        secureTextEntry={input.type === 'password'}
                        keyboardType={input.type === 'number' ? 'numeric' : 'default'}
                      />
                    </View>
                  ))
                ) : (
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    This tool doesn't require any inputs.
                  </Text>
                )}

                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 16,
                    backgroundColor: isLoading
                      ? (isDark ? '#4b5563' : '#e5e7eb')
                      : (isDark ? '#10b981' : '#059669'),
                    alignItems: 'center'
                  }}
                  onPress={() => executeTool(selectedTool)}
                  disabled={isLoading}
                >
                  <Text style={{ 
                    color: isDark ? '#ffffff' : '#ffffff',
                    fontWeight: 'bold'
                  }}>
                    {isLoading ? 'Running...' : 'Execute Tool'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tool Output */}
              {toolsOutput[selectedTool?.id ?? ''] && (
                <View style={{ 
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                  padding: 16,
                  borderRadius: 6
                }}>
                  <Text style={{ 
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: isDark ? '#10b981' : '#059669',
                    marginBottom: 8
                  }}>
                    Output
                  </Text>
                  <View style={{ 
                    backgroundColor: isDark ? '#000000' : '#ffffff',
                    padding: 16,
                    borderRadius: 6
                  }}>
                    <ScrollView style={{ maxHeight: 400 }}>
                      <Text style={{ 
                        color: isDark ? '#34d399' : '#059669',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {formatOutput(
                          toolsOutput[selectedTool?.id ?? ''].data ||
                          toolsOutput[selectedTool?.id ?? ''].message
                        )}
                      </Text>
                    </ScrollView>
                  </View>
                  <View style={{ 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 8
                  }}>
                    <Text style={{ 
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: 14
                    }}>
                      Status:{' '}
                      <Text style={{ 
                        color: toolsOutput[selectedTool?.id ?? ''].status === 'success'
                          ? (isDark ? '#34d399' : '#059669')
                          : (isDark ? '#ef4444' : '#dc2626')
                      }}>
                        {toolsOutput[selectedTool?.id ?? ''].status}
                      </Text>
                    </Text>
                    <Text style={{ 
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: 14
                    }}>
                      Timestamp: {toolsOutput[selectedTool?.id ?? ''].timestamp}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={{ 
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ 
                fontSize: 24,
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: 16
              }}>
                Welcome to H4X-Tools Web Interface
              </Text>
              <Text style={{ 
                color: isDark ? '#6b7280' : '#9ca3af',
                textAlign: 'center',
                maxWidth: 512,
                marginBottom: 32
              }}>
                Select a tool from the sidebar to get started. This interface provides access to all the functionality of the H4X-Tools toolkit.
              </Text>
              <Text style={{ 
                color: isDark ? '#10b981' : '#059669',
                fontWeight: 'bold'
              }}>
                ⚠️ FOR EDUCATIONAL PURPOSES ONLY ⚠️
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16
      }}>
        <Text style={{ 
          color: isDark ? '#9ca3af' : '#6b7280',
          textAlign: 'center'
        }}>
          H4X-Tools Web Interface - Based on the original H4X-Tools by vil - FOR EDUCATIONAL PURPOSES ONLY
        </Text>
      </View>
    </View>
  );
};

export default App;
