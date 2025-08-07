import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Bus, MapPin, Clock, AlertCircle, CheckCircle, Trash } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import AddBusForm from '@/components/AddBusForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusTracking = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [busRoutes, setBusRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/addbus');
      setBusRoutes(res.data);
    } catch (err) {
      console.error('Error fetching buses:', err);
      setBusRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBusAdded = () => {
    toast.success('✅ Bus added successfully!', { position: 'top-right' });
    fetchBuses();
    setShowForm(false);
  };

  const handleDeleteBus = async (busId: string) => {
    try {
      await axios.delete(`http://localhost:5000/addbus/${busId}`);
      toast.success('🗑️ Bus deleted successfully!', { position: 'top-right' });
      fetchBuses();
    } catch (err) {
      console.error('Error deleting bus:', err);
      toast.error('❌ Failed to delete bus. Please try again.', { position: 'top-right' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Time':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Delayed':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Arrived':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time':
        return 'bg-green-100 text-green-800';
      case 'Delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Arrived':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen p-4 relative bg-gray-50">
      <AnimatedBackground />
      <ToastContainer autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
            <Button
              onClick={() => navigate('/dashboard/principal')}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-emerald-100 flex items-center justify-center">
                <Bus className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Bus Tracking System</h1>
                <p className="text-gray-600 text-sm">Real-time route monitoring & student transport</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white hover:bg-emerald-700 w-full md:w-auto"
            disabled={loading}
          >
            + Add New Bus
          </Button>
        </div>

        {/* Add Bus Form */}
        {showForm && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <AddBusForm onClose={handleBusAdded} />
          </div>
        )}

        {/* Bus Tracking Table */}
        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg md:text-xl font-semibold">Live Bus Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-6">Loading buses...</p>
            ) : busRoutes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-full border">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="px-4 py-2 text-left text-sm font-medium">Bus ID</TableHead>
                      <TableHead className="px-4 py-2 text-left text-sm font-medium">Route</TableHead>
                      <TableHead className="px-4 py-2 text-left text-sm font-medium">Driver</TableHead>
                      <TableHead className="px-4 py-2 text-left text-sm font-medium">Location</TableHead>
                      <TableHead className="px-4 py-2 text-left text-sm font-medium">Status</TableHead>
                      <TableHead className="px-4 py-2 text-left text-sm font-medium">ETA</TableHead>
                      <TableHead className="px-4 py-2 text-left text-sm font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {busRoutes.map((bus: any) => (
                      <TableRow key={bus._id} className="hover:bg-gray-50">
                        <TableCell className="px-4 py-2 font-medium">{bus.busId}</TableCell>
                        <TableCell className="px-4 py-2">{bus.routeName}</TableCell>
                        <TableCell className="px-4 py-2">{bus.driver?.name || 'N/A'}</TableCell>
                        <TableCell className="px-4 py-2 flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{bus.currentStop || 'Unknown'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(bus.status)}
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(bus.status)}`}>
                              {bus.status || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{bus.eta || 'N/A'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          <Button
                            onClick={() => handleDeleteBus(bus._id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Trash className="w-4 h-4" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">No bus data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusTracking;
