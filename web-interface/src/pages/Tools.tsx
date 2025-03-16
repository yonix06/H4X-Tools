import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { CategoryKey, CATEGORIES, TOOLS, Tool } from '../config/toolCategories';
import { securityApi } from '../services/securityApi';

const Tools: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolInputs, setToolInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredTools = TOOLS.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setToolInputs({});
    setResult(null);
    setError(null);
  };

  const handleInputChange = (name: string, value: string) => {
    setToolInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    // Validate required inputs
    const missingInputs = selectedTool.inputs
      .filter(input => input.required && !toolInputs[input.name]);
    
    if (missingInputs.length > 0) {
      setError(`Missing required fields: ${missingInputs.map(i => i.name).join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await securityApi.executeTool(selectedTool.id, toolInputs);
      if (response.status === 'success') {
        setResult(response.data);
      } else {
        setError(response.message || 'Tool execution failed');
      }
    } catch (err) {
      setError('Failed to execute tool');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16,
      }}>
        <Text style={{ 
          fontSize: 24,
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#059669'
        }}>
          Security Tools
        </Text>
        
        {/* Search */}
        <TextInput
          style={{
            backgroundColor: isDark ? '#374151' : '#ffffff',
            color: isDark ? '#e5e7eb' : '#1f2937',
            padding: 8,
            borderRadius: 6,
            marginTop: 12,
            borderWidth: 1,
            borderColor: isDark ? '#4b5563' : '#d1d5db',
          }}
          placeholder="Search tools..."
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.nativeEvent.text)}
        />

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
        >
          <TouchableOpacity
            onPress={() => setActiveCategory('all')}
            style={{
              backgroundColor: activeCategory === 'all' 
                ? (isDark ? '#10b981' : '#059669')
                : (isDark ? '#374151' : '#e5e7eb'),
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              marginRight: 8,
            }}
          >
            <Text style={{
              color: activeCategory === 'all'
                ? '#ffffff'
                : (isDark ? '#d1d5db' : '#4b5563'),
            }}>
              All
            </Text>
          </TouchableOpacity>
          
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveCategory(key as CategoryKey)}
              style={{
                backgroundColor: activeCategory === key
                  ? (isDark ? '#10b981' : '#059669')
                  : (isDark ? '#374151' : '#e5e7eb'),
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                marginRight: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {category.icon && (
                <Text style={{ marginRight: 4 }}>{category.icon}</Text>
              )}
              <Text style={{
                color: activeCategory === key
                  ? '#ffffff'
                  : (isDark ? '#d1d5db' : '#4b5563'),
              }}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
        <View style={{ padding: 16, maxWidth: 1200, marginHorizontal: 'auto', width: '100%' }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {/* Tool List */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: isDark ? '#d1d5db' : '#4b5563',
                marginBottom: 12,
              }}>
                Available Tools
              </Text>

              {filteredTools.map(tool => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => handleToolSelect(tool)}
                  style={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: selectedTool?.id === tool.id
                      ? (isDark ? '#10b981' : '#059669')
                      : (isDark ? '#374151' : '#e5e7eb'),
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isDark ? '#e5e7eb' : '#1f2937',
                    marginBottom: 4,
                  }}>
                    {CATEGORIES[tool.category].icon} {tool.name}
                  </Text>
                  <Text style={{
                    color: isDark ? '#9ca3af' : '#6b7280',
                    marginBottom: 8,
                  }}>
                    {tool.description}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    gap: 8,
                  }}>
                    <View style={{
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        color: isDark ? '#10b981' : '#059669',
                        fontSize: 12,
                      }}>
                        {CATEGORIES[tool.category].name}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        color: isDark ? '#d1d5db' : '#4b5563',
                        fontSize: 12,
                      }}>
                        {tool.function}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tool Input Form */}
            {selectedTool && (
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: isDark ? '#d1d5db' : '#4b5563',
                  marginBottom: 12,
                }}>
                  {selectedTool.name}
                </Text>

                <View style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                }}>
                  {selectedTool.inputs.map(input => (
                    <View key={input.name} style={{ marginBottom: 12 }}>
                      <Text style={{
                        color: isDark ? '#d1d5db' : '#4b5563',
                        marginBottom: 4,
                      }}>
                        {input.name} {input.required && '*'}
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          color: isDark ? '#e5e7eb' : '#1f2937',
                          padding: 8,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: isDark ? '#4b5563' : '#d1d5db',
                        }}
                        placeholder={input.placeholder}
                        placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                        value={toolInputs[input.name] || ''}
                        onChange={e => handleInputChange(input.name, e.nativeEvent.text)}
                        secureTextEntry={input.type === 'password'}
                      />
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={executeTool}
                    disabled={isLoading}
                    style={{
                      backgroundColor: isDark ? '#10b981' : '#059669',
                      padding: 12,
                      borderRadius: 6,
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    <Text style={{
                      color: '#ffffff',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}>
                      {isLoading ? 'Running...' : 'Run Tool'}
                    </Text>
                  </TouchableOpacity>

                  {error && (
                    <Text style={{
                      color: isDark ? '#ef4444' : '#dc2626',
                      marginTop: 8,
                    }}>
                      {error}
                    </Text>
                  )}
                </View>

                {/* Results */}
                {result && (
                  <View style={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 8,
                    padding: 16,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: isDark ? '#d1d5db' : '#4b5563',
                      marginBottom: 8,
                    }}>
                      Results
                    </Text>
                    <Text style={{
                      color: isDark ? '#e5e7eb' : '#1f2937',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Tools;