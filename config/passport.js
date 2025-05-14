const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return done(null, false, { message: 'Email tidak terdaftar.' });
            }

            if (user.isBanned) {
                return done(null, false, { message: 'Akun Anda telah diblokir.' });
            }

            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Password salah.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).select('-password'); // Jangan ambil password
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};