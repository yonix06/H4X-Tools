import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native-web';
import { CATEGORIES, TOOLS, CategoryKey, Tool } from '../config/toolCategories';
import { useTheme } from '../contexts/ThemeContext';

interface ToolCardProps {
  tool: Tool;
  onSelect: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(tool)}
    className="bg-dark-gray-800 rounded-lg p-4 mb-3 border border-dark-gray-700 hover:border-hacker-green transition-colors duration-200"
  >
    <Text className="text-lg font-bold text-gray-200 mb-2">
      {tool.name}
    </Text>
    <Text className="text-gray-400 mb-4">
      {tool.description}
    </Text>
    <View className="flex-row gap-2">
      <View className="bg-dark-gray-900 px-3 py-1 rounded-full">
        <Text className="text-hacker-green text-xs">
          {CATEGORIES[tool.category].name}
        </Text>
      </View>
      <View className="bg-dark-gray-900 px-3 py-1 rounded-full">
        <Text className="text-gray-300 text-xs">
          {tool.function}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

interface ToolsListProps {
  onSelectTool?: (tool: Tool) => void;
}

const ToolsList: React.FC<ToolsListProps> = ({ onSelectTool = () => console.log('Tool selected but no handler provided') }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
  const [selectedFunction, setSelectedFunction] = useState<Tool['function'] | 'all'>('all');

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesFunction = selectedFunction === 'all' || tool.function === selectedFunction;
      return matchesSearch && matchesCategory && matchesFunction;
    });
  }, [searchQuery, selectedCategory, selectedFunction]);

  const getFilterButtonClass = (isActive: boolean) => `
    mr-2 rounded-full px-3 py-1.5 
    ${isActive 
      ? 'bg-hacker-green text-white' 
      : isDark 
        ? 'bg-dark-gray-800 text-gray-300' 
        : 'bg-gray-100 text-gray-700'
    }
  `.trim();

  return (
    <View className="flex-1">
      {/* Search and Filters */}
      <View className="bg-dark-gray-900 p-4 border-b border-dark-gray-700">
        <TextInput
          placeholder="Search tools..."
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="input-field mb-4"
        />
        
        {/* Category Filters */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3 flex-row"
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            className={getFilterButtonClass(selectedCategory === 'all')}
          >
            <Text className="text-sm inherit">All</Text>
          </TouchableOpacity>

          {Object.entries(CATEGORIES).map(([key, category]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedCategory(key as CategoryKey)}
              className={getFilterButtonClass(selectedCategory === key)}
            >
              <Text className="text-sm inherit">
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Function Filters */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          <TouchableOpacity
            onPress={() => setSelectedFunction('all')}
            className={getFilterButtonClass(selectedFunction === 'all')}
          >
            <Text className="text-sm inherit">
              All Functions
            </Text>
          </TouchableOpacity>

          {['investigation', 'analysis', 'monitoring', 'utility'].map((func) => (
            <TouchableOpacity
              key={func}
              onPress={() => setSelectedFunction(func as Tool['function'])}
              className={getFilterButtonClass(selectedFunction === func)}
            >
              <Text className="text-sm inherit">
                {func.charAt(0).toUpperCase() + func.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tools List */}
      <ScrollView className="flex-1 bg-dark-gray-900 p-4">
        {filteredTools.length === 0 ? (
          <Text className="text-gray-500 text-center mt-4">
            No tools found matching your criteria
          </Text>
        ) : (
          filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={onSelectTool}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ToolsList;