// Attendance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Search, Calendar, Plus, Save } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import AddStudentModal from '@/components/AddStudentModal';

import {Api_url} from '../config/config.js'

const subjects = ['Math', 'Science', 'English', 'Social', 'Telugu'];

const Attendance = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState([]);

  const fetchStudents = async (cls, date, subject) => {
    try {
      const res = await axios.get(`${Api_url}/attendance`, {
        params: { class: cls, date, subject },
      });

      const studentsData = res.data.map((att) => ({
        _id: att.student._id,
        rollNo: att.student.rollNo,
        name: att.student.name,
        class: att.student.class,
        present: att.present,
      }));

      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students.');
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents(selectedClass, selectedDate, selectedSubject);
  }, [selectedClass, selectedDate, selectedSubject]);

  const handleAttendanceChange = async (studentId, present) => {
    setStudents((prev) =>
      prev.map((student) =>
        student._id === studentId ? { ...student, present } : student
      )
    );

    try {
      await axios.put(`${Api_url}/attendance/${studentId}`, {
        date: selectedDate,
        subject: selectedSubject,
        present,
      });
      toast.success('Attendance updated.');
    } catch (err) {
      console.error('Error updating attendance:', err);
      toast.error('Failed to update attendance.');
    }
  };

  const handleAddStudent = async (newStudent) => {
    try {
      await axios.post(`${Api_url}/attendance`, {
        name: newStudent.name,
        rollNo: newStudent.rollNo,
        class: newStudent.class,
      });

      toast.success('Student added!');
      fetchStudents(selectedClass, selectedDate, selectedSubject);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const exportToCSV = () => {
    if (students.length === 0) return toast.warn('No students to export.');

    const csvData = students.map((student) => ({
      'Roll No': student.rollNo,
      Name: student.name,
      Class: student.class,
      Subject: selectedSubject,
      Status: student.present ? 'Present' : 'Absent',
      Date: selectedDate,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Attendance_${selectedClass}_${selectedDate}.csv`);
    toast.success('CSV downloaded!');
  };

  const saveAttendance = async () => {
    try {
      const payload = students.map((student) => ({
        studentId: student._id,
        date: selectedDate,
        subject: selectedSubject,
        present: student.present,
      }));

      await axios.post(`${Api_url}/attendance/bulk`, payload);
      toast.success('Attendance saved!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance.');
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.includes(searchTerm)) &&
      student.class === selectedClass
  );

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => navigate('/dashboard/teacher')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button onClick={() => setShowAddModal(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add Student
            </Button>
            <Button onClick={exportToCSV} className="w-full md:w-auto bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={saveAttendance} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" /> Save Attendance
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              <div className="w-full lg:w-1/2">
                <label className="text-sm font-medium mb-1 block">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2 md:w-48">
                <label className="text-sm font-medium mb-1 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2 md:w-48">
                <label className="text-sm font-medium mb-1 block">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10A">10A</SelectItem>
                    <SelectItem value="10B">10B</SelectItem>
                    <SelectItem value="10C">10C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-1/2 md:w-48">
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClass} - {selectedDate} - {selectedSubject}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No students found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={student.present}
                            onCheckedChange={(checked) => {
                              if (!student.present) handleAttendanceChange(student._id, true);
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={!student.present}
                            onCheckedChange={(checked) => {
                              if (student.present) handleAttendanceChange(student._id, false);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-wrap justify-between gap-4 text-sm">
              <span>Total Students: {filteredStudents.length}</span>
              <span>Present: {filteredStudents.filter((s) => s.present).length}</span>
              <span>Absent: {filteredStudents.filter((s) => !s.present).length}</span>
            </div>
          </CardContent>
        </Card>

        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddStudent={handleAddStudent}
        />
      </div>
    </div>
  );
};

export default Attendance;
