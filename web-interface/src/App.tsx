import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native-web';
import './App.css';

// Import du service API et des types
import apiService, { ApiResponse } from './services/api';
import { Tool } from './services/types';

const App: React.FC = () => {
  // Liste des outils disponibles
  const [tools] = useState<Tool[]>([
    {
      id: 'ig_scrape',
      name: 'Ig Scrape',
      description: 'Scrapes information from IG accounts',
      inputs: [{ name: 'username', placeholder: 'Enter Instagram username', type: 'text', value: '' }],
    },
    {
      id: 'web_search',
      name: 'Web Search',
      description: 'Searches the internet for the given query.',
      inputs: [{ name: 'query', placeholder: 'Enter search query', type: 'text', value: '' }],
    },
    {
      id: 'phone_lookup',
      name: 'Phone Lookup',
      description: 'Looks up a phone number and returns information about it.',
      inputs: [{ name: 'phone', placeholder: 'Enter phone number', type: 'text', value: '' }],
    },
    {
      id: 'ip_lookup',
      name: 'Ip Lookup',
      description: 'Looks up an IP/domain address and returns information about it.',
      inputs: [{ name: 'ip', placeholder: 'Enter IP or domain', type: 'text', value: '' }],
    },
    {
      id: 'port_scanner',
      name: 'Port Scanner',
      description: 'Scans for open ports in a given IP/domain address.',
      inputs: [
        { name: 'target', placeholder: 'Enter IP or domain', type: 'text', value: '' },
        { name: 'port_range', placeholder: 'Port range (e.g. 1-1000)', type: 'text', value: '1-1000' },
      ],
    },
    {
      id: 'username_search',
      name: 'Username Search',
      description: 'Tries to find a given username from many different websites.',
      inputs: [{ name: 'username', placeholder: 'Enter username', type: 'text', value: '' }],
    },
    {
      id: 'cybercrime_int',
      name: 'Cybercrime Int',
      description: 'Searches if given email/domain has been compromised and leaked.',
      inputs: [{ name: 'target', placeholder: 'Enter email or domain', type: 'text', value: '' }],
    },
    {
      id: 'email_search',
      name: 'Email Search',
      description: 'Efficiently finds registered accounts from a given email.',
      inputs: [{ name: 'email', placeholder: 'Enter email', type: 'text', value: '' }],
    },
    {
      id: 'webhook_spammer',
      name: 'Webhook Spammer',
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
      description: 'Looks up a domain and returns information about it.',
      inputs: [{ name: 'domain', placeholder: 'Enter domain', type: 'text', value: '' }],
    },
    {
      id: 'sms_bomber',
      name: 'SMS Bomber',
      description: 'Spams messages to a given mobile number. (US numbers only)',
      inputs: [
        { name: 'phone', placeholder: 'Enter phone number', type: 'text', value: '' },
        { name: 'count', placeholder: 'Enter count', type: 'number', value: '5' },
      ],
    },
    {
      id: 'fake_info_generator',
      name: 'Fake Info Generator',
      description: 'Generates fake information.',
      inputs: [{ name: 'locale', placeholder: 'Enter locale (e.g. en_US)', type: 'text', value: 'en_US' }],
    },
    {
      id: 'web_scrape',
      name: 'Web Scrape',
      description: 'Scrapes links from a given url.',
      inputs: [{ name: 'url', placeholder: 'Enter URL', type: 'text', value: '' }],
    },
    {
      id: 'wifi_finder',
      name: 'Wi-Fi Finder',
      description: 'Scans for nearby Wi-Fi networks.',
      inputs: [],
    },
    {
      id: 'wifi_vault',
      name: 'Wi-Fi Vault',
      description: 'Scans for locally saved Wi-Fi passwords.',
      inputs: [],
    },
    {
      id: 'dir_buster',
      name: 'Dir Buster',
      description: 'Bruteforce directories on a website.',
      inputs: [
        { name: 'url', placeholder: 'Enter URL', type: 'text', value: '' },
        { name: 'wordlist', placeholder: 'Wordlist path (optional)', type: 'text', value: '' },
      ],
    },
    {
      id: 'local_user_enum',
      name: 'Local User Enum',
      description: 'Enumerates local user accounts on the current machine.',
      inputs: [],
    },
    {
      id: 'caesar_cipher',
      name: 'Caesar Cipher',
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
      description: 'Encodes/decodes a message using Base64/32/16.',
      inputs: [
        { name: 'message', placeholder: 'Enter message', type: 'text', value: '' },
        { name: 'mode', placeholder: 'Mode (encode/decode)', type: 'text', value: 'encode' },
        { name: 'base', placeholder: 'Base (64/32/16)', type: 'text', value: '64' },
      ],
    },
  ]);

  // État actuel de l'application
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolsOutput, setToolsOutput] = useState<{ [key: string]: ApiResponse<unknown> }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Exécuter l'outil sélectionné
  const executeTool = async (tool: Tool): Promise<void> => {
    try {
      setIsLoading(true);

      // Préparer les paramètres à envoyer
      const params = tool.inputs.reduce<Record<string, string>>((acc, input) => {
        acc[input.name] = input.value;
        return acc;
      }, {});

      // Appeler le service API pour exécuter l'outil
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

      // Mettre à jour l'état avec la réponse
      setToolsOutput(prev => ({
        ...prev,
        [tool.id]: response,
      }));
    } catch (error) {
      console.error(`Error executing ${tool.name}:`, error);
      
      // Mettre à jour l'état avec l'erreur
      setToolsOutput(prev => ({
        ...prev,
        [tool.id]: {
          status: 'error',
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          timestamp: new Date().toISOString(),
        },
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
    <View style={{ flex: 1, flexDirection: 'column', height: '100vh', backgroundColor: '#111827' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#1f2937', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981', marginRight: 8 }}>H4X-Tools</Text>
          <Text style={{ color: '#9ca3af' }}>Web Interface</Text>
        </View>
        <Text style={{ color: '#9ca3af' }}>v1.0.0</Text>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
        {/* Sidebar - Tool List */}
        <View style={{ width: '25%', backgroundColor: '#1f2937', padding: 16, overflow: 'auto' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#10b981' }}>Available Tools</Text>
          <ScrollView style={{ height: '100%' }}>
            {tools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 6,
                  backgroundColor: selectedTool?.id === tool.id ? '#047857' : '#374151',
                }}
                onPress={() => setSelectedTool(tool)}
              >
                <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>{tool.name}</Text>
                <Text style={{ fontSize: 14, color: '#d1d5db', marginTop: 4 }}>{tool.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Area - Tool Interface */}
        <View style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {selectedTool ? (
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981', marginBottom: 8 }}>{selectedTool.name}</Text>
              <Text style={{ color: '#9ca3af', marginBottom: 24 }}>{selectedTool.description}</Text>

              {/* Tool Inputs */}
              <View style={{ backgroundColor: '#1f2937', padding: 16, borderRadius: 6, marginBottom: 24 }}>
                {selectedTool.inputs.length > 0 ? (
                  selectedTool.inputs.map((input) => (
                    <View key={input.name} style={{ marginBottom: 16 }}>
                      <Text style={{ color: '#ffffff', marginBottom: 4 }}>{input.name.replace('_', ' ').toUpperCase()}</Text>
                      <TextInput
                        style={{
                          backgroundColor: '#374151',
                          padding: 12,
                          borderRadius: 6,
                          color: '#ffffff',
                          width: '100%',
                        }}
                        placeholder={input.placeholder}
                        placeholderTextColor="#666666"
                        value={input.value}
                        onChangeText={(text: string) => handleInputChange(selectedTool.id, input.name, text)}
                        secureTextEntry={input.type === 'password'}
                        keyboardType={input.type === 'number' ? 'numeric' : 'default'}
                      />
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#9ca3af' }}>This tool doesn't require any inputs.</Text>
                )}

                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 16,
                    backgroundColor: isLoading ? '#4b5563' : '#10b981',
                    alignItems: 'center',
                  }}
                  onPress={() => executeTool(selectedTool)}
                  disabled={isLoading}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {isLoading ? 'Running...' : 'Execute Tool'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tool Output */}
              {toolsOutput[selectedTool?.id ?? ''] && (
                <View style={{ backgroundColor: '#1f2937', padding: 16, borderRadius: 6 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981', marginBottom: 8 }}>Output</Text>
                  <View style={{ backgroundColor: '#000000', padding: 16, borderRadius: 6 }}>
                    <ScrollView style={{ maxHeight: 400 }}>
                      <Text style={{ color: '#34d399', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {formatOutput(toolsOutput[selectedTool?.id ?? ''].data || toolsOutput[selectedTool?.id ?? ''].message)}
                      </Text>
                    </ScrollView>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                      Status:{' '}
                      <Text style={{ color: toolsOutput[selectedTool?.id ?? ''].status === 'success' ? '#34d399' : '#ef4444' }}>
                        {toolsOutput[selectedTool?.id ?? ''].status}
                      </Text>
                    </Text>
                    <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                      Timestamp: {toolsOutput[selectedTool?.id ?? ''].timestamp}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, color: '#9ca3af', marginBottom: 16 }}>Welcome to H4X-Tools Web Interface</Text>
              <Text style={{ color: '#6b7280', textAlign: 'center', maxWidth: 512, marginBottom: 32 }}>
                Select a tool from the sidebar to get started. This interface provides access to all the functionality of the H4X-Tools toolkit.
              </Text>
              <Text style={{ color: '#10b981', fontWeight: 'bold' }}>⚠️ FOR EDUCATIONAL PURPOSES ONLY ⚠️</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={{ backgroundColor: '#1f2937', padding: 16 }}>
        <Text style={{ color: '#9ca3af', textAlign: 'center' }}>
          H4X-Tools Web Interface - Based on the original H4X-Tools by vil - FOR EDUCATIONAL PURPOSES ONLY
        </Text>
      </View>
    </View>
  );
};

export default App;
