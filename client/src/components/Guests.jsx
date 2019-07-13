class Guests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            max: 5,
            adults: 1,
            children: 0,
            infants: 0,
            display: false
        }
        this.handleDisplayToggle = this.handleDisplayToggle.bind(this);
        this.handleAdult = this.handleAdult.bind(this);
        this.handleChildren = this.handleChildren.bind(this);
        this.handleInfants = this.handleInfants.bind(this);
    }

    handleAdult(change) {
        if (change === 1 || change === -1) {
            //must have at least 1 adult
            let {adults} = this.state;
            let guests = this.state.adults + this.state.children;
            let {max} = this.state;
            let sum = guests + change;
            if (0 < sum && sum <= max) {
                new Promise((resolve, reject) => {
                    this.setState({adults: adults + change});
                    resolve();
                }).then(() => {
                    let {adults, children, infants} = this.state;
                    this.props.updateCheckoutState('guests', {adults, children, infants})
                })
            }
        }
    }

    handleChildren(change) {
        if (change === 1 || change === -1) {
            let {children, max} = this.state;
            let guests = this.state.adults + this.state.children;
            let sum = guests + change;
            if (0 < sum && sum <= max) {
                new Promise((resolve, reject) => {
                    this.setState({children: children + change});
                    resolve();
                }).then(() => {
                    let {adults, children, infants} = this.state;
                    this.props.updateCheckoutState('guests', {adults, children, infants})
                })
            }
        }
    }

    handleInfants(change) {
        if (change === 1 || change === -1) {
            let {infants} = this.state;
            let sum = infants + change;
            if (0 <= sum && sum <= 5) {
                new Promise((resolve, reject) => {
                    this.setState({infants: sum});
                    resolve();
                }).then(() => {
                    let {adults, children, infants} = this.state;
                    this.props.updateCheckoutState('guests', {adults, children, infants})
                })
            }
        }
    }

    handleDisplayToggle() {
        let {display} = this.state;
        this.setState({display: !display});
    }

    render() {
        let guests = this.state.adults + this.state.children;
        let noun = guests === 1 ? 'guest' : 'guests';
        const {max, adults, children, infants, display} = this.state;

        const disableDecrementAdults = adults === 1;
        const disableIncrementAdults = guests === max;

        const disableDecrementChildren = children === 0;
        const disableIncrementChildren = guests === max;

        const disableDecrementInfants = infants === 0;
        const disableIncrementInfants = infants === 5;


        let guestsNoun = guests === 1 ? 'guest' : 'guests';
        let displayInfants = '';
        if (infants) {
            let infantsNoun = infants === 1 ? 'infant' : 'infants';
            displayInfants = `, ${infants} ${infantsNoun}`;
        }
        let displayGuests = guests + ' ' + guestsNoun + displayInfants;

        let newDisplay = display ? 'block' : 'none';
        let dropDownStyle = {
            display: newDisplay,
            width: '300px',
            position: 'absolute',
            backgroundColor: 'white',
            border: '1px solid black'
        };

        const containerStyle = {
            width: '100%',
            justifyContent: 'center'
        }

        const displayGuestsStyle = {
            width: '100%',
            border: '1px solid lightgrey',
            padding: '5px'
        };

        return (
            <div style={containerStyle}>
                <p style={displayGuestsStyle} onClick={this.handleDisplayToggle}>{displayGuests}</p>
                <div id='container' style={dropDownStyle}>
                    <div style={{clear: 'both'}}>
                        <span style={{float: 'left'}}> Adults: </span>
                        <span style={{float: 'right'}}>
                            <button disabled={disableDecrementAdults} onClick={() => this.handleAdult(-1)}>-</button>
                            <span>{adults}</span>
                            <button disabled={disableIncrementAdults} onClick={() => this.handleAdult(1)}>+</button>
                        </span>
                    </div>
                    <div style={{clear: 'both'}}>
                        <button disabled={disableDecrementChildren} onClick={() => this.handleChildren(-1)}>-</button>
                        <span> Children: {children} </span>
                        <button disabled={disableIncrementChildren} onClick={() => this.handleChildren(1)}>+</button>
                    </div>
                    <div>
                        <button disabled={disableDecrementInfants} onClick={() => this.handleInfants(-1)}>-</button>
                        <span> Infants: {infants} </span>
                        <button disabled={disableIncrementInfants} onClick={() => this.handleInfants(1)}>+</button>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = Guests;