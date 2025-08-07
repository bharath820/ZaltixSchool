import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TeacherFeedback = () => {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [editId, setEditId] = useState(null);

  // Fetch feedback list
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/AddFeedback');
      setFeedbackList(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch feedbacks.');
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Submit or Update
  const handleSubmitFeedback = async () => {
    if (!selectedClass || !selectedSubject || !feedbackType || !feedbackText.trim() || rating === 0) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    const payload = {
      class: selectedClass,
      subject: selectedSubject,
      type: feedbackType,
      feedback: feedbackText,
      rating,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/AddFeedback/${editId}`, payload);
        toast.success('Feedback updated successfully!');
      } else {
        await axios.post('http://localhost:5000/AddFeedback', payload);
        toast.success('Feedback submitted successfully!');
      }

      // Reset form
      setFeedbackType('');
      setFeedbackText('');
      setRating(0);
      setSelectedClass('');
      setSelectedSubject('');
      setEditId(null);

      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      toast.error('Submission failed.');
    }
  };

  // Edit feedback
  const handleEdit = (item) => {
    setSelectedClass(item.class);
    setSelectedSubject(item.subject);
    setFeedbackType(item.type);
    setFeedbackText(item.feedback);
    setRating(item.rating);
    setEditId(item._id);
  };

  // Delete feedback
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/AddFeedback/${id}`);
      toast.info('Feedback deleted successfully.');
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reviewed': return 'text-green-600';
      case 'Pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Feedback Form */}
      <Card className="mb-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
          <Button onClick={() => navigate('/dashboard/teacher')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">{editId ? 'Edit Feedback' : 'Submit Feedback'}</h1>
        </div>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Class</option>
                <option value="10A">10A</option>
                <option value="9B">9B</option>
                <option value="8C">8C</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Feedback Type</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Type</option>
                <option value="Academic">Academic</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl hover:scale-110 transition-transform ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Comment</label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter feedback..."
            />
          </div>

          <Button
            onClick={handleSubmitFeedback}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            {editId ? 'Update' : 'Submit'}
          </Button>
        </CardContent>
      </Card>

      {/* Feedback History */}
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Feedback History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackList.length > 0 ? (
                    feedbackList.map((fb) => (
                      <TableRow key={fb._id}>
                        <TableCell>{fb.date}</TableCell>
                        <TableCell>{fb.class}</TableCell>
                        <TableCell>{fb.subject}</TableCell>
                        <TableCell>{fb.type}</TableCell>
                        <TableCell>{renderStars(fb.rating)}</TableCell>
                        <TableCell>{fb.feedback}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getStatusColor(fb.status)}`}>{fb.status}</span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button size="icon" variant="outline" onClick={() => handleEdit(fb)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(fb._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500">
                        No feedback found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherFeedback;
