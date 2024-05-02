<?php
function connectToDB()
{
    //DB Connection wird einmal definiert
    include_once('db_config.php');
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error){
        die("Failed connection" . $conn->connect_error);
    }
    return $conn;
}

function getList()
{
    $conn = connectToDB();
    if ($conn->connect_error) {
        die("Verbindung fehlgeschlagen: " . $conn->connect_error);
    }
    
    $sql = "SELECT * FROM appoinments";
    $result = $conn->query($sql);

    $appointments = array();
    //Daten werden in Array gespeichert
    if ($result->num_rows > 0)
    {
        while($row = $result->fetch_assoc())
        {
            $appointments[] = $row;
        }
    }
    //Array wird in JSON umgewndelt und zurückgegeben an AJAX
    echo json_encode($appointments);
    
    $conn->close();
}

function addAppointment($title, $location, $description, $durationMin, $validationDate ,$dates)
{
    $conn = connectToDB(); 
    //Datum wird in das notwendige Format konvertiert
    $validationDateConverted = date("Y-m-d", strtotime($validationDate));   
    $sqlAddApp = "INSERT INTO appoinments(Title, Location, Ablaufdatum, Description, DurationInMin) 
    VALUES('$title', '$location','$validationDateConverted', '$description', '$durationMin')";
    $conn->query($sqlAddApp);
    //Hier wird die ID vom letzten Eintrag geholt
    $sqlGetAppID = "SELECT ID FROM appoinments WHERE Title = '$title' ORDER BY ID DESC LIMIT 1";
    $idResult = $conn->query($sqlGetAppID);
    if ($idResult) {
        // Extrahiere die ID aus dem Ergebnisobjekt
        $row = $idResult->fetch_assoc();
        $appointmentID = $row['ID'];
    
        // Schleife durch jedes Datum/Uhrzeit und füge sie ein
        foreach ($dates as $dateTime) {
            $date = date("Y-m-d", strtotime($dateTime));
            $time = date("H:i:s", strtotime($dateTime));
            $sqlAddDates = "INSERT INTO termine(appointmentID, Datum, Uhrzeit, voteCount) 
                            VALUES('$appointmentID', '$date', '$time', 0)";
            if ($conn->query($sqlAddDates) === TRUE) {
                $result = json_encode(array('success' => true, 'message' => 'Termin erfolgreich eingefügt'));
            }
        }
    }
    

    $conn->close(); // Schließe die Verbindung hier

    echo $result;
}

function getDetails($appointmentID) {
    $conn = connectToDB();
    if ($conn->connect_error) {
        die("Verbindung fehlgeschlagen: " . $conn->connect_error);
    }
    /*Es wird alles von appoinment und termine ausgegeben, wo die appointmentID mit dem übergabewert übereinstimmt, damit man 
    alle Details von dem angeforderten Event bekommt */
    $sql = "SELECT * FROM appoinments JOIN termine ON appoinments.ID = termine.appointmentID WHERE appoinments.ID = '$appointmentID'";
    $result = $conn->query($sql);

    $appointments = array();
    if ($result->num_rows > 0)
    {
        while($row = $result->fetch_assoc())
        {
            $appointments[] = $row;
        }
    }
    echo json_encode($appointments);
    
    $conn->close();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    //hier werden Actions geprüft, um die richtigen Funktionen von den jeweiligen AJAX Calls auszuführen 
    if ($_POST['action'] == 'addAppointment') {
        // Formulardaten verarbeiten
        $title = $_POST['title'];
        $location = $_POST['location'];
        $description = $_POST['description'];
        $durationMin = $_POST['durationMin'];
        $validationDate = $_POST['validationDate'];
        $dates = $_POST['dates'];
        echo addAppointment($title, $location, $description, $durationMin, $validationDate ,$dates);
    }
    elseif($_POST['action'] == 'getList') {
        echo getList();
    }
    elseif($_POST['action'] == 'getDetails') {
        $appointmentID = $_POST['appointmentID'];
        getDetails($appointmentID);
    }
}