const Calendar = require('./components/Calendar.jsx');
const Guests = require('./components/Guests.jsx');

const App = () => (
    <div>
        <Guests />
        <hr />
        <Calendar />
    </div>
);

ReactDOM.render(<App />, document.getElementById('checkout-calendar'));