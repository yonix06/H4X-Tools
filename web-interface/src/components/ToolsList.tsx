import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native-web';
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
    style={[styles.toolCard, isDark ? styles.darkToolCard : styles.lightToolCard]}
  >
    <Text style={[styles.toolTitle, isDark ? styles.darkText : styles.lightText]}>
      {tool.name}
    </Text>
    <Text style={[styles.toolDescription, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
      {tool.description}
    </Text>
    <View style={styles.tagContainer}>
      <View style={[styles.tag, isDark ? styles.darkTag : styles.lightTag]}>
        <Text style={[styles.tagText, isDark ? styles.darkTagText : styles.lightTagText]}>
          {CATEGORIES[tool.category].name}
        </Text>
      </View>
      <View style={[styles.tag, isDark ? styles.darkTag : styles.lightTag]}>
        <Text style={[styles.tagText, isDark ? styles.darkTagText : styles.lightTagText]}>
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
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={[styles.searchContainer, isDark ? styles.darkBg : styles.lightBg]}>
        <TextInput
          placeholder="Search tools..."
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, isDark ? styles.darkInput : styles.lightInput]}
        />
        
        {/* Category Filters */}
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
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
          horizontal={true}
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
        style={[styles.toolList, isDark ? styles.darkBg : styles.lightBg]}
        contentContainerStyle={styles.toolListContent}
      >
        {filteredTools.length === 0 ? (
          <Text style={[styles.emptyText, isDark ? styles.darkText : styles.lightText]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  darkBg: {
    backgroundColor: '#111827',
    borderBottomColor: '#374151',
  },
  lightBg: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
  },
  darkInput: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderColor: '#374151',
  },
  lightInput: {
    backgroundColor: '#f3f4f6',
    color: '#000000',
    borderColor: '#e5e7eb',
  },
  filterScroll: {
    marginBottom: 12,
  },
  toolList: {
    flex: 1,
  },
  toolListContent: {
    padding: 16,
  },
  toolCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  darkToolCard: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  lightToolCard: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  toolDescription: {
    marginBottom: 8,
  },
  darkText: {
    color: '#e5e7eb',
  },
  lightText: {
    color: '#1f2937',
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
  lightSecondaryText: {
    color: '#6b7280',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  darkTag: {
    backgroundColor: '#374151',
  },
  lightTag: {
    backgroundColor: '#e5e7eb',
  },
  tagText: {
    fontSize: 12,
  },
  darkTagText: {
    color: '#d1d5db',
  },
  lightTagText: {
    color: '#4b5563',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  },
});

export default ToolsList;