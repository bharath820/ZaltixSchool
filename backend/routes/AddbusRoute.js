// routes/addBus.js
import express from 'express';
import BusEntry from '../models/AddBus.js';
import Student from '../models/AddStudentBus.js';

const router = express.Router();

// Get all buses
router.get('/', async (req, res) => {
  const data = await BusEntry.find().exec();
  res.json(data);
});

// Add a new bus
router.post('/', async (req, res) => {
  try {
    const entry = new BusEntry(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get enriched student data for a busId
router.get('/:busId', async (req, res) => {
  try {
    const { busId } = req.params;
    const bus = await BusEntry.findOne({ busId }).exec();
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const students = await Student.find({ busId }).exec();
    const enriched = students.map(student => ({
      studentId: student._id.toString(),
      studentName: student.studentName,
      class: student.class,
      pickupPoint: student.pickupPoint,
      vehicle: student.vehicle,
      routeName: bus.routeName,
      routeId: bus.busId,
      driverName: bus.driver.name,
      phoneNumber: bus.driver.license,       // replace if you have proper contact field
      vehicleNumber: bus.driver.license,     // or bus.driver.vehicleNumber
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a bus by ID
// Delete a bus by MongoDB _id
router.delete('/:id', async (req, res) => {
  try {
    const deletedBus = await BusEntry.findByIdAndDelete(req.params.id).exec();
    if (!deletedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json({ message: 'Bus deleted successfully', bus: deletedBus });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
