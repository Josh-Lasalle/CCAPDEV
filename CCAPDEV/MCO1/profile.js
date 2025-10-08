$(document).ready(function () {
    $('#Form').on('submit', function (e) {
        e.preventDefault();
        $('#formMessage').empty();
        clearErrors();

        const errors = [];

        const firstName = $('#firstName').val().trim();
        const lastName = $('#lastName').val().trim();
        const email = $('#email').val().trim();
        const passport = $('#passport').val().trim();
        const username = $('#username').val().trim();
        const password = $('#password').val();

        // Validation rules
        if (!/^[a-zA-Z]{2,}$/.test(firstName)) {
            errors.push('First name must be at least 2 letters and contain only letters.');
            showError('#firstName');
        }

        if (!/^[a-zA-Z]{2,}$/.test(lastName)) {
            errors.push('Last name must be at least 2 letters and contain only letters.');
            showError('#lastName');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address.');
            showError('#email');
        }

        if (!/^[A-Z]\d{7}$/i.test(passport)) {
            errors.push('Please enter a valid passport number.');
            showError('#passport');
        }

        if (!/^[a-zA-Z0-9_]{4,}$/.test(username)) {
            errors.push('Username must be at least 4 characters and contain only letters and numbers.');
            showError('#username');
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
            errors.push('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
            showError('#password');
        }

        if (errors.length > 0) {
            $('#formMessage').html(`<div class="error">${errors.join('<br>')}</div>`);
        } else {
            $('#formMessage').html('<div class="success">Changes Saved</div>');
            this.reset();
        }

        function showError(selector) {
            $(selector).css('border-color', 'red');
        }
        function clearErrors() {
            $('#Form input').css('border-color', '');
        }
    });
});