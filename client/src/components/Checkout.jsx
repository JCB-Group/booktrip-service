const _ = require('underscore');
const $ = require('jquery');

const Calendar = require('./Calendar.jsx');
const Guests = require('./Guests.jsx');

class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            guests: null,       //{adults, children, infants}
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
                guests: null,
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
            console.log('Client error: trip not ready');
        }
    }

    render() {

        const {guests, checkin, checkout, trip} = this.state;

        //ledger
        const displayLedger = !trip ? 'none' : 'block';

        return (
            <div>
                <p onClick={() => console.log(displayLedger)}>show displayLedger</p>
                <h3>Checkout Component</h3>
                <p>Price: {this.state.price}</p>
                <div style={'display: ' + displayLedger} id='ledger'>
                    <p>start showing ledger!</p>
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