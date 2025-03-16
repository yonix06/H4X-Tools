import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { CategoryKey, CATEGORIES, TOOLS, Tool } from '../config/toolCategories';
import { securityApi } from '../services/securityApi';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
    <View className="flex-1 bg-dark-gray-900">
      {/* Search and Filters */}
      <View className="border-b border-dark-gray-700 bg-dark-gray-800 p-4">
        <View className="max-w-7xl mx-auto">
          <TextInput
            className="input-field mb-4"
            placeholder="Search tools..."
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-2"
          >
            <TouchableOpacity
              onPress={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full ${
                activeCategory === 'all' 
                  ? 'bg-hacker-green'
                  : 'bg-dark-gray-700'
              }`}
            >
              <Text className={activeCategory === 'all' ? 'text-white' : 'text-gray-300'}>
                All Tools
              </Text>
            </TouchableOpacity>

            {Object.entries(CATEGORIES).map(([key, category]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveCategory(key as CategoryKey)}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === key
                    ? 'bg-hacker-green'
                    : 'bg-dark-gray-700'
                }`}
              >
                <Text className={`${
                  activeCategory === key ? 'text-white' : 'text-gray-300'
                }`}>
                  {category.icon} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Main Content */}
      <View className="max-w-7xl mx-auto p-4 flex-1">
        <View className="flex-row gap-6">
          {/* Tool List */}
          <ScrollView className="flex-1">
            <View className="space-y-4">
              {filteredTools.map(tool => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => handleToolSelect(tool)}
                  className={`p-4 rounded-lg border ${
                    selectedTool?.id === tool.id
                      ? 'border-hacker-green bg-dark-gray-800'
                      : 'border-dark-gray-700 bg-dark-gray-800 hover:border-hacker-green'
                  } transition-colors duration-200`}
                >
                  <Text className="text-lg font-bold text-gray-200 mb-2">
                    {CATEGORIES[tool.category].icon} {tool.name}
                  </Text>
                  <Text className="text-gray-400 mb-3">
                    {tool.description}
                  </Text>
                  <View className="flex-row space-x-2">
                    <View className="px-2 py-1 rounded-full bg-dark-gray-700">
                      <Text className="text-sm text-hacker-green">
                        {CATEGORIES[tool.category].name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {filteredTools.length === 0 && (
                <Text className="text-gray-400 text-center py-8">
                  No tools found matching your search
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Tool Details and Execution */}
          {selectedTool && (
            <View className="w-96 flex-shrink-0">
              <View className="bg-dark-gray-800 rounded-lg p-6 border border-dark-gray-700">
                <Text className="text-xl font-bold text-gray-200 mb-4">
                  {selectedTool.name}
                </Text>

                {selectedTool.inputs.map(input => (
                  <View key={input.name} className="mb-4">
                    <Text className="text-gray-300 mb-2">
                      {input.name} {input.required && '*'}
                    </Text>
                    <TextInput
                      className="input-field"
                      placeholder={input.placeholder}
                      placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                      value={toolInputs[input.name] || ''}
                      onChangeText={(text: string) => handleInputChange(input.name, text)}
                      secureTextEntry={input.type === 'password'}
                      multiline={input.type === 'textarea'}
                      numberOfLines={input.type === 'textarea' ? 4 : 1}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  onPress={executeTool}
                  disabled={isLoading}
                  className={`btn-primary w-full ${isLoading ? 'opacity-50' : ''}`}
                >
                  <Text className="text-center text-white font-bold">
                    {isLoading ? 'Running...' : 'Execute Tool'}
                  </Text>
                </TouchableOpacity>

                {error && (
                  <Text className="mt-4 text-red-500 text-center">
                    {error}
                  </Text>
                )}

                {result && (
                  <View className="mt-6">
                    <Text className="text-lg font-bold text-gray-200 mb-2">
                      Results
                    </Text>
                    <ScrollView className="bg-dark-gray-700 rounded-lg p-4 max-h-96">
                      <Text className="text-gray-300 font-mono whitespace-pre-wrap">
                        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {isLoading && <LoadingSpinner />}
    </View>
  );
};

export default Tools;