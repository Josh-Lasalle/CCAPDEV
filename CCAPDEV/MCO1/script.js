$(document).ready(function () {


//SEARCH 
$('#searchForm').on('submit', function (e) {
    e.preventDefault();
    clearErrors();

const errors = [];
const originCountry = $('#origin').val();
const destinationCountry = $('#destination').val();
const departureDate = $('#departureDate').val();
const returnDate = $('#returnDate').val();
const passengerCount = parseInt($('#passengerCount').val());

const countries ={
  manila: 'Manila',
  beijing: 'Beijing',
  rome: 'Rome',
  san_francisco: 'San Francisco',
  seoul: 'Seoul'

};

//validation rules
if (!originCountry) {
      errors.push('Please select an origin country.');
      showError('#origin');
    }

if(!destinationCountry){
      errors.push('Please select a destination country.');
      showError('#destination');
    }

if (originCountry == destinationCountry){
  errors.push('Origin and destination cannot be the same.');
  showError('#origin');
  showError('#destination');
}

let originText= originCountry;

// Output result
    if (errors.length > 0) { // checks if errors array has elements
      $('#errorMessage').html(` <div class="alert alert-danger ">Errors: <br> ${errors.join('<br>')}</div>`);
    } else {
      let html = '<div class="main_wrap"> <h6> Departing flight</h6> <br> <h3> <div class="originText"></div> to <div class="destinationText"></div>  |  </h3> <a href="search.html">Modify Search</a> </div>';
      $('#flightMessage').html(html);
    }
  });

function showError(selector) { // takes the id and changes the element into a red border color
    $(selector).addClass('is-invalid');
  }

  function clearErrors() { // removes inline border-color for any input and select within the form
    $('#searchForm input, #searchForm select').removeClass('is-invalid');
  }


});
