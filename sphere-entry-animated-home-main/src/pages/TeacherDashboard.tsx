import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UserCheck,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Calendar,
  LogOut,
  GraduationCap,
  FileText,
  Video,
  Trophy,
  Bell,
  Bus
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const dashboardItems = [
    { title: 'Attendance', description: 'Mark and manage student attendance', icon: <UserCheck className="w-6 h-6" />, path: '/dashboard/teacher/attendance', gradient: 'bg-gradient-to-br from-green-100 to-green-200' },
    { title: 'Timetable', description: 'Manage class schedules', icon: <Calendar className="w-6 h-6" />, path: '/dashboard/teacher/timetable', gradient: 'bg-gradient-to-br from-blue-100 to-blue-200' },
    { title: 'Diary', description: 'Daily class notes and entries', icon: <FileText className="w-6 h-6" />, path: '/dashboard/teacher/diary', gradient: 'bg-gradient-to-br from-orange-100 to-orange-200' },
    { title: 'Videos', description: 'Upload and manage videos', icon: <Video className="w-6 h-6" />, path: '/dashboard/teacher/videos', gradient: 'bg-gradient-to-br from-cyan-100 to-cyan-200' },
    { title: 'Notifications', description: 'Send school notifications', icon: <Bell className="w-6 h-6" />, path: '/dashboard/teacher/notifications', gradient: 'bg-gradient-to-br from-violet-100 to-violet-200' },
    { title: 'E-Books', description: 'Upload and manage books', icon: <BookOpen className="w-6 h-6" />, path: '/dashboard/teacher/ebooks', gradient: 'bg-gradient-to-br from-teal-100 to-teal-200' },
    { title: 'Subjects', description: 'Add and manage subjects', icon: <BookOpen className="w-6 h-6" />, path: '/dashboard/teacher/subjects', gradient: 'bg-gradient-to-br from-purple-100 to-purple-200' },
    { title: 'Report Cards', description: 'Generate student reports', icon: <FileText className="w-6 h-6" />, path: '/dashboard/teacher/reports', gradient: 'bg-gradient-to-br from-indigo-100 to-indigo-200' },
    { title: 'Project Work', description: 'Assign and track projects', icon: <ClipboardList className="w-6 h-6" />, path: '/dashboard/teacher/projects', gradient: 'bg-gradient-to-br from-pink-100 to-pink-200' },
    { title: 'Mock Tests', description: 'Create and manage tests', icon: <ClipboardList className="w-6 h-6" />, path: '/dashboard/teacher/tests', gradient: 'bg-gradient-to-br from-red-100 to-red-200' },
    { title: 'Achievements', description: 'Record student achievements', icon: <Trophy className="w-6 h-6" />, path: '/dashboard/teacher/achievements', gradient: 'bg-gradient-to-br from-yellow-100 to-yellow-200' },
    { title: 'Bus Tracking', description: 'Monitor bus routes', icon: <Bus className="w-6 h-6" />, path: '/dashboard/teacher/bus', gradient: 'bg-gradient-to-br from-emerald-100 to-emerald-200' },
    { title: 'Feedback', description: 'Submit student feedback', icon: <MessageSquare className="w-6 h-6" />, path: '/dashboard/teacher/feedback', gradient: 'bg-gradient-to-br from-purple-100 to-purple-200' }
  ];

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 animate-fade-in-up gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100 backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Classroom management and student tools</p>
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

export default TeacherDashboard;
