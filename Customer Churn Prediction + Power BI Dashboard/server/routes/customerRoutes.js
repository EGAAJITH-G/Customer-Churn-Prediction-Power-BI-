const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');

// Multer Config for CSV file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'upload_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  }
});

router.get('/', auth, customerController.getCustomers);
router.post('/', auth, customerController.createCustomer);
router.delete('/:id', auth, customerController.deleteCustomer);
router.post('/upload', [auth, upload.single('file')], customerController.uploadCustomersCSV);

module.exports = router;
