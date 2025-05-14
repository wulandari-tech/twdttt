const User = require('../models/user');
const passport = require('passport');
const { validationResult } = require('express-validator'); 

exports.getRegister = (req, res) => {
    res.render('auth/register', { pageTitle: 'Daftar Akun Baru' });
};

exports.postRegister = async (req, res, next) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Mohon isi semua field.' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Konfirmasi password tidak cocok.' });
    }
    if (password && password.length < 6) {
        errors.push({ msg: 'Password minimal 6 karakter.' });
    }

    if (errors.length > 0) {
        return res.render('auth/register', {
            pageTitle: 'Daftar Akun Baru',
            errors,
            name,
            email
        });
    }

    try {
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            errors.push({ msg: 'Email sudah terdaftar.' });
            return res.render('auth/register', {
                pageTitle: 'Daftar Akun Baru',
                errors,
                name,
                email
            });
        }

        // Buat user baru (role admin di-set manual di DB jika perlu)
        const newUser = new User({ name, email, password });
        await newUser.save();
        req.flash('success_msg', 'Registrasi berhasil! Silakan login.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        errors.push({ msg: 'Terjadi kesalahan server saat registrasi.' });
        res.render('auth/register', {
            pageTitle: 'Daftar Akun Baru',
            errors,
            name,
            email
        });
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login', { pageTitle: 'Login Pengguna' });
};

exports.postLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true // Menggunakan flash message dari Passport
    })(req, res, next);
};

exports.getLogout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'Anda berhasil logout.');
        res.redirect('/auth/login');
    });
};