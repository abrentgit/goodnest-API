const express = require('express');
const router = express.Router();
const { Practice } = require('../models');

router.get('/', (req, res) => {
    const perPage = 3;
    const currentPage = req.query.page || 1;

    Practice.find()
        .skip(perPage * currentPage - perPage)
        .limit(perPage)
        .then(practices => {
            res.json({
                practices: practices.map(practice => practice.serialize())
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

module.exports = router;