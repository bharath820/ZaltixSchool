import mongoose from 'mongoose';

const SubjectStatusSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  present: { type: Boolean, required: true },
});

const AttendanceEntrySchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  subjects: [SubjectStatusSchema],
});

const AttendanceSchema = new mongoose.Schema({
  student: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' },
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    class: { type: String, required: true },
  },
  attendance: [AttendanceEntrySchema],
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
