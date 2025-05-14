const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Opsional, tapi disarankan
});

// Konfigurasi storage untuk materi kursus
const courseMaterialStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        let folder = 'wfc_course_materials/other';
        let resource_type = 'auto'; // Biarkan Cloudinary mendeteksi

        if (file.mimetype.startsWith('image/')) {
            folder = 'wfc_course_materials/images';
            resource_type = 'image';
        } else if (file.mimetype.startsWith('video/')) {
            folder = 'wfc_course_materials/videos';
            resource_type = 'video';
        } else if (file.mimetype === 'application/pdf') {
            folder = 'wfc_course_materials/pdfs';
            resource_type = 'raw'; // Untuk PDF, Cloudinary menyimpannya sebagai 'raw'
        }

        return {
            folder: folder,
            resource_type: resource_type,
            // public_id: `lesson_${Date.now()}` // Opsional, nama file kustom
            // format: async (req, file) => 'png', // memaksa format
        };
    },
});

module.exports = { cloudinary, courseMaterialStorage };