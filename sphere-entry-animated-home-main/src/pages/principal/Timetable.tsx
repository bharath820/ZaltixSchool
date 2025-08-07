import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const TimetableView = () => {
  const navigate = useNavigate();
  const [viewBy, setViewBy] = useState('class');
  const [selectedClass, setSelectedClass] = useState('10A');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [displaySchedule, setDisplaySchedule] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-3:00', '3:00-4:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const teachers = ['Ms. Rose', 'Mr. Smith', 'Dr. Johnson', 'Mr. Kumar', 'Ms. Watson', 'Coach Carter', 'Mrs. Lee', 'Mr. Charles', 'Ms. Gomez'];
  const classes = ['10A', '10B', '11A', '11B'];

  const subjectColors = {
    Geography: 'bg-pink-100 text-pink-800',
    Science: 'bg-purple-100 text-purple-800',
    Math: 'bg-blue-100 text-blue-800',
    English: 'bg-yellow-100 text-yellow-800',
    History: 'bg-green-100 text-green-800',
    Art: 'bg-red-100 text-red-800',
    Music: 'bg-indigo-100 text-indigo-800',
    PE: 'bg-teal-100 text-teal-800',
    IT: 'bg-orange-100 text-orange-800',
    Break: 'bg-gray-200 text-gray-600',
  };

  const getColorClass = (slot) => {
    if (!slot || typeof slot !== 'string') return subjectColors['Break'];
    const subject = slot.split(' - ')[0]?.trim();
    return subjectColors[subject] || 'bg-gray-100 text-gray-800';
  };

  const fetchClassTimetable = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/timetable/${selectedClass}`);
      const entries = res.data?.data?.entries || {};
      const normalized = {};
      days.forEach(day => {
        const daySlots = entries[day] || [];
        normalized[day] = Array.from({ length: timeSlots.length }, (_, i) => daySlots[i] ?? 'Break');
      });
      setDisplaySchedule(normalized);
    } catch (err) {
      console.error('Error fetching class timetable:', err);
      setDisplaySchedule({});
    }
  };

  const fetchTeacherTimetable = async () => {
    try {
      const res = await axios.get('http://localhost:5000/timetable');
      const timetables = res.data?.data || [];
      const schedule = {};
      days.forEach(day => schedule[day] = Array(timeSlots.length).fill('Break'));

      timetables.forEach(({ className, entries }) => {
        days.forEach(day => {
          entries[day]?.forEach((slot, index) => {
            if (slot?.includes(selectedTeacher)) {
              schedule[day][index] = `${slot} (${className})`;
            }
          });
        });
      });
      setDisplaySchedule(schedule);
    } catch (err) {
      console.error('Error fetching teacher timetable:', err);
      setDisplaySchedule({});
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (viewBy === 'class') fetchClassTimetable().finally(() => setIsLoading(false));
    else if (viewBy === 'teacher') fetchTeacherTimetable().finally(() => setIsLoading(false));
  }, [viewBy, selectedClass, selectedTeacher]);

  // Excel Export
  const exportTimetableExcel = () => {
    const exportData = [];

    timeSlots.forEach((slot, index) => {
      const row = { Time: slot };
      days.forEach(day => {
        row[day] = displaySchedule[day]?.[index] || 'Break';
      });
      exportData.push(row);
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');

    const filename =
      viewBy === 'teacher' && selectedTeacher
        ? `${selectedTeacher.replace(/\s+/g, '_').toLowerCase()}_timetable.xlsx`
        : `${selectedClass.toLowerCase()}_timetable.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  // CSV Export
  const exportTimetableCSV = () => {
    const exportData = [];

    timeSlots.forEach((slot, index) => {
      const row = { Time: slot };
      days.forEach(day => {
        row[day] = displaySchedule[day]?.[index] || 'Break';
      });
      exportData.push(row);
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const subtitle = viewBy === 'teacher' && selectedTeacher ? selectedTeacher : selectedClass;
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${subtitle.replace(/\s+/g, '_').toLowerCase()}_timetable.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/dashboard/principal')} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Master Timetable</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportTimetableExcel} className="bg-green-600 text-white">
              <Download className="w-4 h-4 mr-1" /> Export Excel
            </Button>
            <Button onClick={exportTimetableCSV} className="bg-blue-600 text-white">
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Select View By */}
        <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
          <Select value={viewBy} onValueChange={setViewBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="View By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">By Class</SelectItem>
              <SelectItem value="teacher">By Teacher</SelectItem>
            </SelectContent>
          </Select>

          {viewBy === 'class' ? (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Timetable Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {viewBy === 'teacher' && selectedTeacher ? `${selectedTeacher}'s Schedule` : `${selectedClass} Timetable`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-600">Loading timetable...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 bg-gray-100 font-semibold">Time</th>
                      {days.map(day => (
                        <th key={day} className="border p-3 bg-gray-100 font-semibold">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, i) => (
                      <tr key={slot}>
                        <td className="border p-3 bg-gray-50 font-medium">{slot}</td>
                        {days.map(day => (
                          <td key={`${day}-${i}`} className="border p-2">
                            <div className={`p-2 rounded text-center font-medium ${getColorClass(displaySchedule[day]?.[i])}`}>
                              {displaySchedule[day]?.[i] || 'Break'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetableView;
