const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Etkinlik oluşturma
router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).send(event);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Tarihe göre etkinlikleri getirme
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const events = await Event.find({ 
      date: {
        $gte: new Date(date.setHours(0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59))
      }
    });
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Etkinlik silme
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).send();
    res.send(event);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().select('title date');
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
