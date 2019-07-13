var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/checkout-calendar', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to MongoDB!');
});

var bookingSchema = new mongoose.Schema({
    date: {type: String}
  });

const Booking = mongoose.model('Bookings', bookingSchema);

const bookNewTrip = (dates) => {
  dates = Object.keys(dates);
  return Promise.all(dates.map(date => {
    return new Promise((resolve, reject) => {
      let saveThisDate = new Booking({date});
      saveThisDate.save((err, success) => {
        if (err) {reject(err)}
        resolve(success)
      });
    })
  }));
};

const findAll = (callback) => {
  Booking.find((err, dates) => {
    if (err) {callback(err, null)}
    else {callback(null, dates)}
  })
};

module.exports = {db, bookNewTrip, findAll};