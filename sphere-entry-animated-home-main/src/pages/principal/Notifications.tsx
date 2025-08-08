import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Bell, Send, Eye, Users } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Api_url} from '../config/config.js'

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${Api_url}/AddNotification`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        toast.success(`Loaded ${data.length} notifications`, { autoClose: 2000 });
      })
      .catch(err => {
        console.error("Error fetching notifications:", err);
        toast.error('Failed to load notifications', { autoClose: 2000 });
      });
  }, []);

  const handleBackClick = () => {
    toast.info('Returning to Dashboard...', { autoClose: 1500 });
    setTimeout(() => navigate('/dashboard/principal'), 1500);
  };

  const deliveryStats = [
    { metric: 'Total Sent', value: notifications.length, color: 'text-blue-600' },
    { metric: 'Delivered', value: Math.floor(notifications.length * 0.95), color: 'text-green-600' },
    { metric: 'Opened', value: Math.floor(notifications.length * 0.75), color: 'text-purple-600' },
    { metric: 'Failed', value: Math.floor(notifications.length * 0.05), color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen p-2 md:p-4 relative">
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 mb-4 md:mb-6">
          {/* Back Button */}
          <div className="w-full md:w-auto">
            <Button
              onClick={handleBackClick}
              variant="outline"
              size="sm"
              className="w-full md:w-auto bg-white/70 hover:bg-white/90 flex items-center justify-center md:justify-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Title & Icon Section */}
          <div className="flex items-center space-x-3 flex-wrap">
            <div className="p-2 rounded-full bg-indigo-100">
              <Bell className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Notification Center</h1>
              <p className="text-sm text-gray-600">Message history & delivery analytics</p>
            </div>
          </div>
        </div>

        {/* Delivery Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {deliveryStats.map((stat, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{stat.metric}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center">
                <Send className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-blue-600">{notifications.length}</div>
              <p className="text-xs md:text-sm text-gray-600">Messages sent</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center">
                <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-600" />
                Open Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-green-600">{Math.floor((notifications.length * 0.75))}%</div>
              <p className="text-xs md:text-sm text-gray-600">Average engagement</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center">
                <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-600" />
                Total Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-purple-600">
                {notifications.reduce((sum, n) => sum + (n.recipients || 0), 0)}
              </div>
              <p className="text-xs md:text-sm text-gray-600">Recipients reached</p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Table */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="w-full min-w-[600px] md:min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Title</TableHead>
                    <TableHead className="text-xs md:text-sm">Message</TableHead>
                    <TableHead className="text-xs md:text-sm">Audience</TableHead>
                    <TableHead className="text-xs md:text-sm">Recipients</TableHead>
                    <TableHead className="text-xs md:text-sm">Sent Date</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n._id}>
                      <TableCell className="text-xs md:text-sm">{n.title}</TableCell>
                      <TableCell className="text-xs md:text-sm max-w-[150px] md:max-w-xs truncate">{n.message}</TableCell>
                      <TableCell className="text-xs md:text-sm">{n.audience}</TableCell>
                      <TableCell className="text-xs md:text-sm">{n.recipients}</TableCell>
                      <TableCell className="text-xs md:text-sm">{new Date(n.sentDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs md:text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-[10px] md:text-xs">
                          {n.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
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
