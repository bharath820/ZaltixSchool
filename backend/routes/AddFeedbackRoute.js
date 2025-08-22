import express from 'express';
import TeacherFeedback from '../models/AddFeedback.js';
const router = express.Router();

// GET all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await TeacherFeedback.find().sort({ date: -1 }).exec();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new feedback
router.post('/', async (req, res) => {
  const { class: cls, subject, type, feedback, rating } = req.body;

  if (!cls || !subject || !type || !feedback || !rating) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newFeedback = new TeacherFeedback({
    date: new Date().toISOString().split('T')[0],
    class: cls,
    subject,
    type,
    feedback,
    rating,
    status: 'Submitted',
  });

  try {
    const saved = await newFeedback.save();
    res.status(201).json({ success: true, insertedId: saved._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update feedback
router.put('/:id', async (req, res) => {
  try {
    const existing = await TeacherFeedback.findById(req.params.id).exec();
    if (!existing) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    // Merge existing data with updates
    const updatedData = {
      ...existing.toObject(),
      ...req.body,
    };

    const updated = await TeacherFeedback.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).exec();

    res.json({ success: true, updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});// PUT to update feedback
router.put('/:id', async (req, res) => {
  try {
    const updated = await TeacherFeedback.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
});


// DELETE feedback
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await TeacherFeedback.findByIdAndDelete(req.params.id).exec();
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
