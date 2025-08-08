import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Download, Users, Calendar as CalendarIcon, TrendingUp, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Api_url} from '../config/config.js'

const AttendanceAnalytics = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [studentSearch, setStudentSearch] = useState('');
  const [exportType, setExportType] = useState('');
  const [viewType, setViewType] = useState('weekly');
  const [students, setStudents] = useState([]);
  const [classList, setClassList] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [classAttendance, setClassAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    avgAttendance: 0
  });

  // Fetch classes
  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const res = await axios.get(`${Api_url}/attendance/classes`);
        setClassList(res.data);
      } catch (err) {
        toast.error('Failed to fetch class list');
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  // Fetch main data
  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);

        const date = format(selectedDate, 'yyyy-MM-dd');
        const cls = selectedClass === 'all' ? undefined : selectedClass;

        const [studentRes, statsRes, classAttRes, chartRes] = await Promise.all([
          axios.get(`${Api_url}/attendance/students-with-attendance`, {
            params: { date, class: cls }
          }),
          axios.get(`${Api_url}/attendance/attendance-stats`, {
            params: { date, class: cls }
          }),
          axios.get(`${Api_url}/attendance/class-attendance-summary`, {
            params: { date }
          }),
          axios.get(`${Api_url}/attendance/attendance-trends`, {
            params: { viewType, class: cls }
          }),
        ]);

        setStudents(studentRes.data);
        setTotalStats(statsRes.data);
        setClassAttendance(classAttRes.data);
        setAttendanceData(chartRes.data);

      } catch (err) {
        toast.error('Failed to fetch data from server');
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [selectedClass, selectedDate, viewType]);

  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const exportReport = async () => {
    if (!exportType) return;
    setLoading(true);
    try {
      const res = await axios.get(`${Api_url}/attendance/export-attendance`, {
        params: {
          type: exportType,
          date: format(selectedDate, 'yyyy-MM-dd'),
          class: selectedClass === 'all' ? undefined : selectedClass,
        },
      });
      const exportData = res.data;
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
      XLSX.writeFile(wb, `attendance_${exportType}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Export successful!');
    } catch {
      toast.error('Failed to export attendance data');
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/dashboard/principal')} variant="outline" size="sm" disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Attendance Analytics</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={exportType} onValueChange={setExportType} disabled={loading}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Export Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={exportReport}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!exportType || loading}
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Exporting...' : 'Export Excel'}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classList.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={date => date && setSelectedDate(date)}
                  initialFocus
                  disabled={loading}
                />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>

            <Select value={viewType} onValueChange={setViewType} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="View Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Cards are unchanged - use same as before */}
            {/* Total Students */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Enrolled students</p>
              </CardContent>
            </Card>

            {/* Present */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.presentToday}</div>
                <p className="text-xs text-muted-foreground">
                  {totalStats.totalStudents > 0
                    ? `${((totalStats.presentToday / totalStats.totalStudents) * 100).toFixed(1)}% attendance`
                    : 'No data'}
                </p>
              </CardContent>
            </Card>

            {/* Absent */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.absentToday}</div>
                <p className="text-xs text-muted-foreground">
                  {totalStats.totalStudents > 0
                    ? `${((totalStats.absentToday / totalStats.totalStudents) * 100).toFixed(1)}% absent`
                    : 'No data'}
                </p>
              </CardContent>
            </Card>

            {/* Average */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.avgAttendance}%</div>
                <p className="text-xs text-muted-foreground">This {viewType.slice(0, -2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{viewType.charAt(0).toUpperCase() + viewType.slice(1)} Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceData.length > 0 ? (
                <div className="w-full max-w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="present" fill="#3b82f6" name="Present" />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No attendance data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class-wise Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Class-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {classAttendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Class</th>
                        <th className="text-left py-2">Total Students</th>
                        <th className="text-left py-2">Present</th>
                        <th className="text-left py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classAttendance.map((item) => (
                        <tr key={item.class} className="border-b">
                          <td className="py-2">{item.class}</td>
                          <td className="py-2">{item.total}</td>
                          <td className="py-2">{item.present}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              item.percentage >= 95 ? 'bg-green-100 text-green-800' :
                              item.percentage >= 90 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-500">No class attendance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AttendanceAnalytics;
