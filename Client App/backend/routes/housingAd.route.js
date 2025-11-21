const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const housingAdController = require('../controllers/housingAd.controller');

// GET /api/housing-ads - Get all housing ads (with optional filters)
router.get('/', housingAdController.getAllAds);

// GET /api/housing-ads/user/:userId - Get ads by user ID
router.get('/user/:userId', housingAdController.getAdsByUserId);

// GET /api/housing-ads/:id - Get housing ad by ID
router.get('/:id', housingAdController.getAdById);

// POST /api/housing-ads/upload-image - Upload image to Cloudinary
router.post('/upload-image', upload.single('image'), housingAdController.uploadImage);

// POST /api/housing-ads - Create new housing ad
router.post('/', housingAdController.createAd);

// PUT /api/housing-ads/:id - Update housing ad
router.put('/:id', housingAdController.updateAd);

// DELETE /api/housing-ads/:id - Delete housing ad
router.delete('/:id', housingAdController.deleteAd);

// POST /api/housing-ads/:id/images - Add image to housing ad
router.post('/:id/images', housingAdController.addImage);

// DELETE /api/housing-ads/images/:imageId - Delete image
router.delete('/images/:imageId', housingAdController.deleteImage);

module.exports = router;
