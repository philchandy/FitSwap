import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

//get all sessions with uid
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const db = req.app.locals.db;
    
    let query = {
      $or: [
        { trainerId: ObjectId.createFromHexString(userId) },
        { traineeId: ObjectId.createFromHexString(userId) }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const sessions = await db.collection('sessions')
      .find(query)
      .sort({ date: 1, startTime: 1 })
      .toArray();
    
    const populatedSessions = await Promise.all(
      sessions.map(async (session) => {
        const trainer = await db.collection('users').findOne(
          { _id: session.trainerId },
          { projection: { name: 1, email: 1 } }
        );
        
        const trainee = await db.collection('users').findOne(
          { _id: session.traineeId },
          { projection: { name: 1, email: 1 } }
        );
        
        return {
          ...session,
          trainer,
          trainee
        };
      })
    );
    
    res.json(populatedSessions);
  } catch (error) {
    console.error('GET uid sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { 
      trainerId, 
      traineeId, 
      title, 
      skill, 
      date, 
      startTime, 
      endTime, 
      location, 
      notes 
    } = req.body;
    const db = req.app.locals.db;
    
    const newSession = {
      trainerId: ObjectId.createFromHexString(trainerId),
      traineeId: ObjectId.createFromHexString(traineeId),
      title,
      skill,
      date: new Date(date),
      startTime,
      endTime,
      location: location || '',
      notes: notes || '',
      status: 'scheduled',
      createdAt: new Date()
    };
    
    const result = await db.collection('sessions').insertOne(newSession);
    
    res.status(201).json({ 
      message: 'Session scheduled!', 
      session: { ...newSession, _id: result.insertedId }
    });
  } catch (error) {
    console.error('POST session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const session = await db.collection('sessions').findOne({ 
      _id: ObjectId.createFromHexString(id) 
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const trainer = await db.collection('users').findOne(
      { _id: session.trainerId },
      { projection: { name: 1, email: 1, skills: 1 } }
    );
    
    const trainee = await db.collection('users').findOne(
      { _id: session.traineeId },
      { projection: { name: 1, email: 1, wantedSkills: 1 } }
    );
    
    res.json({
      ...session,
      trainer,
      trainee
    });
  } catch (error) {
    console.error('GET id session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, skill, date, startTime, endTime, location, notes, status } = req.body;
    const db = req.app.locals.db;
    
    const updateData = {
      title,
      skill,
      date: new Date(date),
      startTime,
      endTime,
      location: location || '',
      notes: notes || '',
      status,
      updatedAt: new Date()
    };
    
    const result = await db.collection('sessions').updateOne(
      { _id: ObjectId.createFromHexString(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ message: 'Session updated!' });
  } catch (error) {
    console.error('PUT session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const result = await db.collection('sessions').deleteOne({ 
      _id: ObjectId.createFromHexString(id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ message: 'Session cancelled!' });
  } catch (error) {
    console.error('DELETE session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;
    
    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await db.collection('sessions').updateOne(
      { _id: ObjectId.createFromHexString(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ message: `Session ${status} successfully` });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;