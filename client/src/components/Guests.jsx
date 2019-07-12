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
        let style = {display: newDisplay};

        return (
            <div>
                <p onClick={this.handleDisplayToggle}>{displayGuests}</p>
                <div id='container' style={style}>
                    <div>
                        <button disabled={disableDecrementAdults} onClick={() => this.handleAdult(-1)}>-</button>
                        <span> Adults: {adults} </span>
                        <button disabled={disableIncrementAdults} onClick={() => this.handleAdult(1)}>+</button>
                    </div>
                    <div>
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