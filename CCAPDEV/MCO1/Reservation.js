const nameRegex=/^[A-Za-z]{2,}$/;
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passPortNumberRegex=/^[A-Z]\d{7}$/i;

$('#submitButtonReservation').on('click', function(event) {

    let getFirstName=$("#firstName").val();
    let getLastName=$("#lastName").val();
    let getEmail=$("#email").val();
    let getPassportNumber=$("#passportNumber").val();
    let isValid=true;

    if (!nameRegex.test(getFirstName)){
        showModal("Error: Please input a valid first name.");
        isValid=false;
        }
    if (!nameRegex.test(getLastName)){
        showModal("Error: Please input a valid last name.");
        isValid=false
        }
    if (!emailRegex.test(getEmail)){
        showModal("Error: Please input a valid email address.");
        isValid=false
        }
    if (!passPortNumberRegex.test(getPassportNumber)){
        showModal("Error: Please input a valid passport number.");
        isValid=false
        }

    if  (isValid==true){
         $("#confirmationModal").modal('show');
        }
    }
);

function showModal(message, title="Message") {
  $("#errorModalLabel").text(title);
  $("#errorModal-body").text(message);
  $("#errorModal").modal("show");
}
