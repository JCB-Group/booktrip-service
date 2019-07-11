const _ = require('underscore');

const getClosestPreviousBooking = (collection, ref) => {
    let hasPreviousBooking = _.some(collection, (bool, date) => new Date(date) - ref < 0);
    if (hasPreviousBooking) {
        let bookings = Object.keys(collection);
        let closestPreviousBooking = bookings.reduce((a, c) => {
            let currentDate = new Date(c);
            let isPreviousDate = currentDate < ref;
            return isPreviousDate && currentDate - ref > a - ref ? currentDate : a;
        }, 0);
        // closestPreviousBooking.setDate(closestPreviousBooking.getDate() + 1);
        return closestPreviousBooking;
    } else {
        return null;
    }
}

module.exports = getClosestPreviousBooking;