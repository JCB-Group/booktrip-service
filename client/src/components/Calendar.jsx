const getClasses = require('../helpers/getClasses.js');
const getClosestFutureBooking = require('../helpers/getClosestFutureBooking.js');
const getClosestPreviousBooking = require('../helpers/getClosestPreviousBooking.js');
const getDatesBetween = require('../helpers/getDatesBetween.js');
const _ = require('underscore');
const $ = require('jquery');

let style = {

};



let realBookedData = {};

let selected = {};
let testSelected = {};

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: new Date(),
            displayMonth: [],
            task: 'checkingIn', //checkingIn, checkingOut, or bookingTrip
            checkin: false,
            checkout: false,
            stopCheckoutsHere: false,
            startCheckinsHere: false,
            //Todo: min stay
        }
        this.handleDisplayMonth = this.handleDisplayMonth.bind(this);
        this.startCheckIn = this.startCheckIn.bind(this);
        this.startCheckOut = this.startCheckOut.bind(this);
        this.clearDates = this.clearDates.bind(this);
        this.bookTrip = this.bookTrip.bind(this);
    }

    componentDidMount() {
        $.ajax({
            method: 'get',
            url: '/dates',
            success: (res) => {
                _.each(res, (nested) => {
                    let str = nested.date;
                    let dateFromServer = new Date(str);
                    realBookedData[dateFromServer] = true;
                });
            },
            error: (err) => console.log('err: ', err)
        }).done(() => {
            console.log('realBookedData: ', realBookedData);
            this.handleDisplayMonth();
        });
    }

    handleDisplayMonth(change) {
        const {stopCheckoutsHere} = this.state;
        let {startCheckinsHere} = this.state;
        let currentMonth = this.state.currentDate.getMonth();
        let currentYear = this.state.currentDate.getFullYear();

        if (change === 1 || change === -1) {
            currentMonth += change;
        }

        //todo set state
        let currentDate = new Date(currentYear, currentMonth);

        //dump data into one giant array
        let dataMonth = [];

        //offset with days not in current month
        let firstDay = new Date(currentYear, currentMonth, 1).getDay();
        for (let fakeDay = 0; fakeDay < firstDay; fakeDay++) {
            dataMonth.push(null);
        }

        let daysInThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let day = 1; day <= daysInThisMonth; day++) {
            let date = new Date(currentYear, currentMonth, day)
            let canCheckIn;
            let canCheckOut;

            if (this.state.checkin) {
                canCheckIn = (date - new Date()) <= -86400000 === false;
                canCheckOut = (date - this.state.checkin) <= 0 === false;
            } else {
                canCheckIn = (date - new Date()) <= -86400000 === false;
                canCheckOut = (date - new Date()) <= 0 === false;
            }

            if (canCheckIn) {
                canCheckIn = !realBookedData[new Date(currentYear, currentMonth, day)];
                if (startCheckinsHere && canCheckIn) {
                    canCheckIn = date - startCheckinsHere > 0;
                }
            }
            
            if (canCheckOut) {
                canCheckOut = !realBookedData[new Date(currentYear, currentMonth, day - 1)];
                if (canCheckOut && stopCheckoutsHere) {
                    canCheckOut = date <= stopCheckoutsHere;
                }
            }

            dataMonth.push({
                date,
                canCheckIn,
                canCheckOut,
                isSelected: !!selected[date]
            });
        }

        //split data month into weeks for display
        let displayMonth = [];
        while (dataMonth.length > 0) {
            let week = dataMonth.slice(0, 7);
            displayMonth.push(week);
            dataMonth = dataMonth.slice(7);
        }

        //patch the last week with nulls
        while (displayMonth[displayMonth.length - 1].length < 7) {
            displayMonth[displayMonth.length - 1].push(null);
        }

        this.setState({displayMonth, currentDate});
    }

    startCheckIn() {
        this.setState({task: 'checkingIn'});
    }

    startCheckOut() {
        this.setState({task: 'checkingOut'});
    }

    handleCheckIn(date) {
        if (this.state.task !== 'checkingIn') return null
        let checkin = date;
        let {checkout} = this.state;

        if (checkout && checkin - checkout === 0) return null

        if (checkout && checkin - checkout > 0) {
            checkout = false;
        }

        if (!checkout) {
            selected = {[checkin]: true};
        } else {
            selected = {[checkin]: true, [checkout]: true};
            selected = Object.assign(selected, getDatesBetween(checkin, checkout));
        }

        const task = this.state.checkout ? 'bookingTrip' : 'checkingOut';

        new Promise((resolve, reject) => {
            this.setState({
                checkin, 
                checkout, 
                stopCheckoutsHere: getClosestFutureBooking(realBookedData, checkin),
                task
            });
            resolve();
        })
            .then(this.handleDisplayMonth)
            .then(() => this.props.updateCheckoutState('checkin', checkin))
            .then(() => {
                if (checkin && checkout) {
                    this.props.updateCheckoutState('trip', selected)
                }
            })
    }

    handleCheckOut(date) {
        if (this.state.task !== 'checkingOut') return null
        
        let checkout = date;
        let {checkin} = this.state;
        
        if (checkin && checkout - checkin === 0) return null
        
        if (!checkin) {
            selected = {[checkout]: true};
        } else {
            selected = {[checkin]: true, [checkout]: true}
            selected = Object.assign(selected, getDatesBetween(checkin, checkout));
            // debugger;
        }

        const task = this.state.checkin ? 'bookingTrip' : 'checkingIn';

        new Promise((resolve) => {
            this.setState({
                checkin, 
                checkout, 
                startCheckinsHere: getClosestPreviousBooking(realBookedData, checkout),
                task
            });
            resolve();
        })
            .then(() => this.handleDisplayMonth())
            .then(() => this.props.updateCheckoutState('checkout', checkout))
            .then(() => {
                if (checkin && checkout) {
                    this.props.updateCheckoutState('trip', selected)
                }
            })

    }

    clearDates() {
        $.ajax({
            method: 'get',
            url: '/dates',
            success: (res) => {
                _.each(res, (nested) => {
                    let str = nested.date;
                    let dateFromServer = new Date(str);
                    realBookedData[dateFromServer] = true;
                });
            },
            error: (err) => console.log('err: ', err)
        }).done(() => {
            console.log('realBookedData: ', realBookedData);
            new Promise((resolve, reject) => {
                selected = {};
                this.setState({
                    task: 'checkingIn', 
                    checkin: false, 
                    checkout: false,
                    stopCheckoutsHere: false,
                    startCheckinsHere: false,
                    currentDate: new Date()
                });
                resolve();
            })
                .then(() => this.handleDisplayMonth())
                .then(() => this.props.updateCheckoutState('clearAll'))
        });   
    }

    bookTrip() {
        if (this.state.task !== 'bookingTrip') return
        let {checkin, checkout} = this.state;
        if (checkin && checkout) {
            $.ajax({
                method: 'post',
                url: '/',
                data: selected,
                success: (response) => console.log(`success: `, response),
                error: (err) => console.log('err ', err)
            }).done(() => {
                this.props.updateCheckoutState('trip', selected)
            });
        }
    }

    render() {
        return (
            <div>
                <button onClick={() => this.handleDisplayMonth(-1)}>Prev</button>
                <button onClick={() => this.handleDisplayMonth(1)}>Next</button>
                <br /><br />
                <button onClick={this.startCheckIn}>Check In</button>
                <button onClick={this.startCheckOut}>Check Out</button>
                <br /><br />
                <p>Current Month: {this.state.currentDate.getMonth() + 1}/{this.state.currentDate.getFullYear()}</p>
                <p>Task: {this.state.task}</p>
                <button onClick={this.clearDates}>Clear Dates</button>
                <table>
                    {this.state.displayMonth.map((week) => 
                        <tr>
                            {week.map(day =>    
                            <th class={getClasses(day, this.state.task)}
                                onClick={() => {
                                    if (day === null) return
                                    if (this.state.task === 'checkingIn') {
                                        if (day.canCheckIn) {
                                            this.handleCheckIn(day.date);
                                        }
                                    } else if (this.state.task === 'checkingOut') {
                                        if (day.canCheckOut) {
                                            this.handleCheckOut(day.date);
                                        }
                                    }
                            }}>{day === null ? '-' : day.date.getDate()}</th>)}
                        </tr>
                    )}
                </table>
                {/* <button onClick={() => console.log(this.state.displayMonth)}>Log Month</button>
                <button onClick={() => console.log(this.state)}>Log State</button>
                <br /> */}
                {/* <button onClick={this.bookTrip}>Book Trip</button> */}
            </div>
        );
    }
}

module.exports = Calendar;