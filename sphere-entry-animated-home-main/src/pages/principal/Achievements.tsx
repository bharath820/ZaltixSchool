import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Trophy, Medal, Star, Award } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Api_url } from '../config/config.js';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${Api_url}/achievements`)
      .then(res => res.json())
      .then(data => {
        setAchievements(data);
      })
      .catch(err => {
        console.error("Error fetching achievements:", err);
      });
  }, []);

  const categoryStats = [
    { category: 'Academic', count: achievements.filter(a => a.category === 'Academic').length, icon: <Star className="w-5 h-5" />, color: 'text-blue-600' },
    { category: 'Sports', count: achievements.filter(a => a.category === 'Sports').length, icon: <Trophy className="w-5 h-5" />, color: 'text-green-600' },
    { category: 'Arts', count: achievements.filter(a => a.category === 'Arts').length, icon: <Medal className="w-5 h-5" />, color: 'text-purple-600' },
    { category: 'Leadership', count: achievements.filter(a => a.category === 'Leadership').length, icon: <Award className="w-5 h-5" />, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar theme="colored" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 animate-fade-in-up gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/dashboard/principal')}
              variant="outline"
              size="sm"
              className="bg-white/70 hover:bg-white/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-pink-100">
                <Trophy className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">School Achievements</h1>
                <p className="text-gray-600 text-sm md:text-base">Recognition & accomplishments showcase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {categoryStats.map((stat, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm text-center">
              <CardHeader className="pb-2 flex flex-col items-center">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <span className={stat.color}>{stat.icon}</span>
                  <span>{stat.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Achievements Table */}
        <Card className="bg-white/70 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[750px] md:min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Achievement</TableHead>
                    <TableHead>Student/Team</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.length > 0 ? (
                    achievements.map((achievement) => (
                      <TableRow key={achievement.id}>
                        <TableCell className="font-medium">{achievement.title}</TableCell>
                        <TableCell>{achievement.student}</TableCell>
                        <TableCell>{achievement.category}</TableCell>
                        <TableCell>{achievement.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        No achievements found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Top Performers This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="font-medium">Emma Johnson</p>
                      <p className="text-sm text-gray-600">Grade 5 - 3 Gold medals</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Medal className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium">Michael Chen</p>
                      <p className="text-sm text-gray-600">Grade 4 - 2 Silver medals</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-medium">Sarah Williams</p>
                      <p className="text-sm text-gray-600">Grade 3 - 1 Bronze medal</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Competitions */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Upcoming Competitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="font-medium">State Science Fair</p>
                  <p className="text-sm text-gray-600">January 15, 2025</p>
                  <p className="text-xs text-blue-600">5 students participating</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="font-medium">Inter-school Debate</p>
                  <p className="text-sm text-gray-600">January 22, 2025</p>
                  <p className="text-xs text-green-600">Debate team ready</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3">
                  <p className="font-medium">Art Exhibition</p>
                  <p className="text-sm text-gray-600">February 5, 2025</p>
                  <p className="text-xs text-purple-600">12 artworks selected</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <p className="font-medium">Regional Sports Meet</p>
                  <p className="text-sm text-gray-600">February 12, 2025</p>
                  <p className="text-xs text-orange-600">Athletes in training</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
