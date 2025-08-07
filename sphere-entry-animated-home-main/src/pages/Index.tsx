import React from 'react';
import { Crown, GraduationCap } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import RoleCard from '@/components/RoleCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Index = () => {
  const handleRoleClick = (role: string) => {
    if (role) {
      // Allow RoleCard component to handle navigation,
      // but we can still show a small notification for UX.
      toast.info(`Redirecting to ${role} login...`);
    } else {
      toast.error('❌ Invalid role selected.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <AnimatedBackground />
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar theme="colored" />

      {/* Header Section */}
      <div className="text-center mb-12 animate-fade-in-up px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 tracking-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            EduSphere
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto">
          Empowering Smart Schooling through innovative technology and seamless management
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-4xl px-4">
        <div className="flex-1 flex justify-center animate-scale-in">
          <RoleCard
            title="Principal Access"
            description="Administrative dashboard and school management tools"
            icon={<Crown className="w-12 h-12 text-blue-600" />}
            role="principal"
            gradient="bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50"
            onClick={() => handleRoleClick('Principal')}
          />
        </div>

        <div
          className="flex-1 flex justify-center animate-scale-in"
          style={{ animationDelay: '0.2s' }}
        >
          <RoleCard
            title="Teacher Access"
            description="Classroom management and student progress tracking"
            icon={<GraduationCap className="w-12 h-12 text-purple-600" />}
            role="teacher"
            gradient="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50"
            onClick={() => handleRoleClick('Teacher')}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-16 text-center animate-fade-in-up px-4"
        style={{ animationDelay: '0.4s' }}
      >
        <p className="text-gray-500 text-xs sm:text-sm">
          © 2024 EduSphere. Transforming education through technology.
        </p>
      </div>
    </div>
  );
};

export default Index;
