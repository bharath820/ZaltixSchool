import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Send, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Api_url } from '../config/config.js';

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: '',
    deliveryMethod: 'App',
  });

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${Api_url}/AddNotification`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to fetch notifications.');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message || !formData.audience) {
      toast.warning('Please fill in all fields.');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${Api_url}/AddNotification/${editingId}`, formData);
        toast.success('Notification updated successfully!');
      } else {
        await axios.post(`${Api_url}/AddNotification`, {
          ...formData,
          status: 'Sent',
        });
        toast.success('Notification sent successfully!');
      }

      fetchNotifications();
      setFormData({ title: '', message: '', audience: '', deliveryMethod: 'App' });
      setEditingId(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to send notification.');
    }
  };

  const handleEdit = (notification) => {
    setFormData({
      title: notification.title,
      message: notification.message,
      audience: notification.audience,
      deliveryMethod: notification.deliveryMethod,
    });
    setEditingId(notification._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${Api_url}/AddNotification/${id}`);
      toast.info('Notification deleted successfully.');
      fetchNotifications();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete notification.');
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-violet-50 to-purple-50">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate('/dashboard/teacher')}
              variant="outline"
              size="sm"
              className="flex items-center gap-x-1 px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">School Notifications</h1>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-violet-600 hover:bg-violet-700 flex items-center gap-x-1 px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Send Notification
          </Button>
        </div>

        {/* Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {editingId ? 'Edit Notification' : 'Compose New Notification'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter notification title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Audience</label>
                    <select
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                      value={formData.audience}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      required
                    >
                      <option value="">Select audience</option>
                      <option value="All Classes">All Classes</option>
                      <option value="Class 10A">Class 10A</option>
                      <option value="Class 10B">Class 10B</option>
                      <option value="Parents Only">Parents Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Method</label>
                  <select
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={formData.deliveryMethod}
                    onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                  >
                    <option value="App">App Only</option>
                    <option value="SMS">SMS Only</option>
                    <option value="Email">Email Only</option>
                    <option value="App + SMS">App + SMS</option>
                    <option value="App + Email">App + Email</option>
                    <option value="All">All Methods</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-x-1 px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4" />
                    {editingId ? 'Update Notification' : 'Send Notification'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ title: '', message: '', audience: '', deliveryMethod: 'App' });
                      setEditingId(null);
                    }}
                    className="flex items-center gap-x-1 px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Notification History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[640px] sm:min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Delivery Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <TableRow key={notification._id}>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell>{notification.audience}</TableCell>
                        <TableCell>{notification.deliveryMethod}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              notification.status === 'Sent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {notification.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(notification)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(notification._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No notifications found
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

export default Notifications;
