$(document).ready(function() 
  {
    //Das hier wird jedes mal geladen, sobald index.html aufgerufen wird
    $.ajax({
        url: 'DB/getData.php',
        type: 'POST',
        dataType: 'json',
        //Mit Action die wird Funktion getList in getData.php aufgerufen
        data: {
          action: 'getList' 
        },
        success: function(data)
        {
          if (Array.isArray(data)) {
            var html = "<table border='1'>";
            html += "<tr><th>Title</th><th>Location</th><th>Description</th><th>Duration</th></tr>";
            $.each(data, function(index, entry) {
                html += "<tr>";
                //In der nächsten Zeile wird der Titel zu einem Link, um die Details aufrufen zu können und es wird die ID zum Titel gespeichert
                html += "<td><a href='#' class='appointment-title' data-appointment-id='" + entry.ID + "'>" + entry.Title + "</a></td>";
                //Hier wird jedes mal geprüft, ob der Inhalt leer ist, falls ja soll ein Whitespace geschrieben werden
                html += "<td>" + (entry.Location !== null ? entry.Location : '') + "</td>";
                html += "<td>" + (entry.Description !== null ? entry.Description : '') + "</td>";
                html += "<td>" + (entry.DurationInMin !== null ? entry.DurationInMin : '') + "</td>";
                html += "</tr>";
            });
            html += "</table>";
            $('#test').html(html);
        } else {
            // Fehlerbehandlung für ungültige Daten
            console.log('Ungültige Daten erhalten');
            $('#test').html('Ungültige Daten erhalten');
        }
        },
        error: function(xhr, status, error) {
          console.log('Fehler beim AJAX ausführen:');
          console.log('Status: ' + status);
          console.log('Fehler: ' + error);
          console.log('Antwort des Servers: ' + xhr.responseText)
        }
  })
});

function AddDateInput()
{
    //Zählt die Eingabenfelder und rechnet + 1 für die neue ID
    var fieldNum = $("#datesInputFields input").length + 1;
    var newField = $("<input type='datetime-local' id='date"+fieldNum+"' name='dates[]'><br><br>");
    $("#datesInputFields").append(newField);
}

function GetEventDetails()
{
    var title = document.getElementById("title").value;
    var location = document.getElementById("location").value;
    var durationMin = document.getElementById("durationMin").value;
    var durationStd = document.getElementById("durationStd").value;
    //Die Dauer wird in Minuten gespeichert
    var min = Number(durationMin);
    var std = Number(durationStd);
    var completeDurationInMin = std * 60 + min;
    var description = document.getElementById("description").value;
    var validationDate = document.getElementById("validationDate").value;
    var datesInputs = document.getElementsByName("dates[]");
    var dates = Array.from(datesInputs).map(input => input.value);
  
    $.ajax({
      type: "POST",
        url: "DB/getData.php", // URL zum PHP-Skript, das die Daten verarbeitet
        data: {
          //addAppointment wird aufgerufen und es werden die benötigten Parameter für die Funktion übergeben 
            action: 'addAppointment',
            title: title,
            location: location,
            description: description,
            durationMin: completeDurationInMin,
            validationDate: validationDate,
            dates: dates
        },
        success: function(data) {
            // Antwort des Servers anzeigen
            console.log(data);
        },
        error: function(xhr, status, error) {
          console.log('Fehler beim AJAX ausführen:');
          console.log('Status: ' + status);
          console.log('Fehler: ' + error);
          console.log('Antwort des Servers: ' + xhr.responseText)
        }
    })
}
//Wartet bis auf einen Link gedrückt wird
$(document).on('click', '.appointment-title', function(e) {
  //Daddurch wird das Standardverhalten des Browsers gestoppt und meine Aktion loaddetails ausgeführt
  e.preventDefault();
  var appointmentID = $(this).data('appointment-id');
  LoadDetails(appointmentID);
});

function LoadDetails(appointmentID) {
  $.ajax({
      url: 'DB/getData.php',
      type: 'POST',
      dataType: 'json',
      data: {
          action: 'getDetails',
          appointmentID: appointmentID
      },
      success: function(data) {
          console.log("Empfangene Daten:", data); // Debug-Ausgabe
          
          if (Array.isArray(data)) {
              var html = "<table border='1'>";
              // Tabellenkopf
              html += "<tr><th>Title</th><th>Location</th><th>Description</th><th>Datum</th><th>Uhrzeit</th><th>Duration</th></tr>";
              
              // Datenzeilen
              $.each(data, function(index, entry) {
                  html += "<tr>";
                  html += "<td>" + (entry.Title !== null ? entry.Title : '') + "</td>";
                  html += "<td>" + (entry.Location !== null ? entry.Location : '') + "</td>";
                  html += "<td>" + (entry.Description !== null ? entry.Description : '') + "</td>";
                  html += "<td>" + (entry.Datum !== null ? entry.Datum : '') + "</td>";
                  html += "<td>" + (entry.Uhrzeit !== null ? entry.Uhrzeit : '') + "</td>";
                  html += "<td>" + (entry.DurationInMin !== null ? entry.DurationInMin : '') + "</td>";
                  html += "</tr>";
              });

              html += "</table>";

              // Speichern der HTML-Daten im Session Storage
              sessionStorage.setItem('appointmentDetails', html);
              
              // Weiterleitung zur Detailseite
              window.location.href = 'appointmentDetails.html';
          } else {
              console.error('Fehler beim Laden der Appointment-Details:', data.error);
          }
      },
      error: function(xhr, status, error) {
          console.error('Fehler beim Laden der Appointment-Details:', error);
      }
  });
}


