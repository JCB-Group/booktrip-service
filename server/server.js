const express = require('express');
const port = 3001;
const database = require('../database/database.js');
const bodyParser = require('body-parser');

express()
    .use(express.static('./client/dist/'))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .get('/', (req, res) => {
        res.render('./index.html');
    })
    .post('/rooms/dates', (req, res) => {
        let dates = req.body
        database.bookNewTrip(dates)
            .then((success) => res.send(success))
            .catch((err) => res.status(500).send(err))
    })
    .get('/rooms/dates', (req, res) => {
        //get all dates
        database.findAll((err, dates) => {
            if (err) {res.status(500).send(err)}
            else {res.send(dates)}
        });
    })

    .listen(port, () => {
        console.log(`listening at: ${port}`);
    });