const express = require('express');
const router = express.Router();
const { User, Practice, Entry } = require('./models');
const { Entry } = require('../models');

router.get('/', (req, res) => {
    const perPage = 3;
    const currentPage = req.query.page || 1;

    Entry.find()
        .skip(perPage * currentPage - perPage)
        .limit(perPage)
        .then(entries => {
            res.json({
                entries: entries.map(entry => entry.serialize())
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

router.post('/', (req, res) => {
    const requiredFields = [
        'user',
        'date',
        'mood',
        'hours',
        'practices',
        'content'
    ];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    const userId = req.body.user;
    const practices = req.body.practices[0]; // FIX AFTER TESTING

    User.findById(userId, (err, user) => {
        if (err) {
            res.status(422).send({
                message: 'Can not find user'
            });
        } else {
            Practice.find(
                {
                    _id: {
                        $in: practices
                    }
                },
                function (err, practiceData) {
                    if (err) {
                        console.log(practiceData, 'self-care practices failing');
                        res.status(422).send({
                            message: 'Can not find practices'
                        });
                    } else {
                        Entry.create({
                            user: user._id,
                            mood: req.body.mood,
                            hours: req.body.hours,
                            practices: practices,
                            content: req.body.content,
                            date: req.body.date
                        })

                            .then(order => res.status(201).json(order.serialize()))
                            .catch(err => {
                                console.error(err);
                                res.status(500).json({
                                    error: 'Something went wrong'
                                });
                            });
                    }
                }
            );
        }
    });
});

module.exports = router;