const getClasses = require('../helpers/getClasses.js');
const getClosestFutureBooking = require('../helpers/getClosestFutureBooking.js');
const getClosestPreviousBooking = require('../helpers/getClosestPreviousBooking.js');
const getDatesBetween = require('../helpers/getDatesBetween.js');
const _ = require('underscore');
const $ = require('jquery');

let realBookedData = {};
let selected = {};
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: new Date(),
            displayMonth: [],
            task: 'bookingTrip', //checkingIn, checkingOut, or bookingTrip
            checkin: false,
            checkout: false,
            stopCheckoutsHere: false,
            startCheckinsHere: false,
            //Todo: min stay
        }
        this.handleDisplayMonth = this.handleDisplayMonth.bind(this);
        this.startCheckIn = this.startCheckIn.bind(this);
        this.startCheckOut = this.startCheckOut.bind(this);
        this.startBookTrip = this.startBookTrip.bind(this);
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
        let {task} = this.state;
        if (task === 'checkingIn') {
            this.setState({task: 'bookingTrip'});
        } else {
            this.setState({task: 'checkingIn'});
        }
    }

    startCheckOut() {
        let {task} = this.state;
        if (task === 'checkingOut') {
            this.setState({task: 'bookingTrip'});
        } else {
            this.setState({task: 'checkingOut'});
        }
    }

    startBookTrip() {
        this.setState({task: 'bookingTrip'});
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

        const task = checkout ? 'bookingTrip' : 'checkingOut';

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
        const display = this.state.task === 'bookingTrip' ? 'none' : 'block';
        const style = {
                display, 
                ['z-index']: 999, 
                position: 'absolute',
                backgroundColor: 'white',
                // top: '75px',
                border: '1px solid black'
        };

        const {checkin, checkout, task, currentDate} = this.state;

        let checkinDate = '';
        if (checkin) { checkinDate = `${checkin.getMonth()}/${checkin.getDate()}/${JSON.stringify(checkin.getYear()).slice(1)}` }

        let checkoutDate = '';
        if (checkout) { checkoutDate = `${checkout.getMonth()}/${checkout.getDate()}/${JSON.stringify(checkout.getYear()).slice(1)}` }
        
        // window.onclick = function(e) {
        //     if (task !== 'bookTrip') {
        //         if(e.target != document.getElementById('cal-area')) {
        //             // document.getElementById('content-area').innerHTML = 'You clicked outside.';    
        //             this.setState({task: 'bookingTrip'});
        //         } else {
        //             // document.getElementById('content-area').innerHTML = 'Display Contents';   
        //         }
        //     }
        // }

        const displayCheckinCheckoutStyle = {
            width: '100%',
            height: '20px',
            border: '1px solid lightgrey',
            padding: '5px'
        };

        let displayMonthAndYear = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        return (
            <div>
                <div style={displayCheckinCheckoutStyle}>
                    <span style={{float: 'left'}} onClick={this.startCheckIn}>{checkinDate ? checkinDate : 'Checkin'}</span>
                    <span style={{float: 'right'}} onClick={this.startCheckOut}>{checkoutDate ? checkoutDate : 'Checkout'}</span>
                </div>
                
                <table id='cal-area' style={style}>
                    <button style={{display: 'inline'}} onClick={() => this.handleDisplayMonth(-1)}>Prev</button>
                    <p style={{display: 'inline'}}>{displayMonthAndYear}</p>
                    <button style={{display: 'inline'}} onClick={() => this.handleDisplayMonth(1)}>Next</button>
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
                            }}>{day === null ? '' : day.date.getDate()}</th>)}
                        </tr>
                    )}
                    <button onClick={this.clearDates}>Clear Dates</button>
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