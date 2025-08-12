import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, User, Search, Plus, Trash2 } from 'lucide-react';
import AddStaffModal from '@/components/AddStaffModal';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Api_url } from '../config/config.js';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  subjects: string[];
  classes: string[];
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

const StaffManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffData, setStaffData] = useState<Staff[]>([]);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const res = await axios.get(`${Api_url}/AddStaff`);
      setStaffData(res.data);
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
    }
  };

  const handleAddStaff = async (newStaff: Staff) => {
    try {
      await axios.post(`${Api_url}/AddStaff`, newStaff);
      fetchStaffData();
      setShowAddModal(false);
      toast.success('New staff added!', { autoClose: 1500 });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff.', { autoClose: 1500 });
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await axios.delete(`${Api_url}/AddStaff/${id}`);
      toast.success('Staff deleted successfully!', { autoClose: 1500 });
      fetchStaffData();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff.', { autoClose: 1500 });
    }
  };

  const filteredStaff = staffData.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportStaffList = () => {
    const exportData = staffData.map((staff) => ({
      Name: staff.name,
      Role: staff.role,
      Department: staff.subjects.join(', '),
      Classes: staff.classes.join(', '),
      'Join Date': staff.joinDate,
      Email: staff.email,
      Phone: staff.phone,
      Status: staff.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff List');
    XLSX.writeFile(wb, 'staff_management.xlsx');
    toast.info('Exported to Excel!', { autoClose: 1200 });
  };

  return (
    <div className="min-h-screen p-2 md:p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="w-full md:w-auto">
            <Button
              onClick={() => navigate('/dashboard/principal')}
              variant="outline"
              size="sm"
              className="w-full md:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-center md:text-left">
            Staff Management
          </h1>
          <div className="flex flex-wrap md:flex-nowrap gap-2 justify-center md:justify-end">
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Staff
            </Button>
            <Button onClick={exportStaffList} className="bg-green-600 text-white">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative w-full max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search staff by name, role, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffData.length}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Teachers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staffData.filter((s) => s.role.toLowerCase().includes('teacher')).length}
              </div>
              <p className="text-xs text-muted-foreground">Teaching staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">On Leave</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staffData.filter((s) => s.status === 'On Leave').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently absent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New Hires</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Directory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left text-sm">Name</th>
                    <th className="py-2 text-left text-sm">Role</th>
                    <th className="py-2 text-left text-sm">Subjects</th>
                    <th className="py-2 text-left text-sm">Classes</th>
                    <th className="py-2 text-left text-sm">Join Date</th>
                    <th className="py-2 text-left text-sm">Status</th>
                    <th className="py-2 text-left text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b">
                      <td className="py-2">
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-xs text-gray-500">{staff.email}</div>
                      </td>
                      <td className="py-2">{staff.role}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {staff.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {staff.classes.map((cls, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2">{staff.joinDate}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            staff.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : staff.status === 'On Leave'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <AddStaffModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddStaff={handleAddStaff}
        />
      </div>
    </div>
  );
};
//changes made//
export default StaffManagement;
