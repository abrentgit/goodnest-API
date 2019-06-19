const express = require('express');
const router = express.Router();
const { Entry, Practice, User } = require('../models');

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

router.delete('/:id', (req, res) => {
    Entry.findByIdAndRemove(req.params.id)
        .then(entry => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});

router.get('/:id', (req, res) => {
    Entry.findById(req.params.id)
        .then(order => res.json(order.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went horribly wrong'
            });
        });
});

router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    };

    const updated = {};
    const updateableFields = ['content'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    Entry.findByIdAndUpdate(req.params.id, updated)
        .then(updatedEntry => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Something went wrong'
        }));
});

module.exports = router;