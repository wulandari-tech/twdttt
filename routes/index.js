const express = require('express');
const router = express.Router();
const Course = require('../models/course'); // Impor model Course jika Anda ingin menampilkan beberapa kursus di homepage

// Rute untuk Halaman Utama (Homepage)
router.get('/', async (req, res) => {
    try {
        // Opsional: Ambil beberapa kursus (misalnya, yang terbaru atau unggulan) untuk ditampilkan di homepage
        // Contoh: Mengambil 3 kursus secara acak atau berdasarkan kriteria tertentu
        // Untuk contoh ini, kita ambil 3 kursus pertama yang ditemukan (bisa diurutkan berdasarkan tanggal dibuat jika ada timestamp)
        const featuredCourses = await Course.find({})
                                        // .sort({ createdAt: -1 }) // Jika Anda punya field createdAt dan schema diatur dengan timestamps: true
                                        .limit(3) // Ambil maksimal 3 kursus
                                        .lean();  // .lean() untuk mendapatkan plain JavaScript objects, sedikit lebih cepat untuk read-only

        res.render('index', {
            title: 'Selamat Datang di WFC Course', // Judul untuk tag <title>
            courses: featuredCourses              // Kirim data kursus ke template index.ejs
        });
    } catch (err) {
        console.error("Error fetching courses for homepage:", err);
        // Anda bisa merender halaman error khusus atau pesan sederhana
        res.status(500).render('error', { // Anda perlu membuat file views/error.ejs
            title: 'Terjadi Kesalahan',
            message: 'Tidak dapat memuat halaman utama saat ini.',
            // Jangan kirim objek error ke client di mode produksi
            error: process.env.NODE_ENV !== 'production' ? err : {}
        });
    }
});

// Anda bisa menambahkan rute lain di sini jika perlu, misalnya:
// router.get('/about', (req, res) => {
//     res.render('about', { title: 'Tentang Kami' }); // Anda perlu membuat views/about.ejs
// });

// router.get('/contact', (req, res) => {
//     res.render('contact', { title: 'Hubungi Kami' }); // Anda perlu membuat views/contact.ejs
// });

module.exports = router;