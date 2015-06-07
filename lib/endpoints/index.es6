import express from 'express';

// Create router for /products endpoints
let router = express.Router();

// Register endpoints
router.use('/products', require('./products'));

export default router;
