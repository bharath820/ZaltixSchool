import express from 'express';
import AddDiary from '../models/AddDiary.js';

const router = express.Router();

// Create Diary Entry
router.post("/", async (req, res) => {
  const { date, class: studentClass, subject, notes } = req.body;

  if (!date || !studentClass || !subject || !notes) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newDiaryEntry = new AddDiary({
      date: new Date(date), // ensure stored as Date
      class: studentClass,
      subject,
      notes
    });

    const savedEntry = await newDiaryEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add diary entry' });
  }
});

// Get Diary Entries by Date
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    let filter = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    const entries = await AddDiary.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch diary entries' });
  }
});

// Update Diary Entry
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { date, class: studentClass, subject, notes } = req.body;

  try {
    const updated = await AddDiary.findByIdAndUpdate(
      id,
      { date: new Date(date), class: studentClass, subject, notes },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update diary entry' });
  }
});

// Delete Diary Entry
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await AddDiary.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Diary entry deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete diary entry' });
  }
});

export default router;
