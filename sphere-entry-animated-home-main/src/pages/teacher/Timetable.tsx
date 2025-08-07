import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Save } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Timetable = () => {
  const navigate = useNavigate();

  const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-3:00', '3:00-4:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const subjects = [
    'Math - Mr. Smith', 'English - Ms. Rose', 'Science - Dr. Johnson',
    'History - Mrs. Lee', 'Geography - Mr. Kumar', 'Art - Ms. Gomez',
    'Music - Mr. Charles', 'PE - Coach Carter', 'IT - Ms. Watson', 'Break'
  ];

  const classOptions = ['10A', '10B', '11A', '11B'];
  const [selectedClass, setSelectedClass] = useState('10A');
  const [isLoading, setIsLoading] = useState(false);
  const [timetableData, setTimetableData] = useState({});

  const initializeTimetable = () => {
    const defaultTable = {};
    days.forEach(day => {
      defaultTable[day] = Array(timeSlots.length).fill('Break');
    });
    return defaultTable;
  };

  const normalizeTimetable = (entries = {}) => {
    const normalized = initializeTimetable();
    for (const day of days) {
      if (entries[day]) {
        const filled = entries[day].slice(0, timeSlots.length);
        while (filled.length < timeSlots.length) {
          filled.push('Break');
        }
        normalized[day] = filled;
      }
    }
    return normalized;
  };

  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/timetable/${selectedClass}`);
        const entries = res.data?.data?.entries;
        const normalized = normalizeTimetable(entries);
        setTimetableData(normalized);
      } catch (err) {
        console.error('Error loading timetable:', err);
        setTimetableData(initializeTimetable());
        toast.error('❌ Failed to fetch timetable');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedClass]);

  const handleSubjectChange = (day, timeIndex, subject) => {
    setTimetableData(prev => ({
      ...prev,
      [day]: prev[day].map((s, i) => (i === timeIndex ? subject : s))
    }));
  };

  const saveTimetable = async () => {
    try {
      setIsLoading(true);
      const payload = {
        className: selectedClass,
        section: selectedClass.slice(-1),
        academicYear: '2024-25',
        entries: timetableData
      };
      await axios.post('http://localhost:5000/timetable', payload);
      toast.success('✅ Timetable saved successfully');
    } catch (err) {
      console.error('Error saving timetable:', err);
      toast.error('❌ Failed to save timetable');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Class ${selectedClass} Timetable`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

      const tableColumn = ['Time', ...days];
      const tableRows = [];

      timeSlots.forEach((slot, timeIndex) => {
        const row = [slot];
        days.forEach(day => {
          row.push(timetableData[day]?.[timeIndex] || 'Break');
        });
        tableRows.push(row);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
        columnStyles: { 0: { cellWidth: 25 } }
      });

      doc.save(`Timetable_${selectedClass}.pdf`);
      toast.success('📄 PDF exported successfully');
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('❌ Failed to export PDF');
    }
  };

  if (isLoading || Object.keys(timetableData).length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-blue-50">
        <p className="text-gray-600 text-lg">Loading timetable...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="colored" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/dashboard/teacher')} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Timetable Management</h1>
          </div>
          <div className="flex space-x-2">
            <Button onClick={saveTimetable} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Class Selector */}
        <Card>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="class-select" className="text-gray-700 font-medium">Select Class:</label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {classOptions.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Table */}
        <Card>
          <CardHeader>
            <CardTitle>Class {selectedClass} Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-center">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-100 font-semibold text-left">Time</th>
                    {days.map(day => (
                      <th key={day} className="border p-3 bg-gray-100 font-semibold">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, timeIndex) => (
                    <tr key={slot}>
                      <td className="border p-3 bg-gray-50 font-medium text-left">{slot}</td>
                      {days.map(day => (
                        <td key={`${day}-${timeIndex}`} className="border p-2">
                          <select
                            value={timetableData[day]?.[timeIndex] || 'Break'}
                            onChange={(e) => handleSubjectChange(day, timeIndex, e.target.value)}
                            className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {subjects.map(subject => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Timetable;
