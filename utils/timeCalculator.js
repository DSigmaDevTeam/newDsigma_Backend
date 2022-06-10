function getTimeInSeconds(str) {
 
    let curr_time = [];

    curr_time = str.split(':')
    for (let i = 0; i < curr_time.length; i++) {
        curr_time[i] = parseInt(curr_time[i]);
    }

    let t = curr_time[0] * 60 * 60
        + curr_time[1] * 60
        + curr_time[2];

    return t;
}

function convertSecToTime(t) {
    let hours = Math.floor(t / 3600);
    let hh = hours < 10 ? "0" + (hours).toString()
        : (hours).toString();
    let min = Math.floor((t % 3600) / 60);
    let mm = min < 10 ? "0" + (min).toString()
        : (min).toString();
    let sec = ((t % 3600) % 60);
    let ss = sec < 10 ? "0" + (sec).toString()
        : (sec).toString();
    let ans = hh + ":" + mm + ":" + ss;
    return ans;
}

function timeGap(st, et) {

    let t1 = getTimeInSeconds(st);
    let t2 = getTimeInSeconds(et);

    let time_diff = (t1 - t2 < 0) ? t2 - t1 : t1 - t2;
    // let time_diff = (t1)

    // return convertSecToTime(time_diff);
    return time_diff;
}

function totalBreakTime(breaks){
    let brks = [];
    let sum = 0;
    for (let i = 0; i < breaks.length; i++) {
        let start;
        let end;
            start = Object.values(breaks[i])[0]
            end = Object.values(breaks[i])[1]
            const diff = timeGap(start, end)
            brks.push(diff)
                console.log(brks)
    }
    for (let i = 0; i < brks.length; i++) {
        // const element = array[i];
        sum +=brks[i]
        
    }
    const total = convertSecToTime(sum);
    return total
}

function totalShiftTime(st, et) {

    let t1 = getTimeInSeconds(st);
    let t2 = getTimeInSeconds(et);

    let time_diff = (t1 - t2 < 0) ? t2 - t1 : t1 - t2;
    // let time_diff = (t1)

    return convertSecToTime(time_diff);
    return time_diff;
}

function breakTimeCalculator(st,et){
    
    let t1 = getTimeInSeconds(st);
    let t2 = getTimeInSeconds(et);

    let time_diff = (t1 - t2 < 0) ? t2 - t1 : t1 - t2;
    return convertSecToTime(time_diff);
}


module.exports = {
    totalBreakTime,
    timeGap,
    convertSecToTime,
    getTimeInSeconds,
    totalShiftTime,
    breakTimeCalculator
}