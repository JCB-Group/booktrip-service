const _ = require('underscore');
const $ = require('jquery');
const commaSeparateNumber = require('../helpers/commaSeparateNumber.js');

const Calendar = require('./Calendar.jsx');
const Guests = require('./Guests.jsx');

const fakeFees = {
    tax: 0.13,      //depends on location
    cleaning: 100,  //dynamic
    service: .1,    //fixed, round up to nearest dollar
}

const bookTripStyle = {
    width: '100%',
    display: 'block', 
    clear: 'both',
    color: 'white',
    ['background-color']: '#fe001a',
    ['border-radius']: '15px',
    ['font-size']: '13px',
    padding: '10px',
    border: 'none'
}

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
                url: '/rooms/dates',
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

        let displayPrice = `$${commaSeparateNumber(price)}`;

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
        let displayGuests = numGuests + ' ' + guestsNoun + infants;

        let nightsTotal = commaSeparateNumber(price * nights);

        let displayNightsLeft = `${price} x ${nights + ' ' + nightsNoun}`;
        let displayNightsRight = `$${nightsTotal}`;

        let cleaning = fakeFees.cleaning;
        let displayCleaningRight = '$' + commaSeparateNumber(cleaning);

        let finalTotal = nightsTotal + cleaning;


        finalTotal = '$' + commaSeparateNumber(price * nights + fakeFees.cleaning);

        const containerStyle = {
            width: '300px',
            ['font-family']: 'Arial, Helvetica, sans-serif',
            ['font-weight']: 'lighter'
        }

        return (
            <div style={containerStyle} class='container'>
                <p>{displayPrice}<span style={{['font-size']: '11px'}}> / night</span></p>
                <Calendar updateCheckoutState={this.updateCheckoutState} />
                <Guests style={{clear: 'both'}} updateCheckoutState={this.updateCheckoutState} />
                <div style={style} id='ledger'>
                    <p style={{clear: 'both'}}>
                        <span style={{float: 'left'}}>{displayNightsLeft}</span>
                        <span style={{float: 'right'}}>{displayNightsRight}</span>
                    </p>
                    <p style={{clear: 'both'}}>
                        <span style={{float: 'left'}}>Cleaning fee</span>
                        <span style={{float: 'right'}}>{displayCleaningRight}</span>
                    </p>
                    <p style={{clear: 'both'}}>
                        <span style={{float: 'left'}}>Total</span>
                        <span style={{float: 'right'}}>{finalTotal}</span>
                    </p>
                </div>
                <button style={bookTripStyle} onClick={this.bookTrip}>Book Trip</button>
            </div>
        );
    }
}

module.exports = Checkout;