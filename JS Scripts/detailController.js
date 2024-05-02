$(document).ready(function() {
    // Abrufen der HTML-Daten aus dem Session Storage
    var appointmentDetails = sessionStorage.getItem('appointmentDetails');
    if (appointmentDetails) {
        $('#appointment-details').html(appointmentDetails);
    } else {
        $('#appointment-details').html('Appointment-Details nicht gefunden');
    }
});