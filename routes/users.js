// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Brevo = require('@getbrevo/brevo');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Import the auth middleware

// --- Configure Brevo ---
const apiInstance = new Brevo.TransactionalEmailsApi();
if (process.env.BREVO_API_KEY) {
    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;
}
const sendSmtpEmail = new Brevo.SendSmtpEmail();
// --- End of Brevo Config ---

// Registration Route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!validator.isEmail(email)) {
            return res.status(400).json({ msg: 'Please enter a valid email address.' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ username, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Send Welcome Email using Brevo
        if (process.env.FROM_EMAIL) {
            sendSmtpEmail.subject = "Welcome to Road Reporter!";
            sendSmtpEmail.htmlContent = `
                <h2>Hi ${username},</h2>
                <p>Thank you for registering for the Road Reporter app. You can now log in and start reporting road issues to help your community.</p>
                <p>Happy reporting!</p>
            `;
            sendSmtpEmail.sender = { name: "Road Reporter App", email: process.env.FROM_EMAIL };
            sendSmtpEmail.to = [{ email: email, name: username }];

            apiInstance.sendTransacEmail(sendSmtpEmail).catch(error => console.error('Brevo Error:', error));
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// NEW: Get Logged-in User Route
router.get('/me', auth, async (req, res) => {
    try {
        // req.user is added by the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;