require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const app = express();
require('./config/passport')(passport); 
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/wfc?retryWrites=true&w=majority';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'aVeryStrongAndLongSecretKeyForWFCAuth',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 hari
    }
}));

app.use(passport.initialize()); 
app.use(passport.session());   
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user; 
    res.locals.success_msg = req.flash('success_msg'); 
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); 
    res.locals.pageTitle = 'WFC Course Platform';
    res.locals.currentPath = req.path;
    next();
});
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const commentRoutes = require('./routes/comments'); 
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/courses', courseRoutes);
app.use('/comments', commentRoutes); 
app.use('/admin', require('./middleware/auth').ensureAdmin, adminRoutes); 
app.use((req, res, next) => {
    res.status(404).render('error', {
        pageTitle: '404 - Halaman Tidak Ditemukan',
        heading: 'Oops! Halaman Tidak Ditemukan',
        message: 'Maaf, halaman yang Anda cari sepertinya tidak ada.'
    });
});
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR HANDLER:", err); 
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan internal pada server.';
    res.status(statusCode).render('error', {
        pageTitle: `Error ${statusCode}`,
        heading: `Oops! Terjadi Kesalahan (${statusCode})`,
        message: message,
        error: process.env.NODE_ENV !== 'production' ? { message: err.message, stack: err.stack } : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`WFC Course Server with Auth running on http://localhost:${PORT}`);
});