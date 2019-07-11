//max:
    // children + adults <= max
    // infants: 0-5 always


class Guests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            max: 5,
            adults: 1,
            children: 0,
            infants: 0
        }
    }

    handleAdult(change) {
        if (change === 1 || change === -1) {
            //must have at least 1 adult
            let {adults} = this.state;
            let guests = this.state.adults + this.state.children;
            let {max} = this.state;
            let sum = guests + change;
            if (0 < sum && sum <= max) {
                this.setState({adults: adults + change});
            }
        }
    }

    handleChildren(change) {
        if (change === 1 || change === -1) {
            let {children, max} = this.state;
            let guests = this.state.adults + this.state.children;
            let sum = guests + change;
            if (0 < sum && sum <= max) {
                this.setState({children: children + change});
            }
        }
    }

    handleInfants(change) {
        if (change === 1 || change === -1) {
            let {infants} = this.state;
            let sum = infants + change;
            if (0 <= sum && sum <= 5) {
                this.setState({infants: sum});
            }
        }
    }

    render() {
        let guests = this.state.adults + this.state.children;
        let noun = guests === 1 ? 'guest' : 'guests';
        const {max, adults, children, infants} = this.state;

        const disableDecrementAdults = adults === 1;
        const disableIncrementAdults = guests === max;

        const disableDecrementChildren = children === 0;
        const disableIncrementChildren = guests === max;

        const disableDecrementInfants = infants === 0;
        const disableIncrementInfants = infants === 5;

        return (
            <div>
                <p>{`${guests} ${noun}`}</p>
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
        );
    }
}

module.exports = Guests;