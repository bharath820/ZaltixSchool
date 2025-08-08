import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Calendar, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Api_url} from '../config/config.js'

const Diary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    class: '',
    subject: '',
    notes: ''
  });

  // Fetch entries on mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await axios.get(`${Api_url}/AddDiary`);
        setEntries(res.data);
      } catch (err) {
        console.error('Error fetching entries:', err);
        toast.error('Failed to fetch diary entries');
      }
    };
    fetchEntries();
  }, []);

  // Add or Update entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${Api_url}/AddDiary/${editingId}`, formData);
        setEntries((prev) =>
          prev.map((entry) =>
            entry._id === editingId ? { ...entry, ...formData } : entry
          )
        );
        toast.success('Entry updated successfully!');
      } else {
        const response = await axios.post(`${Api_url}/AddDiary`, formData);
        setEntries((prev) => [...prev, response.data]);
        toast.success('Entry added successfully!');
      }
      resetForm();
    } catch (err) {
      console.error('Error submitting:', err);
      toast.error('Failed to save entry');
    }
  };

  // Edit entry
  const handleEdit = (entry) => {
    setFormData({
      date: entry.date,
      class: entry.class,
      subject: entry.subject,
      notes: entry.notes,
    });
    setEditingId(entry._id);
    setShowAddForm(true);
  };

  // Delete entry
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${Api_url}/AddDiary/${id}`);
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
      toast.info('Entry deleted successfully');
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete entry');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      class: '',
      subject: '',
      notes: '',
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-orange-50 to-red-50">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/dashboard/teacher')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Class Diary</h1>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-sm px-3 py-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Entry
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Entry' : 'Add New Entry'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <Input
                      value={formData.class}
                      onChange={(e) =>
                        setFormData({ ...formData, class: e.target.value })
                      }
                      placeholder="Enter class"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Enter subject"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Enter class notes..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2 w-full sm:w-auto"
                  >
                    {editingId ? 'Update' : 'Add'} Entry
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="text-sm px-4 py-2 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Diary Entries */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-center text-gray-500">No diary entries available</p>
          ) : (
            entries.map((entry) => (
              <Card key={entry._id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-start sm:items-center space-x-4">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <h3 className="font-semibold">{entry.date}</h3>
                        <p className="text-sm text-gray-600">
                          {entry.class} - {entry.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-8 h-8"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-8 h-8"
                        onClick={() => handleDelete(entry._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 break-words">{entry.notes}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Diary;
