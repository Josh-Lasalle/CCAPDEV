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

const countries ={
  manila: 'Manila',
  beijing: 'Beijing',
  rome: 'Rome',
  san_francisco: 'San Francisco',
  seoul: 'Seoul'
};

const flightsDB = [
  { route: 'manila_beijing', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB100', price: 17615.77 },
  { route: 'manila_beijing', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB101', price: 15119.44 },
  { route: 'manila_beijing', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB102', price: 16299.01 },

  { route: 'beijing_manila', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB200', price: 17615.77 },
  { route: 'beijing_manila', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB201', price: 15119.44 },
  { route: 'beijing_manila', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB202', price: 16299.01 },

  { route: 'rome_francisco', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB300', price: 17615.77 },
  { route: 'rome_francisco', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB301', price: 15119.44 },
  { route: 'rome_francisco', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB302', price: 16299.01 },

  { route: 'francisco_rome', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB400', price: 17615.77 },
  { route: 'francisco_rome', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB401', price: 15119.44 },
  { route: 'francisco_rome', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB402', price: 16299.01 },

  { route: 'manila_seoul', airline: 'BingBong Airline', depart: '05:30', arrive: '08:05', flightNo: 'BB110', price: 17615.77 },
  { route: 'manila_seoul', airline: 'BingBong Airline', depart: '08:00', arrive: '10:35', flightNo: 'BB111', price: 15119.44 },
  { route: 'manila_seoul', airline: 'BingBong Airline', depart: '14:00', arrive: '16:45', flightNo: 'BB112', price: 16299.01 }
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


let originText = countries[originCountry];
let destinationText = countries[destinationCountry];

//OUTPUT RESULT
    if (errors.length > 0) { // checks if errors array has elements
      $('#errorMessage').html(`<div class="alert alert-danger "><b>Error</b> <br> ${errors.join('<br>')}</div>`);
    } else {
      let i = 0;
      let flightMessage = '<ul class="nav nav-tabs" role="tablist">';

     flightMessage += `<li class ="nav-item" role="presentation">
      <button class="nav-link active" id="tab-out" data-bs-toggle="tab" type="button" role="tab">
        ${originText} - ${destinationText}
      </button>
      </li>
      `;
      
      if(tripType == 'round'){
        flightMessage += `<li class ="nav-item" role="presentation">
        <button class="nav-link" id="tab-return" data-bs-toggle="tab" type="button" role="tab">
         ${destinationText} - ${originText}
        </button>
        </li>
        `
      }

      flightMessage+= '</ul>';

      flightMessage += '<table class="table table-striped-columns m-u">';
      for(i; i < flightsDB.length; i++){
        const row = flightsDB[i];
        flightMessage += '<tr>'
                      + '<td>' + `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-airplane-fill" viewBox="0 0 16 16">
<path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849"/>
</svg>`+ row.airline + '</td>'
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
function showError(selector) { 
    $(selector).addClass('is-invalid');
  }

  function clearErrors() { 
    $('#searchForm input, #searchForm select').removeClass('is-invalid');
  }
});
