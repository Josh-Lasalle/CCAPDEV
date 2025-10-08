let numPassengers = parseInt(localStorage.getItem("numPassengers")) || 3; 
let currentPassenger = 1;
let passengers = [];

const nameRegex=/^[A-Za-z]{2,}$/;
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passPortNumberRegex=/^[A-Z]\d{7}$/i;


$("#formTitle").text(`Passenger ${currentPassenger} of ${numPassengers}`);

$('#submitButtonReservation').on('click', function(event) {

    let getFirstName=$("#firstName").val();
    let getLastName=$("#lastName").val();
    let getEmail=$("#email").val();
    let getPassportNumber=$("#passportNumber").val();
    let getMealOption=$("#mealOption").val();
    let getExtraBaggage=$("#extraBaggage").is(":checked");
    let getSelectedSeat=document.querySelector('.col.selected');
    let isValid=true;

    if (!nameRegex.test(getFirstName)){
        showModal("Please input a valid first name.");
        isValid=false;
        }
    if (!nameRegex.test(getLastName)){
        showModal("Please input a valid last name.");
        isValid=false
        }
    if (!emailRegex.test(getEmail)){
        showModal("Please input a valid email address.");
        isValid=false
        }
    if (!passPortNumberRegex.test(getPassportNumber)){
        showModal("Please input a valid passport number.");
        isValid=false
        }
    if (!getSelectedSeat) {
        showModal("Please select a seat.");
        isValid=false;
    }

    if  (isValid==true){

        let mealPrice=0;
        let baggagePrice=0;
        let isExtraBaggage="Yes";
        let planePrice=20000;
        let seatname=getSelectedSeat.textContent.trim();
        if(getMealOption=="No Meal"){
            mealPrice=0;
        }
        else{
            mealPrice=300;
        }
        if(getExtraBaggage==true){
            baggagePrice=250;
        }
        else{
            isExtraBaggage="No";
            baggagePrice=0;
        }
        let totalPrice=planePrice + mealPrice + baggagePrice;

        passengers.push({
        firstName: getFirstName,
        lastName: getLastName,
        email: getEmail,
        passport: getPassportNumber,
        meal: getMealOption,
        baggage: isExtraBaggage,
        seat: seatname,
        total: totalPrice
        });

        getSelectedSeat.classList.remove('selected');
        getSelectedSeat.classList.add('taken');

        $("#firstName, #lastName, #email, #passportNumber").val("");
        $("#mealOption").val("No Meal");
        $("#extraBaggage").prop("checked", false);

        let summary=`<h6>Passenger ${currentPassenger} Summary</h6>
                    <p>Name: ${getFirstName} ${getLastName}</p>
                    <p>Email:</strong> ${getEmail}</p>
                    <p>Passport No.: ${getPassportNumber}</p>
                    <p>Meal Option: ${getMealOption}</p>
                    <p>Extra Baggage: ${isExtraBaggage}</p>
                    <p>Selected Seat: ${seatname}</p>
                    <hr>
                    <h6>Price Breakdown:</h6>
                    <p>Base Fare: ₱${planePrice}</p>
                    <p>Meal Charge: ₱${mealPrice}</p>
                    <p>Extra Baggage: ₱${baggagePrice}</p>
                    <hr>
                    <p><strong>Total Price:</strong> ₱${totalPrice}</p>
                    `;

                $(".confirmationModal-body").html(summary);
                $("#confirmationModal").modal('show');

        }
    }
);

$("#confirmationModal").on('hidden.bs.modal', function () {
            
    $("#firstName, #lastName, #email, #passportNumber").val("");
    $("#mealOption").val("No Meal");
    $("#extraBaggage").prop("checked", false);

    currentPassenger++;

    if (currentPassenger < numPassengers){
        $("#formTitle").text(`Passenger ${currentPassenger} of ${numPassengers}`);
    } 

    else if (currentPassenger === numPassengers) {
        $(".btn-warning").text("Complete Booking");
        $("#formTitle").text(`Passenger ${currentPassenger} of ${numPassengers}`);
    } 
    else{
        ("#formTitle").text("All passengers have been entered!");
        $("#submitButtonReservation").prop("disabled", true);
        $(".btn-warning").text("Confirm");
    }
    });

function showModal(message, title="Error") {
  $("#errorModalLabel").text(title);
  $(".errorModal-body").text(message);
  $("#errorModal").modal("show");
}
