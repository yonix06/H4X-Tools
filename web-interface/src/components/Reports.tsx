import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';

interface Report {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'submitted';
  evidenceLinks: string[];
}

const Reports: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [reports, setReports] = useState<Report[]>([]);
  const [newReport, setNewReport] = useState<Partial<Report>>({
    title: '',
    description: '',
    severity: 'medium',
    evidenceLinks: []
  });

  const handleCreateReport = () => {
    if (!newReport.title || !newReport.description) return;

    const report: Report = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      title: newReport.title,
      description: newReport.description,
      severity: newReport.severity || 'medium',
      status: 'draft',
      evidenceLinks: newReport.evidenceLinks || []
    };

    setReports(prev => [report, ...prev]);
    setNewReport({ title: '', description: '', severity: 'medium', evidenceLinks: [] });
  };

  const getSeverityColor = (severity: Report['severity']) => {
    switch (severity) {
      case 'critical':
        return isDark ? '#ef4444' : '#dc2626';
      case 'high':
        return isDark ? '#f97316' : '#ea580c';
      case 'medium':
        return isDark ? '#f59e0b' : '#d97706';
      case 'low':
        return isDark ? '#10b981' : '#059669';
      default:
        return isDark ? '#6b7280' : '#4b5563';
    }
  };

  return (
    <View style={{
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      padding: 16,
      borderRadius: 6,
      marginBottom: 24
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: isDark ? '#10b981' : '#059669',
        marginBottom: 16
      }}>
        Incident Reports
      </Text>

      {/* Create New Report Form */}
      <View style={{
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        padding: 16,
        borderRadius: 6,
        marginBottom: 16
      }}>
        <Text style={{
          color: isDark ? '#ffffff' : '#111827',
          marginBottom: 8,
          fontWeight: 'bold'
        }}>
          Create New Report
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            color: isDark ? '#d1d5db' : '#4b5563',
            marginBottom: 4
          }}>
            Title
          </Text>
          <TextInput
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              padding: 8,
              borderRadius: 4,
              color: isDark ? '#ffffff' : '#111827'
            }}
            value={newReport.title}
            onChangeText={(text) => setNewReport(prev => ({ ...prev, title: text }))}
            placeholder="Report title..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            color: isDark ? '#d1d5db' : '#4b5563',
            marginBottom: 4
          }}>
            Description
          </Text>
          <TextInput
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              padding: 8,
              borderRadius: 4,
              color: isDark ? '#ffffff' : '#111827',
              height: 100,
              textAlignVertical: 'top'
            }}
            multiline
            value={newReport.description}
            onChangeText={(text) => setNewReport(prev => ({ ...prev, description: text }))}
            placeholder="Detailed description of the incident..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            color: isDark ? '#d1d5db' : '#4b5563',
            marginBottom: 4
          }}>
            Severity
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
              <TouchableOpacity
                key={severity}
                style={{
                  backgroundColor: newReport.severity === severity
                    ? getSeverityColor(severity)
                    : isDark ? '#1f2937' : '#ffffff',
                  padding: 8,
                  borderRadius: 4,
                  flex: 1,
                  alignItems: 'center'
                }}
                onPress={() => setNewReport(prev => ({ ...prev, severity }))}
              >
                <Text style={{
                  color: newReport.severity === severity
                    ? '#ffffff'
                    : isDark ? '#d1d5db' : '#4b5563',
                  textTransform: 'capitalize'
                }}>
                  {severity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: isDark ? '#10b981' : '#059669',
            padding: 12,
            borderRadius: 6,
            alignItems: 'center'
          }}
          onPress={handleCreateReport}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
            Create Report
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <ScrollView style={{ maxHeight: 400 }}>
        {reports.map((report) => (
          <View
            key={report.id}
            style={{
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              padding: 16,
              borderRadius: 6,
              marginBottom: 8
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <Text style={{
                color: isDark ? '#ffffff' : '#111827',
                fontWeight: 'bold',
                fontSize: 16
              }}>
                {report.title}
              </Text>
              <View style={{
                backgroundColor: getSeverityColor(report.severity),
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 12
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 12,
                  textTransform: 'uppercase'
                }}>
                  {report.severity}
                </Text>
              </View>
            </View>

            <Text style={{
              color: isDark ? '#d1d5db' : '#4b5563',
              marginBottom: 8
            }}>
              {report.description}
            </Text>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: 12
              }}>
                {new Date(report.timestamp).toLocaleString()}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: report.status === 'draft'
                    ? (isDark ? '#10b981' : '#059669')
                    : (isDark ? '#6b7280' : '#4b5563'),
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 4
                }}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: 12,
                  textTransform: 'uppercase'
                }}>
                  {report.status === 'draft' ? 'Submit to ANSSI' : 'Submitted'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Reports;