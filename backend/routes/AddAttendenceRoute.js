import express from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/AddAttendence.js';

const router = express.Router();

// GET attendance by class, date, and subject
router.get('/', async (req, res) => {
  const { class: className, date, subject } = req.query;

  try {
    const students = await Attendance.find({ 'student.class': className });

    const result = students.map((entry) => {
      const day = entry.attendance.find((a) => a.date === date);
      const subjectStatus = day?.subjects.find((s) => s.subject === subject);

      return {
        student: entry.student,
        present: subjectStatus ? subjectStatus.present : false,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching attendance' });
  }
});

// PUT update a student's attendance for a date/subject
router.put('/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { date, subject, present } = req.body;

  try {
    const record = await Attendance.findOne({ 'student._id': studentId });

    if (!record) return res.status(404).json({ error: 'Student not found' });

    let day = record.attendance.find((a) => a.date === date);
    if (!day) {
      day = { date, subjects: [{ subject, present }] };
      record.attendance.push(day);
    } else {
      const subj = day.subjects.find((s) => s.subject === subject);
      if (subj) {
        subj.present = present;
      } else {
        day.subjects.push({ subject, present });
      }
    }

    await record.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error updating attendance' });
  }
});

// POST create a new student
router.post('/', async (req, res) => {
  const { name, rollNo, class: className } = req.body;

  try {
    const newStudent = new Attendance({
      student: {
        _id: new mongoose.Types.ObjectId(),
        name,
        rollNo,
        class: className,
      },
      attendance: [],
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// POST bulk attendance save
router.post('/bulk', async (req, res) => {
  const entries = req.body;

  try {
    for (const entry of entries) {
      const { studentId, date, subject, present } = entry;

      const record = await Attendance.findOne({ 'student._id': studentId });
      if (!record) continue;

      let day = record.attendance.find((a) => a.date === date);
      if (!day) {
        day = { date, subjects: [{ subject, present }] };
        record.attendance.push(day);
      } else {
        const subj = day.subjects.find((s) => s.subject === subject);
        if (subj) {
          subj.present = present;
        } else {
          day.subjects.push({ subject, present });
        }
      }

      await record.save();
    }

    res.json({ message: 'Bulk attendance saved' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving bulk attendance' });
  }
});


router.get('/byClassAndDate', async (req, res) => {
  const { className, date } = req.query;
  try {
    const data = await Attendance.find({ 'student.className': className });

    const result = data.map(student => {
      const dayAttendance = student.attendance.find(a => a.date === date);
      return {
        _id: student._id,
        name: student.student.name,
        rollNo: student.student.rollNo,
        className: student.student.className,
        date,
        subjects: dayAttendance ? dayAttendance.subjects : []
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});


// --- GET all classes ---
router.get('/classes', async (req, res) => {
  try {
    // Use distinct mongoose operation to gather all class names
    const classes = await Attendance.distinct('student.class');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class list' });
  }
});


// --- GET students with attendance by class and date ---
router.get('/students-with-attendance', async (req, res) => {
  const { date, class: className } = req.query;
  try {
    const query = {};
    if (className) query['student.class'] = className;
    const students = await Attendance.find(query);

    const results = students.map(s => {
      // Find attendance for the selected date
      const day = s.attendance.find(a => a.date === date);
      // Compute if present for any subject on that day
      const present = day ? day.subjects.some(subject => subject.present) : false;
      return {
        _id: s.student._id,
        name: s.student.name,
        rollNo: s.student.rollNo,
        class: s.student.class,
        present,
        subjects: day ? day.subjects : []
      };
    });
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});


// --- GET overall attendance stats for dashboard cards ---
router.get('/attendance-stats', async (req, res) => {
  const { date, class: className } = req.query;
  try {
    const query = {};
    if (className) query['student.class'] = className;
    const students = await Attendance.find(query);

    const totalStudents = students.length;
    let presentToday = 0;
    students.forEach(s => {
      const day = s.attendance.find(a => a.date === date);
      if (day && day.subjects.some(subject => subject.present)) presentToday++;
    });

    const absentToday = totalStudents - presentToday;
    const avgAttendance = totalStudents ? Number((presentToday/totalStudents*100).toFixed(1)) : 0;
    res.json({ totalStudents, presentToday, absentToday, avgAttendance });
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// --- GET class-wise attendance summary for a date ---
router.get('/class-attendance-summary', async (req, res) => {
  const { date } = req.query;
  try {
    const students = await Attendance.find({});
    // Get all classes
    const classes = [...new Set(students.map(s => s.student.class))];

    const result = classes.map(cls => {
      const classStudents = students.filter(s => s.student.class === cls);
      const total = classStudents.length;
      let present = 0;
      classStudents.forEach(s => {
        const day = s.attendance.find(a => a.date === date);
        if (day && day.subjects.some(subject => subject.present)) present++;
      });
      const percentage = total ? Number((present/total*100).toFixed(1)) : 0;
      return { class: cls, total, present, percentage };
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to summarize class attendance' });
  }
});

// --- GET attendance trends (for charts) ---
// Returns array: [{ period: "Aug 7", present: X, absent: Y }, ...]
import { subDays, subWeeks, subMonths, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

router.get('/attendance-trends', async (req, res) => {
  const { viewType = 'weekly', class: className } = req.query;
  // Only fetch for the past N days/weeks/months up to today
  const now = new Date();

  let dates = [];
  if (viewType === 'daily') {
    dates = eachDayOfInterval({ start: subDays(now, 6), end: now });
  } else if (viewType === 'weekly') {
    dates = eachWeekOfInterval({ start: subMonths(now, 1), end: now });
  } else {
    dates = eachMonthOfInterval({ start: subMonths(now, 6), end: now });
  }
  // For each date period, query attendance
  try {
    const query = {};
    if (className) query['student.class'] = className;

    const students = await Attendance.find(query);

    const data = dates.map(date => {
      let dateStr;
      if (viewType === 'daily') dateStr = format(date, 'yyyy-MM-dd');
      else if (viewType === 'weekly') dateStr = format(date, 'yyyy-MM-dd');
      else dateStr = format(date, 'yyyy-MM');

      let present = 0;
      let absent = 0;
      students.forEach(s => {
        let match = null;
        // Aggregate for week/month: consider students present for any day in the week/month as present
        if (viewType === 'daily') {
          match = s.attendance.find(a => a.date === dateStr);
        } else if (viewType === 'weekly') {
          match = s.attendance.find(a => 
            format(new Date(a.date), 'yyyy-MM-dd') >= format(date, 'yyyy-MM-dd') &&
            format(new Date(a.date), 'yyyy-MM-dd') <= format(subDays(date, 6), 'yyyy-MM-dd')
          );
        } else if (viewType === 'monthly') {
          match = s.attendance.find(a => a.date.slice(0,7) === dateStr);
        }
        if (match && match.subjects.some(subject => subject.present)) present++;
        else absent++;
      });
      return {
        period: viewType === 'monthly' ? format(date, 'MMM yyyy') : format(date, 'MMM dd'),
        present,
        absent
      };
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

// --- (Optional) Export attendance data for Excel ---
router.get('/export-attendance', async (req, res) => {
  const { type = 'daily', date, class: className } = req.query;
  const query = {};
  if (className) query['student.class'] = className;
  try {
    const students = await Attendance.find(query);
    let data = [];

    if (type === 'daily') {
      data = students.map(s => {
        const day = s.attendance.find(a => a.date === date);
        return {
          'Student Name': s.student.name,
          'Student ID': s.student.rollNo,
          'Class': s.student.class,
          'Date': date,
          'Subjects': (day ? day.subjects.map(subj => `${subj.subject}:${subj.present?'Present':'Absent'}`).join(", ") : ''),
          'Present': (day && day.subjects.some(subj => subj.present)) ? "Yes" : "No"
        };
      });
    }
    // You can add similar logic for weekly/monthly export
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to export attendance' });
  }
});


// GET attendance record by student name
router.get('/by-name', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Missing student name' });
  }
  try {
    // Find attendance document by student name (case-insensitive)
    const record = await Attendance.findOne({ 'student.name': new RegExp(`^${name}$`, 'i') });
    if (!record) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance by name' });
  }
});



export default router;
