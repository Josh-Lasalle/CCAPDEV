$(document).ready(function () {

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

const countries ={
  manila: 'Manila',
  beijing: 'Beijing',
  rome: 'Rome',
  san_francisco: 'San Francisco',
  seoul: 'Seoul'

};

const flightsDB = [
  { route: 'manila_beijing', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB100', price: 303.20 },
  { route: 'manila_beijing', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB101', price: 260.20 },
  { route: 'manila_beijing', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB102', price: 280.50 },

  { route: 'beijing_manila', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB200', price: 303.20 },
  { route: 'beijing_manila', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB201', price: 260.20 },
  { route: 'beijing_manila', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB202', price: 280.50 },

  { route: 'rome_francisco', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB300', price: 303.20 },
  { route: 'rome_francisco', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB301', price: 260.20 },
  { route: 'rome_francisco', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB302', price: 280.50 },

  { route: 'francisco_rome', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB400', price: 303.20 },
  { route: 'francisco_rome', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB401', price: 260.20 },
  { route: 'francisco_rome', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB402', price: 280.50 },

  { route: 'manila_seoul', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB110', price: 303.20 },
  { route: 'manila_seoul', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB111', price: 260.20 },
  { route: 'manila_seoul', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB112', price: 280.50 }
];



//VALIDATION RULES
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

if(!departureDate){
    errors.push('Please select a departure date.');
    showError('#departureDate');
}

if(!returnDate){
    errors.push('Please select a return date.');
    showError('#returnDate');
}

if(!passengerCount){
    errors.push('Please fill in this field.');
    showError('#passengerCount');
}

let originText = countries[originCountry];
let destinationText = countries[destinationCountry];

//OUTPUT RESULT
    if (errors.length > 0) { // checks if errors array has elements
      $('#errorMessage').html(`<div class="alert alert-danger "><b>Error</b> <br> ${errors.join('<br>')}</div>`);
    } else {
      let i = 0;
      let flightMessage = `<div class="customBorder">
                            <div class="main_wrap"> 
                              <h4> ${originText} to 
                              ${destinationText}  |  
                              </h4><a href="search.html">Modify Search</a> 
                            </div> `;
      flightMessage += '<table class="table table-striped-columns m-u">';
      for(i; i < flightsDB.length; i++){
        const row = flightsDB[i];
        flightMessage += '<tr>'
                      + '<td>' + row.airline + '</td>'
                      + '<td>' + row.depart + '</td>'
                      + '<td>' + row.arrive + '</td>'
                      + '<td>' + row.flightNo + '</td>'
                      + '<td>' + row.price + '</td>'
                      + '</tr>';
      }
      flightMessage += '</table></div>';                 
      $('#flightMessage').html(flightMessage);
    }
  });

//ERROR
function showError(selector) { // takes the id and changes the element into a red border color
    $(selector).addClass('is-invalid');
  }
  function clearErrors() { // removes inline border-color for any input and select within the form
    $('#searchForm input, #searchForm select').removeClass('is-invalid');
  }
});
