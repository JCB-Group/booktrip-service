let fakeBookedData = {
    [new Date(2019, 6, 5)]: true,
    [new Date(2019, 6, 18)]: true,
    [new Date(2019, 6, 19)]: true,
    [new Date(2019, 6, 20)]: true,
};

let selected = {[new Date(2019, 6, 18)]: true};

//es6 

class Calendar {
    constructor() {

        //put into state
        this.currentDate = new Date(),
        this.displayMonth = this.handleDisplayMonth();
        
        this.handleDisplayMonth = this.handleDisplayMonth.bind(this);
    }

    handleDisplayMonth(change) {
        let currentMonth = this.currentDate.getMonth();
        let currentYear = this.currentDate.getFullYear();

        if (change === 1 || change === -1) {
            currentMonth += change;
        }

        this.currentDate = new Date(currentYear, currentMonth);

        let dataMonth = [];
        let firstDay = new Date(currentYear, currentMonth, 1).getDay();
        for (let fakeDay = 0; fakeDay < firstDay; fakeDay++) {
            dataMonth.push(null);
        }

        let daysInThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let day = 1; day <= daysInThisMonth; day++) {
            let canCheckIn = !fakeBookedData[new Date(currentYear, currentMonth, day)];
            let canCheckOut = !fakeBookedData[new Date(currentYear, currentMonth, day - 1)];
            let date = new Date(currentYear, currentMonth, day)
            dataMonth.push({
                date,
                canCheckIn,
                canCheckOut,
                isSelected: !!selected[date]
            });
        }

        let displayMonth = [];
        while (dataMonth.length > 0) {
            let week = dataMonth.slice(0, 7);
            displayMonth.push(week);
            dataMonth = dataMonth.slice(7);
        }

        if (displayMonth[displayMonth.length - 1].length < 7) {
            while (displayMonth[displayMonth.length - 1].length < 7) {
                displayMonth[displayMonth.length - 1].push(null);
            }
        }

        if (this.displayMonth) {
            this.displayMonth = displayMonth;
            return displayMonth;   
        } else {
            return displayMonth;   
        }
    }
}

let my = new Calendar;