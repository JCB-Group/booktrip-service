const getClasses = (day, task) => {
    if (day === null) return 'invalid'
    if (day.isSelected) return 'isSelected'
    if (task === 'checkingIn') {
        if (!day.canCheckIn || day.isBooked) return 'strikethru'
        else {return 'canHover'}
    } else {
        if (day.isSelected) return 'isSelected'
        else if (!day.canCheckOut) return 'strikethru'
        else {return 'canHover'}
    }
}

module.exports = getClasses;