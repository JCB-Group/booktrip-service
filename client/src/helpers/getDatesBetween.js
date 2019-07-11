const getDatesBetween = (start, stop) => {
    let implied = {};
    (function recurse(current) {
        if (current - stop < -86400000) {
            current.setDate(current.getDate() + 1);
            implied[current] = true;
            recurse(current);
        }
    })(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
    return implied;
};

module.exports = getDatesBetween;