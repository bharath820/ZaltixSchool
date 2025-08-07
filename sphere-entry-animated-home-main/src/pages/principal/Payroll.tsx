import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Plus, Edit, Trash2 } from 'lucide-react';
import EditPayrollModal from '@/components/EditPayrollModal';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Payroll = () => {
  const navigate = useNavigate();
  const [payrollData, setPayrollData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '', position: '', department: '',
    baseSalary: 0, allowances: 0, deductions: 0,
    status: 'Pending'
  });

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const res = await axios.get('http://localhost:5000/payroll');
      setPayrollData(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleEdit = emp => {
    setEditingEmployee(emp);
    setShowEditModal(true);
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`http://localhost:5000/payroll/${id}`);
      setPayrollData(prev => prev.filter(p => p._id !== id));
      toast.success('Entry deleted successfully!', { autoClose: 1500 });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete entry.', { autoClose: 1500 });
    }
  };

  const handleUpdateEmployee = async updated => {
    const netSalary = updated.baseSalary + updated.allowances - updated.deductions;
    try {
      const res = await axios.put(`http://localhost:5000/payroll/${updated._id}`, { ...updated, netSalary });
      setPayrollData(prev => prev.map(p => p._id === updated._id ? res.data : p));
      setShowEditModal(false);
      toast.success('Entry updated successfully!', { autoClose: 1500 });
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update entry.', { autoClose: 1500 });
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const emp = payrollData.find(p => p._id === id);
    if (!emp) return;
    try {
      const res = await axios.put(`http://localhost:5000/payroll/${id}`, { ...emp, status: newStatus });
      setPayrollData(prev => prev.map(p => p._id === id ? res.data : p));
      toast.success('Status updated!', { autoClose: 1200 });
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to update status.', { autoClose: 1500 });
    }
  };

  const exportPayrollData = () => {
    const data = payrollData.map(emp => ({
      Name: emp.name,
      Designation: emp.position,
      Department: emp.department,
      'Base Salary': emp.baseSalary,
      Allowances: emp.allowances,
      Deductions: emp.deductions,
      'Net Salary': emp.netSalary,
      Status: emp.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
    XLSX.writeFile(wb, 'payroll.xlsx');
    toast.info('Exported to Excel!', { autoClose: 1200 });
  };

  const handleAddNew = async () => {
    const netSalary = newEmployee.baseSalary + newEmployee.allowances - newEmployee.deductions;
    const payload = { ...newEmployee, netSalary };
    try {
      const res = await axios.post('http://localhost:5000/payroll', payload);
      setPayrollData(prev => [res.data, ...prev]);
      setShowAddForm(false);
      setNewEmployee({ name: '', position: '', department: '', baseSalary: 0, allowances: 0, deductions: 0, status: 'Pending' });
      toast.success('New entry added!', { autoClose: 1500 });
    } catch (err) {
      console.error('Add error:', err);
      toast.error('Failed to add entry.', { autoClose: 1500 });
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="w-full md:w-auto">
            <Button onClick={() => navigate('/dashboard/principal')} variant="outline" size="sm" className="w-full md:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-center md:text-left">HR / Payroll</h1>
          <div className="flex flex-wrap md:flex-nowrap gap-2 justify-center md:justify-end">
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Staff
            </Button>
            <Button onClick={exportPayrollData} className="bg-yellow-600 text-white">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Add Payroll Entry</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {['name', 'position', 'department'].map(f => (
                  <div key={f}>
                    <label className="mb-1 capitalize block">{f}</label>
                    <input value={newEmployee[f]} onChange={e => setNewEmployee({ ...newEmployee, [f]: e.target.value })}
                      className="border p-2 w-full rounded" placeholder={f} required />
                  </div>
                ))}
                {['baseSalary', 'allowances', 'deductions'].map(f => (
                  <div key={f}>
                    <label className="mb-1 capitalize block">{f}</label>
                    <input type="number" value={newEmployee[f]} onChange={e => setNewEmployee({ ...newEmployee, [f]: +e.target.value })}
                      className="border p-2 w-full rounded" required />
                  </div>
                ))}
                <div>
                  <label className="block mb-1">Net Salary</label>
                  <input readOnly value={newEmployee.baseSalary + newEmployee.allowances - newEmployee.deductions}
                    className="border p-2 w-full bg-gray-100 rounded" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleAddNew} className="bg-blue-600 text-white">Add</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Payroll Entries</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    {['Name', 'Position', 'Department', 'Base Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(h => (
                      <th key={h} className="py-2 text-left text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payrollData.map(emp => (
                    <tr key={emp._id} className="border-b">
                      <td className="py-2">{emp.name}</td>
                      <td className="py-2">{emp.position}</td>
                      <td className="py-2">{emp.department}</td>
                      <td className="py-2">${emp.baseSalary?.toLocaleString()}</td>
                      <td className="py-2">${emp.allowances?.toLocaleString()}</td>
                      <td className="py-2">${emp.deductions?.toLocaleString()}</td>
                      <td className="py-2 font-medium">${emp.netSalary?.toLocaleString()}</td>
                      <td className="py-2">
                        <Select value={emp.status} onValueChange={val => handleStatusUpdate(emp._id, val)}>
                          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 flex flex-wrap md:flex-nowrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(emp)}>
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(emp._id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <EditPayrollModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          employee={editingEmployee}
          onUpdateEmployee={handleUpdateEmployee}
        />
      </div>
    </div>
  );
};

export default Payroll;
