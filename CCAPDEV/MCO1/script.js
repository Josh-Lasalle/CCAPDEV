const countryRegex=/^{1,}$/;

let getOrigin=$("#origin").val();

$('#myform').submit(function(event) {
    if (!countryRegex.test(getOrigin)){
        event.preventDefault();
        }
    }
);
