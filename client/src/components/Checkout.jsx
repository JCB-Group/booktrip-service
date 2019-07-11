const _ = require('underscore');
const $ = require('jquery');

const Calendar = require('./Calendar.jsx');
const Guests = require('./Guests.jsx');

class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            guests: {adults: 1, children: 0, infants: 0},       //{adults, children, infants}
            checkin: null,      // checkin date
            checkout: null,     // checkout date
            trip: null,         // all selected dates
            price: 150          // fixed price per night
        }
        this.updateCheckoutState = this.updateCheckoutState.bind(this);
        this.bookTrip = this.bookTrip.bind(this);
    }

    updateCheckoutState(prop, val) {
        if (prop === 'clearAll') {
            this.setState({
                status: 'bookingTrip', //bookingTrip || checkingIn || checkingOut
                guests: {adults: 1, children: 0, infants: 0},
                checkin: null,     
                checkout: null,
                trip: null
            });
        } else {
            this.setState({[prop]: val});
        }
    }

    bookTrip() {
        let {checkin, checkout, trip} = this.state;
        if (checkin && checkout && trip) {
            $.ajax({
                method: 'post',
                url: '/',
                data: trip,
                success: (response) => console.log(`success: `, response),
                error: (err) => console.log('err ', err)
            })
        } else {
            console.log('Client error: trip not ready to book');
        }
    }

    render() {
        const {price, guests, checkin, checkout, trip} = this.state;
        const displayLedger = !trip ? 'none' : 'block';
        let style = {display: displayLedger};

        let checkinDate = '';
        if (checkin) { checkinDate = `${checkin.getMonth()}/${checkin.getDate()}/${JSON.stringify(checkin.getYear()).slice(1)}` }

        let checkoutDate = '';
        if (checkout) { checkoutDate = `${checkout.getMonth()}/${checkout.getDate()}/${JSON.stringify(checkout.getYear()).slice(1)}` }

        let nights;
        if (trip) { nights = Object.keys(trip).length - 1 }
        let nightsNoun = nights === 1 ? 'night' : 'nights';
        let numGuests = guests.adults + guests.children;
        let guestsNoun = numGuests === 1 ? 'guest' : 'guests';
        let infants = '';
        if (guests.infants) {
            infants = guests.infants;
            let infantsNoun = infants === 1 ? 'infant' : 'infants';
            infants = `, ${infants} ${infantsNoun}`;
        }

        let nightsTotal = price * nights;
        
        let displayGuests = numGuests + ' ' + guestsNoun + infants;
        let displayNights = `${price} x ${nights + ' ' + nightsNoun} ... total: ${nightsTotal}`;
        let finalTotal = `Total: ${nightsTotal}`;

        return (
            <div>
                <h3>Checkout Component</h3>
                <p>Price: {price}</p>
                <div>
                    <p>Checkin: {checkinDate}</p>
                    <p>Checkout: {checkoutDate}</p>
                </div>
                <div style={style} id='ledger'>
                    <p>{displayGuests}</p>
                    <p>{displayNights}</p>
                    <p>{finalTotal}</p>
                </div>
                <button onClick={() => console.log('Checkout state: ', this.state)}>Log Checkout State</button>
                <br />
                <button onClick={this.bookTrip}>Book Trip</button>
                <hr />
                <h3>Guests Component</h3>
                <Guests updateCheckoutState={this.updateCheckoutState} />
                <hr />
                <h3 >Calendar Component</h3>
                <Calendar updateCheckoutState={this.updateCheckoutState} />
            </div>
        );
    }
}

module.exports = Checkout;