import express from 'express';
import { AddStaff } from "../models/AddStaff.js"; // Ensure the path and export match your model

const router = express.Router();

/**
 * GET all staff members
 */
router.get('/', async (req, res) => {
  try {
    const staffMembers = await AddStaff.find().lean().exec();
    // Convert _id to id for frontend compatibility
    const formattedStaff = staffMembers.map(s => ({
      ...s,
      id: s._id.toString(),
    }));
    console.log('Fetched staff members:', formattedStaff);
    res.status(200).json(formattedStaff);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST - Add new staff member
 */
router.post('/', async (req, res) => {
  try {
    const { name, role, subjects, classes, joinDate, email, phone, status } = req.body;

    if (!name || !role || !subjects || !classes || !joinDate || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newStaff = new AddStaff({
      name,
      role,
      subjects,
      classes,
      joinDate,
      email,
      phone,
      status: status || 'Active' // default to Active
    });

    const savedStaff = await newStaff.save();
    console.log('Saved staff:', savedStaff);
    res.status(201).json({ ...savedStaff.toObject(), id: savedStaff._id.toString() });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE - Remove a staff member by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStaff = await AddStaff.findByIdAndDelete(id).exec();

    if (!deletedStaff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    console.log('Deleted staff:', deletedStaff);
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;