import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, skills = [], wantedSkills = [], goals = [] } = req.body;
    const db = req.app.locals.db;
    
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email!' });
    }
    
    // new user
    const newUser = {
      name,
      email,
      password, //CHANGE TO HASHED PASSWORD?
      skills,
      wantedSkills,
      goals,
      bio: '',
      location: '',
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Return user without password
    const userResponse = { ...newUser, _id: result.insertedId };
    delete userResponse.password;
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;
    
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    //check password (simple comparison) - change to secure method after hash?
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    //dont include password 
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({ 
      message: 'Login successful', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get profile
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const user = await db.collection('users').findOne({ _id: ObjectId.createFromHexString(id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    //make sure not to return the password 
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//ipdate profiel
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, location, skills, wantedSkills, goals } = req.body;
    const db = req.app.locals.db;
    
    const updateData = {
      name,
      bio,
      location,
      skills,
      wantedSkills,
      goals,
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').updateOne(
      { _id: ObjectId.createFromHexString(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Profile updated!' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;