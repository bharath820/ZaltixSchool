import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

interface StudentData {
  name: string;
  rollNo: string;
  class: string;
  math: number;
  english: number;
  science: number;
  socialStudies: number;
  computer: number;
  hindi: number;
  totalMarks: number;
  average: number;
  grade: string;
}

export default function ReportsScreen() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetStudentName = 'anjali';

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the student by name directly using backend API
        const res = await axios.get(`http://192.168.29.77:5000/grades/student/${targetStudentName}`);

        setStudent(res.data);
      } catch (error: any) {
        console.error('Error fetching student data:', error);

        if (error.response?.status === 404) {
          setError(`No student named ${targetStudentName} found`);
        } else {
          setError('Failed to fetch data from server');
        }
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const getGrade = (marks: number) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    return 'D';
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2575fc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.loader}>
        <Text>No student data found.</Text>
      </View>
    );
  }

  const reportCardData = [
    { subject: 'Mathematics', marks: student.math },
    { subject: 'Science', marks: student.science },
    { subject: 'English', marks: student.english },
    { subject: 'Social Studies', marks: student.socialStudies },
    { subject: 'Computer', marks: student.computer },
    { subject: 'Hindi', marks: student.hindi },
  ];

  const maxMarks = reportCardData.length * 100;

  return (
    <LinearGradient colors={['#e0eafc', '#f5f7fa']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <Image source={require('../assets/images/profile.png')} style={styles.profileImage} />
          <View>
            <Text style={styles.profileName}>{student.name}</Text>
            <Text style={styles.profileInfo}>Class: {student.class}</Text>
            <Text style={styles.profileInfo}>Roll No: {student.rollNo}</Text>
          </View>
        </View>

        <Text style={styles.heading}>Academic Report</Text>

        {/* Table Header */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerText]}>Subject</Text>
          <Text style={[styles.cell, styles.headerText]}>Marks</Text>
          <Text style={[styles.cell, styles.headerText]}>Grade</Text>
        </View>

        {/* Table Rows */}
        {reportCardData.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{item.subject}</Text>
            <Text style={styles.cell}>{item.marks}</Text>
            <Text style={styles.cell}>{getGrade(item.marks)}</Text>
          </View>
        ))}

        {/* Overall Section */}
        <View style={[styles.row, styles.overallRow]}>
          <Text style={styles.cellBold}>Total</Text>
          <Text style={styles.cellBold}>
            {student.totalMarks} / {maxMarks}
          </Text>
          <Text style={styles.cellBold}>Avg: {student.average}</Text>
        </View>

        <View style={[styles.row, styles.gradeRow]}>
          <Text style={[styles.cell, styles.overallGradeText]}>Overall Grade:</Text>
          <Text style={[styles.cell, styles.overallGradeValue]}>{student.grade}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#ccc',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2575fc',
  },
  profileInfo: {
    fontSize: 14,
    color: '#555',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  headerRow: {
    backgroundColor: '#2575fc',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
  },
  cellBold: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  overallRow: {
    backgroundColor: '#f2f2f2',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  gradeRow: {
    backgroundColor: '#d1e7ff',
    borderColor: '#a5c9ff',
    borderWidth: 1,
  },
  overallGradeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2575fc',
  },
  overallGradeValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2575fc',
    textAlign: 'center',
  },
});
