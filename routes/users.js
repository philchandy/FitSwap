import express from 'express';

const router = express.Router();

// Sample user data
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

router.get('/', (req, res) => {
  res.json(users);
});

export default router;