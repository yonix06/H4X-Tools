import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { useHistory } from '../contexts/HistoryContext';
import { HistoryPanel } from '../components/HistoryPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import apiService, { ApiResponse } from '../services/api';
import { Tool } from '../services/types';

// Définition des catégories
const CATEGORIES = {
  OSINT: 'OSINT & Reconnaissance',
  NETWORK: 'Network Tools',
  CRYPTO: 'Cryptography',
  GENERATOR: 'Generators',
  MISC: 'Miscellaneous'
} as const;

type CategoryKey = keyof typeof CATEGORIES;

const Tools: React.FC = () => {
  const { theme } = useTheme();
  const { addToHistory } = useHistory();
  const isDark = theme === 'dark';

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  
  // Liste des outils disponibles avec leurs catégories
  const [tools, setTools] = useState<(Tool & { category: CategoryKey })[]>([
    // ...existing tools array...
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

  const handleInputChange = (toolId: string, inputName: string, value: string) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === toolId
          ? {
              ...tool,
              inputs: tool.inputs.map(input =>
                input.name === inputName ? { ...input, value } : input
              )
            }
          : tool
      )
    );
  };

  const handleHistorySelect = (toolId: string, params: Record<string, string>) => {
    const selectedTool = tools.find(t => t.id === toolId);
    if (selectedTool) {
      setSelectedTool(selectedTool);
      setTools(prevTools => 
        prevTools.map(tool => 
          tool.id === toolId
            ? {
                ...tool,
                inputs: tool.inputs.map(input => ({
                  ...input,
                  value: params[input.name] || ''
                }))
              }
            : tool
        )
      );
    }
  };

  const executeTool = async (tool: Tool & { category: CategoryKey }) => {
    if (!tool || isLoading) return;

    setIsLoading(true);
    
    try {
      const inputs = tool.inputs.reduce((acc, input) => ({
        ...acc,
        [input.name]: input.value
      }), {});

      const response = await apiService.executeTool(tool.id, inputs);
      
      setToolsOutput(prev => ({
        ...prev,
        [tool.id]: response
      }));

      if (response.status === 'success') {
        addToHistory({
          tool,
          params: inputs,
          timestamp: new Date().toISOString(),
          response
        });
      }
    } catch (err) {
      setToolsOutput(prev => ({
        ...prev,
        [tool.id]: {
          status: 'error',
          message: err instanceof Error ? err.message : 'An error occurred',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatOutput = (output: any): string => {
    if (typeof output === 'string') return output;
    try {
      return JSON.stringify(output, null, 2);
    } catch {
      return String(output);
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
      {isLoading && <LoadingSpinner message={`Running ${selectedTool?.name || 'tool'}...`} />}

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
  );
};

export default Tools;