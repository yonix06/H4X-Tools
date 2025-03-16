import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native-web';
import { CATEGORIES, TOOLS, CategoryKey, Tool } from '../config/toolCategories';
import { useTheme } from '../contexts/ThemeContext';

interface ToolCardProps {
  tool: Tool;
  onSelect: (tool: Tool) => void;
  isDark: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect, isDark }) => (
  <TouchableOpacity
    onPress={() => onSelect(tool)}
    style={{
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#e5e7eb',
    }}
  >
    <Text style={{ 
      fontSize: 18, 
      fontWeight: 'bold',
      color: isDark ? '#10b981' : '#059669',
      marginBottom: 8 
    }}>
      {tool.name}
    </Text>
    <Text style={{ 
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 8 
    }}>
      {tool.description}
    </Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
      }}>
        <Text style={{
          color: isDark ? '#d1d5db' : '#4b5563',
          fontSize: 12,
        }}>
          {CATEGORIES[tool.category].name}
        </Text>
      </View>
      <View style={{
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        paddingVertical: 4,
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
);

const ToolsList: React.FC = () => {
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

  return (
    <View style={{ flex: 1 }}>
      {/* Search and Filters */}
      <View style={{ 
        padding: 16,
        backgroundColor: isDark ? '#111827' : '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#e5e7eb',
      }}>
        <TextInput
          placeholder="Search tools..."
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
            color: isDark ? '#ffffff' : '#000000',
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
          }}
        />
        
        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            style={{
              backgroundColor: selectedCategory === 'all' ? '#10b981' : isDark ? '#1f2937' : '#f3f4f6',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              marginRight: 8,
            }}
          >
            <Text style={{
              color: selectedCategory === 'all' ? '#ffffff' : isDark ? '#d1d5db' : '#4b5563',
            }}>
              All
            </Text>
          </TouchableOpacity>
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedCategory(key as CategoryKey)}
              style={{
                backgroundColor: selectedCategory === key ? '#10b981' : isDark ? '#1f2937' : '#f3f4f6',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                marginRight: 8,
              }}
            >
              <Text style={{
                color: selectedCategory === key ? '#ffffff' : isDark ? '#d1d5db' : '#4b5563',
              }}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Function Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => setSelectedFunction('all')}
            style={{
              backgroundColor: selectedFunction === 'all' ? '#10b981' : isDark ? '#1f2937' : '#f3f4f6',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              marginRight: 8,
            }}
          >
            <Text style={{
              color: selectedFunction === 'all' ? '#ffffff' : isDark ? '#d1d5db' : '#4b5563',
            }}>
              All Functions
            </Text>
          </TouchableOpacity>
          {['investigation', 'analysis', 'monitoring', 'utility'].map((func) => (
            <TouchableOpacity
              key={func}
              onPress={() => setSelectedFunction(func as Tool['function'])}
              style={{
                backgroundColor: selectedFunction === func ? '#10b981' : isDark ? '#1f2937' : '#f3f4f6',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                marginRight: 8,
              }}
            >
              <Text style={{
                color: selectedFunction === func ? '#ffffff' : isDark ? '#d1d5db' : '#4b5563',
              }}>
                {func.charAt(0).toUpperCase() + func.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tools List */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {filteredTools.length === 0 ? (
          <Text style={{
            color: isDark ? '#d1d5db' : '#4b5563',
            textAlign: 'center',
            marginTop: 32,
          }}>
            No tools found matching your criteria
          </Text>
        ) : (
          filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={(tool) => {
                // TODO: Implement tool selection handler
                console.log('Selected tool:', tool.id);
              }}
              isDark={isDark}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ToolsList;