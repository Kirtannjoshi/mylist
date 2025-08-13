const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mylist';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((error) => console.error('❌ MongoDB connection error:', error));

// User Schema - Simple username-only authentication
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  userData: {
    media: { type: Array, default: [] },
    todo: { type: Array, default: [] },
    bucket: { type: Array, default: [] },
    travel: { type: Array, default: [] }
  },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Routes

// Check if username exists
app.post('/api/auth/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }

    const existingUser = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (existingUser) {
      // Update last active
      existingUser.lastActive = new Date();
      await existingUser.save();
      
      return res.json({ 
        exists: true, 
        userData: existingUser.userData,
        message: `Welcome back, ${username}!`
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user
app.post('/api/auth/create-user', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }

    const existingUser = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already taken' 
      });
    }

    const newUser = new User({
      username: username.trim().toLowerCase(),
      userData: {
        media: [],
        todo: [],
        bucket: [],
        travel: []
      }
    });

    await newUser.save();

    res.status(201).json({ 
      success: true, 
      userData: newUser.userData,
      message: `Account created successfully! Welcome, ${username}!`
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save user data
app.post('/api/user/save-data', async (req, res) => {
  try {
    const { username, userData } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    const user = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    user.userData = userData;
    user.lastActive = new Date();
    await user.save();

    res.json({ 
      success: true, 
      message: 'Data saved successfully'
    });
  } catch (error) {
    console.error('Save data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user data
app.get('/api/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    res.json({ 
      userData: user.userData,
      lastActive: user.lastActive
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user stats
app.get('/api/user/:username/stats', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = {
      totalMedia: user.userData.media.length,
      totalTodos: user.userData.todo.length,
      totalBucket: user.userData.bucket.length,
      totalTravel: user.userData.travel.length,
      completed: user.userData.media.filter(m => m.status === 'completed').length,
      watching: user.userData.media.filter(m => m.status === 'in-progress').length,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
});
