import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const API_URL = 'http://192.168.29.77:5000/attendance/by-name'; // Change your backend IP if needed

export default function AttendanceScreen() {
  const [studentName, setStudentName] = useState('Anjali'); // default name to fetch - you can make it user input
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState('');

  // Fetch attendance by student name whenever studentName changes
  useEffect(() => {
    if (!studentName.trim()) return;
    setLoading(true);
    setError(null);

    axios.get(API_URL, { params: { name: studentName.trim() } })
      .then(res => {
        const record = res.data;
        if (!record || !record.student) {
          setError('No attendance records found for this student.');
          setAttendanceData({});
          setLoading(false);
          return;
        }

        // Convert attendance array to { date: { status:'present'|'absent', subjects: [...] } }
        const perDayStatus = {};
        (record.attendance || []).forEach(day => {
          const present = (day.subjects || []).some(s => s.present);
          perDayStatus[day.date] = {
            status: present ? 'present' : 'absent',
            subjects: day.subjects,
          };
        });
        setAttendanceData(perDayStatus);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch attendance data. Check backend and network.');
        setLoading(false);
      });
  }, [studentName]);

  // Build marked dates for calendar
  const markedDates = Object.keys(attendanceData).reduce((acc, date) => {
    const day = attendanceData[date];
    acc[date] = {
      selected: true,
      selectedColor: day.status === 'present' ? '#4CAF50' : '#F44336',
      customStyles: {
        container: { borderRadius: 8 },
        text: { color: '#fff', fontWeight: 'bold' },
      }
    };
    return acc;
  }, {});

  const totalDays = Object.keys(attendanceData).length;
  const presentDays = Object.values(attendanceData).filter(d => d.status === 'present').length;
  const absentDays = totalDays - presentDays;
  const totalPercentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : '0.00';
  const monthlyPercentage = totalPercentage; // You can enhance to actually calculate current month only if needed
  const dailyPercentage = selected
    ? (attendanceData[selected]?.status === 'present' ? '100.00' : '0.00')
    : presentDays ? '100.00' : '0.00';

  const selectedDaySubjects = selected && attendanceData[selected]?.subjects;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <LinearGradient colors={['#2575fc', '#6a11cb']} style={styles.header}>
        <Text style={styles.headerText}>📅 Attendance for {studentName}</Text>
      </LinearGradient>

      <View style={{ padding: 12 }}>
        <TextInput
          value={studentName}
          onChangeText={text => setStudentName(text)}
          placeholder="Enter student name"
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2575fc" style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Calendar
            style={styles.calendar}
            markedDates={markedDates}
            onDayPress={day => setSelected(day.dateString)}
            markingType="custom"
            theme={{
              todayTextColor: '#2575fc',
              arrowColor: '#2575fc',
              textSectionTitleColor: '#444',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
          />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <Text style={styles.detailText}>✅ Total Present: <Text style={{ color: '#4CAF50' }}>{presentDays}</Text></Text>
            <Text style={styles.detailText}>❌ Total Absent: <Text style={{ color: '#F44336' }}>{absentDays}</Text></Text>
            <Text style={styles.detailText}>📊 Total Percentage: <Text style={{ color: '#2575fc' }}>{totalPercentage}%</Text></Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Performance</Text>
            <Text style={styles.detailText}>📆 Monthly Percentage: <Text style={{ color: '#2575fc' }}>{monthlyPercentage}%</Text></Text>
            <Text style={styles.detailText}>🗓️ Daily Percentage: <Text style={{ color: '#2575fc' }}>{dailyPercentage}%</Text></Text>
          </View>

          {selected ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Details for {selected}</Text>
              {selectedDaySubjects && selectedDaySubjects.length > 0 ? (
                selectedDaySubjects.map(subj => (
                  <Text key={subj.subject} style={styles.detailText}>
                    {subj.subject}: <Text style={{ color: subj.present ? '#4CAF50' : '#F44336' }}>{subj.present ? 'Present' : 'Absent'}</Text>
                  </Text>
                ))
              ) : (
                <Text style={styles.detailText}>No attendance records on this day.</Text>
              )}
            </View>
          ) : null}
        </>
      )}

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef1f5' },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  calendar: {
    marginTop: 16,
    marginHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2575fc',
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 16,
    elevation: 3,
  },
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});
