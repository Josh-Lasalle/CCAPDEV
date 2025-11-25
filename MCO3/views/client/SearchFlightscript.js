$(document).ready(function () {

$('#tripType').on('change', function () {
const $returnGroup = $('#returnDate').closest('.col-md-3');
let tripType = $('#tripType').val();

if(tripType != 'oneWay'){
 $returnGroup.removeClass('d-none');
}

if (tripType == 'oneWay'){
  $returnGroup.addClass('d-none');
}
});

//SEARCH 
$('#searchForm').on('submit', function (e) {
    e.preventDefault();
    $('#errorMessage').empty();
    clearErrors();

//CONSTANTS
const errors = [];
const originCountry = $('#origin').val();
const destinationCountry = $('#destination').val();
const departureDate = $('#departureDate').val();
const returnDate = $('#returnDate').val();
const passengerCount = parseInt($('#passengerCount').val());
let tripType = $('#tripType').val();


//VALIDATION RULES
if (!originCountry) {
      errors.push('Please select an origin country.');
      showError('#origin');
    }

if(!destinationCountry){
      errors.push('Please select a destination country.');
      showError('#destination');
    }

if(!departureDate){
    errors.push('Please select a departure date.');
    showError('#departureDate');
}

if(!passengerCount){
    errors.push('Please fill in the passenger count field.');
    showError('#passengerCount');
}

if (originCountry == destinationCountry && (destinationCountry && originCountry == !empty)){
    errors.push('Origin and destination cannot be the same.');
    showError('#origin');
    showError('#destination');
}

if(!tripType){
  errors.push('Please choose a trip type.');
    showError('#tripType');
}

if(tripType != 'oneWay'){

  if(!returnDate){
    errors.push('Please select a return date.');
    showError('#returnDate');
  }

  else if(departureDate >= returnDate){
      errors.push('Invalid Date Selected.');
      showError('#departureDate');
      showError('#returnDate');
  }
}
});

//ERROR
function showError(selector) { 
    $(selector).addClass('is-invalid');
  }

  function clearErrors() { 
    $('#searchForm input, #searchForm select').removeClass('is-invalid');
  }
});

