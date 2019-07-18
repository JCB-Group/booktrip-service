const _ = require('underscore');

const getClosestFutureBooking = (collection, ref) => {
    let hasFutureBooking = _.some(collection, (bool, date) => new Date(date) - ref > 0);
    if (hasFutureBooking) {
        let bookings = Object.keys(collection);
        let nearestFutureDate = bookings.reduce((a, c) => {
            let currentDate = new Date(c);
            let isFutureDate = currentDate > ref;
            return isFutureDate && currentDate - ref < a - ref ? currentDate : a;
        }, 99999999999999);
        return nearestFutureDate;
    } else {
        return null;
    }
};

module.exports = getClosestFutureBooking;