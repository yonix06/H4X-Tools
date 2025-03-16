import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { CategoryKey, CATEGORIES, TOOLS, Tool } from '../config/toolCategories';
import { securityApi } from '../services/securityApi';

// Add proper types for TextInput events
interface NativeTextEvent {
  nativeEvent: { text: string };
}

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
    <View className="flex-1">
      {/* Header */}
      <View className="bg-dark-gray-800 p-4">
        <Text className="text-2xl font-bold text-hacker-green">
          Security Tools
        </Text>
      </View>

      {/* Search and Filters */}
      <View className="bg-dark-gray-900 p-4">
        <TextInput
          className="input-field w-full mb-4"
          placeholder="Search tools..."
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Category Filter */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row space-x-2 mb-4"
        >
          <TouchableOpacity
            onPress={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full ${
              activeCategory === 'all' 
                ? 'bg-hacker-green'
                : 'bg-dark-gray-800'
            }`}
          >
            <Text className={
              activeCategory === 'all'
                ? 'text-white font-bold'
                : 'text-gray-300'
            }>
              All
            </Text>
          </TouchableOpacity>
          
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveCategory(key as CategoryKey)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === key
                  ? 'bg-hacker-green'
                  : 'bg-dark-gray-800'
              }`}
            >
              <Text className={
                activeCategory === key
                  ? 'text-white font-bold'
                  : 'text-gray-300'
              }>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 bg-dark-gray-900">
        <View className="p-4 max-w-7xl mx-auto">
          <View className="flex-row gap-4">
            {/* Tool List */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-200 mb-4">
                Available Tools
              </Text>

              {filteredTools.map(tool => (
                <TouchableOpacity
                  key={tool.id}
                  onPress={() => handleToolSelect(tool)}
                  className={`bg-dark-gray-800 rounded-lg p-4 mb-4 border ${
                    selectedTool?.id === tool.id
                      ? 'border-hacker-green'
                      : 'border-dark-gray-700'
                  }`}
                >
                  <Text className="text-lg font-bold text-gray-200 mb-2">
                    {CATEGORIES[tool.category].icon} {tool.name}
                  </Text>
                  <Text className="text-gray-400 mb-4">
                    {tool.description}
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="bg-dark-gray-900 px-3 py-1 rounded-full">
                      <Text className="text-hacker-green text-sm">
                        {CATEGORIES[tool.category].name}
                      </Text>
                    </View>
                    <View className="bg-dark-gray-900 px-3 py-1 rounded-full">
                      <Text className="text-gray-300 text-sm">
                        {tool.function}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tool Input Form */}
            {selectedTool && (
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-200 mb-4">
                  {selectedTool.name}
                </Text>

                <View className="bg-dark-gray-800 rounded-lg p-4 mb-4">
                  {selectedTool.inputs.map(input => (
                    <View key={input.name} className="mb-4">
                      <Text className="text-gray-300 mb-2">
                        {input.name} {input.required && '*'}
                      </Text>
                      <TextInput
                        className="input-field w-full"
                        placeholder={input.placeholder}
                        placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                        value={toolInputs[input.name] || ''}
                        onChangeText={(text: string) => handleInputChange(input.name, text)}
                        secureTextEntry={input.type === 'password'}
                      />
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={executeTool}
                    disabled={isLoading}
                    className={`btn-primary w-full mt-4 ${
                      isLoading ? 'opacity-70' : ''
                    }`}
                  >
                    <Text className="text-center text-white font-bold">
                      {isLoading ? 'Running...' : 'Run Tool'}
                    </Text>
                  </TouchableOpacity>

                  {error && (
                    <Text className="text-red-500 mt-4">
                      {error}
                    </Text>
                  )}
                </View>

                {/* Results */}
                {result && (
                  <View className="bg-dark-gray-800 rounded-lg p-4">
                    <Text className="text-lg font-bold text-gray-200 mb-4">
                      Results
                    </Text>
                    <Text className="text-gray-200 font-mono whitespace-pre-wrap">
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