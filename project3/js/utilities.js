// http://paulbourke.net/miscellaneous/interpolation/

// we use this to interpolate the ship towards the mouse position
function lerp(start, end, amt){
    return start * (1-amt) + amt * end;
}

// we use this to keep the ship on the screen
function clamp(val, min, max){
    return val < min ? min : (val > max ? max : val);
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}