import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ArrowLeft, MessageSquare, Star } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { toast } from '@/components/ui/use-toast';

type TeacherFeedbackType = {
  _id: string;
  type: 'Teacher';
  class?: string;
  subject?: string;
  feedback?: string;
  rating?: number;
  date?: string;
};

type StudentFeedbackType = {
  _id: string;
  type: 'Student';
  studentName?: string;
  feedback?: string;
  rating?: number;
  date?: string;
};

type FeedbackType = TeacherFeedbackType | StudentFeedbackType;

const Feedback = () => {
  const navigate = useNavigate();
  const [feedbackData, setFeedbackData] = useState<FeedbackType[]>([]);
  const [filterType, setFilterType] = useState<'Teacher' | 'Student'>('Teacher');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const url =
          filterType === 'Teacher'
            ? 'http://localhost:5000/AddFeedback'
            : 'http://localhost:5000/studentfeedback';
        const res = await axios.get<FeedbackType[]>(url);
        setFeedbackData(res.data || []); // Fallback if backend returns null
      } catch (err) {
        toast({
          title: 'Error',
          description: `Failed to fetch ${filterType.toLowerCase()} feedback data.`,
          variant: 'destructive',
        });
        setFeedbackData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [filterType]);

  const renderStars = (rating = 0) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  );

  const getRatingColor = (rating = 0) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <Button
            onClick={() => navigate('/dashboard/principal')}
            variant="outline"
            size="sm"
            className="bg-white/70 hover:bg-white/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-cyan-100">
              <MessageSquare className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Feedback Center</h1>
              <p className="text-gray-600">Manage feedback from teachers and students</p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-4">
          {['Teacher', 'Student'].map(type => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type as 'Teacher' | 'Student')}
            >
              {type} Feedback
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle>Total Feedback</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{feedbackData.length}</div></CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle>Average Rating</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {feedbackData.length > 0
                  ? (feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackData.length).toFixed(1)
                  : '0.0'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader><CardTitle>Feedback Type</CardTitle></CardHeader>
            <CardContent>
              <div className="text-xl font-medium text-gray-700">{filterType}</div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Table */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader><CardTitle>{filterType} Feedback</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-lg text-gray-600">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {filterType === 'Teacher' ? (
                      <>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Date</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Date</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {feedbackData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={filterType === "Teacher" ? 5 : 4} className="text-center text-gray-500 py-8">
                        No feedback available.
                      </TableCell>
                    </TableRow>
                  ) : feedbackData.map(f => (
                    <TableRow key={f._id}>
                      {filterType === 'Teacher' ? (
                        <>
                          <TableCell>{(f as TeacherFeedbackType).class || '-'}</TableCell>
                          <TableCell>{(f as TeacherFeedbackType).subject || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {renderStars(f.rating)}
                              <span className={`ml-2 font-medium ${getRatingColor(f.rating)}`}>
                                {f.rating ?? 0}/5
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{f.feedback || '-'}</TableCell>
                          <TableCell>{f.date ? new Date(f.date).toLocaleDateString() : '-'}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{(f as StudentFeedbackType).studentName || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {renderStars(f.rating)}
                              <span className={`ml-2 font-medium ${getRatingColor(f.rating)}`}>
                                {f.rating ?? 0}/5
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{f.feedback || '-'}</TableCell>
                          <TableCell>{f.date ? new Date(f.date).toLocaleDateString() : '-'}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
