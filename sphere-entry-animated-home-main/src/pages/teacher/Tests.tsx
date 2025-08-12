import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, Clock, Users } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Api_url} from '../config/config.js'

const Tests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '',
    duration: '',
    questions: '',
    date: '',
  });

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${Api_url}/AddTest`);
      setTests(res.data);
    } catch (err) {
      console.error('Error fetching tests:', err);
      toast.error('❌ Failed to fetch tests');
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      duration: Number(formData.duration),
      questions: Number(formData.questions),
    };

    try {
      if (editingId) {
        await axios.put(`${Api_url}/AddTest/${editingId}`, data);
        toast.success('✅ Test updated successfully');
      } else {
        await axios.post(`${Api_url}/AddTest`, { ...data, status: 'Draft', attempts: 0 });
        toast.success('✅ Test created successfully');
      }

      fetchTests();
      setFormData({ title: '', subject: '', class: '', duration: '', questions: '', date: '' });
      setEditingId(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('❌ Failed to save test');
    }
  };

  const handleEdit = (test) => {
    setFormData({
      title: test.title,
      subject: test.subject,
      class: test.class,
      duration: test.duration,
      questions: test.questions,
      date: test.date || '',
    });
    setEditingId(test._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${Api_url}/AddTest/${id}`);
      toast.info('🗑️ Test deleted successfully');
      fetchTests();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('❌ Failed to delete test');
    }
  };

  const toggleStatus = async (id) => {
    try {
      const current = tests.find((test) => test._id === id);
      const newStatus = current.status === 'Published' ? 'Draft' : 'Published';
      await axios.put(`${Api_url}/AddTest/${id}`, { ...current, status: newStatus });
      toast.success(`✅ Test ${newStatus === 'Published' ? 'published' : 'unpublished'} successfully`);
      fetchTests();
    } catch (err) {
      console.error('Status toggle error:', err);
      toast.error('❌ Failed to change status');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-red-50 to-pink-50">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar closeOnClick pauseOnHover theme="colored" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/dashboard/teacher')} variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Mock Tests</h1>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Create Test</span>
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Test' : 'Create New Test'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['title', 'subject', 'class'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-2 capitalize">{field}</label>
                      <Input
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        placeholder={`Enter ${field}`}
                        required
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Enter duration"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Questions</label>
                    <Input
                      type="number"
                      value={formData.questions}
                      onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                      placeholder="Enter questions"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.length > 0 ? (
                    tests.map((test) => (
                      <TableRow key={test._id}>
                        <TableCell>{test.title}</TableCell>
                        <TableCell>{test.subject}</TableCell>
                        <TableCell>{test.class}</TableCell>
                        <TableCell><Clock className="inline w-4 h-4 mr-1" />{test.duration}m</TableCell>
                        <TableCell>{test.questions}</TableCell>
                        <TableCell>{test.date ? new Date(test.date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${test.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {test.status}
                          </span>
                        </TableCell>
                        <TableCell><Users className="inline w-4 h-4 mr-1" />{test.attempts || 0}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => toggleStatus(test._id)}>
                              {test.status === 'Draft' ? 'Publish' : 'Unpublish'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(test)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(test._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500">
                        No tests available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tests;
