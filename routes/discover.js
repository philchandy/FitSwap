import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/discover/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { skill, location } = req.query;
    const db = req.app.locals.db;
    
    let query = { _id: { $ne: ObjectId.createFromHexString(userId) } };
    
    if (skill) {
      query.skills = { $in: [skill] };
    }
    
    //filter by location 
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    const users = await db.collection('users')
      .find(query)
      .project({ password: 0 }) //dont include pass 
      .toArray();
    
    res.json(users);
  } catch (error) {
    console.error('User discovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/matches/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = req.app.locals.db;
    
    //get wanted skills
    const currentUser = await db.collection('users').findOne(
      { _id: ObjectId.createFromHexString(userId) },
      { projection: { wantedSkills: 1, skills: 1 } }
    );
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // try to find matches
    const matches = await db.collection('users')
      .find({
        _id: { $ne: ObjectId.createFromHexString(userId) },
        $or: [
          { skills: { $in: currentUser.wantedSkills || [] } },
          { wantedSkills: { $in: currentUser.skills || [] } }
        ]
      })
      .project({ password: 0 })
      .toArray();
    
    const matchesWithScore = matches.map(user => {
      const canTeachMe = user.skills?.filter(skill => 
        currentUser.wantedSkills?.includes(skill)
      ) || [];
      
      const canLearnFromMe = user.wantedSkills?.filter(skill => 
        currentUser.skills?.includes(skill)
      ) || [];
      
      return {
        ...user,
        matchScore: canTeachMe.length + canLearnFromMe.length,
        canTeachMe,
        canLearnFromMe,
        matchType: canTeachMe.length > 0 && canLearnFromMe.length > 0 ? 'mutual' : 
                  canTeachMe.length > 0 ? 'teacher' : 'student'
      };
    });
    
    matchesWithScore.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json(matchesWithScore);
  } catch (error) {
    console.error('Match finding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const user = await db.collection('users').findOne(
      { _id: ObjectId.createFromHexString(id) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;