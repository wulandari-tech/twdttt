const multer = require('multer');
const { courseMaterialStorage } = require('../config/cloudinary');

const upload = multer({ storage: courseMaterialStorage });

module.exports = upload;