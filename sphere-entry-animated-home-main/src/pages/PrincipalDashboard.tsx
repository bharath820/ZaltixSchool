import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3, Users, Calendar, FileText, Settings, LogOut, Crown, DollarSign,
  Package, Bell, Trophy, MessageSquare, Bus
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const PrincipalDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const dashboardItems = [
    {
      title: 'Attendance Analytics',
      description: 'View attendance trends & reports',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/dashboard/principal/attendance',
      gradient: 'bg-gradient-to-br from-blue-100 to-blue-200'
    },
    {
      title: 'Master Timetable',
      description: 'View school-wide schedules',
      icon: <Calendar className="w-6 h-6" />,
      path: '/dashboard/principal/timetable',
      gradient: 'bg-gradient-to-br from-purple-100 to-purple-200'
    },
    {
      title: 'Fee Reports',
      description: 'Financial collections & dues',
      icon: <DollarSign className="w-6 h-6" />,
      path: '/dashboard/principal/fees',
      gradient: 'bg-gradient-to-br from-red-100 to-red-200'
    },
    {
      title: 'Notifications',
      description: 'Message history & delivery',
      icon: <Bell className="w-6 h-6" />,
      path: '/dashboard/principal/notifications',
      gradient: 'bg-gradient-to-br from-indigo-100 to-indigo-200'
    },
    {
      title: 'Staff Management',
      description: 'Monitor staff & assignments',
      icon: <Users className="w-6 h-6" />,
      path: '/dashboard/principal/staff',
      gradient: 'bg-gradient-to-br from-green-100 to-green-200'
    },
    {
      title: 'HR / Payroll',
      description: 'Salary & expense tracking',
      icon: <DollarSign className="w-6 h-6" />,
      path: '/dashboard/principal/payroll',
      gradient: 'bg-gradient-to-br from-yellow-100 to-yellow-200'
    },
    {
      title: 'Feedback',
      description: 'Parent & teacher feedback',
      icon: <MessageSquare className="w-6 h-6" />,
      path: '/dashboard/principal/feedback',
      gradient: 'bg-gradient-to-br from-cyan-100 to-cyan-200'
    },
    {
      title: 'Academic Reports',
      description: 'Performance & analytics',
      icon: <FileText className="w-6 h-6" />,
      path: '/dashboard/principal/reports',
      gradient: 'bg-gradient-to-br from-orange-100 to-orange-200'
    },
    {
      title: 'Achievements',
      description: 'School accomplishments',
      icon: <Trophy className="w-6 h-6" />,
      path: '/dashboard/principal/achievements',
      gradient: 'bg-gradient-to-br from-pink-100 to-pink-200'
    },
    {
      title: 'Inventory',
      description: 'Stock management & alerts',
      icon: <Package className="w-6 h-6" />,
      path: '/dashboard/principal/inventory',
      gradient: 'bg-gradient-to-br from-teal-100 to-teal-200'
    },
    {
      title: 'Bus Tracking',
      description: 'Route monitoring & info',
      icon: <Bus className="w-6 h-6" />,
      path: '/dashboard/principal/bus',
      gradient: 'bg-gradient-to-br from-emerald-100 to-emerald-200'
    }
  ];

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 animate-fade-in-up gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 backdrop-blur-sm">
              <Crown className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Principal Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Analytics & oversight dashboard</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white/70 hover:bg-white/90 text-sm px-3 py-1.5 sm:px-4 sm:py-2 flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Responsive Dashboard Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {dashboardItems.map((item, index) => (
            <Card
              key={item.title}
              className={`${item.gradient} border-0 shadow-lg cursor-pointer card-hover animate-scale-in w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="p-2 text-center h-full flex flex-col justify-center items-center">
                <div className="mb-1 sm:mb-2 p-1.5 rounded-full bg-white/30 backdrop-blur-sm">
                  {item.icon}
                </div>
                <CardTitle className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-800 leading-tight text-center">
                  {item.title}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
