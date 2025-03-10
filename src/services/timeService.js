function getCurrentTime() {
    return new Date().toLocaleTimeString('es-ES');
}

function getCurrentDate() {
    return new Date().toLocaleDateString('es-ES');
}

function getFullDateTime() {
    return new Date().toLocaleString('es-ES');
}

module.exports = {
    getCurrentTime,
    getCurrentDate,
    getFullDateTime
};
