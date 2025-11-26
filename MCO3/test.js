const superT = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Flight = require('./models/flight.model');
const Passenger = require('./models/passenger.model');
const Url = 'http://localhost:3000';
const agent = superT.agent(Url);

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/airlinedb');
});

afterAll(async () => {
    await User.deleteMany({
        username: {$in: ['testClient', 'testAdmin', 'updatedTestClient']}
    });
    await mongoose.connection.close();
});

// Creation of Test Users
describe('Create test users', () => {
    it('Should register client users', async () => {
        const res = await agent
            .post('/users/register')
            .send({
                username: 'testClient',
                password: '12345678',
                email: 'testClient@gmail.com'
            });
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toBe('/users/login');
    });

    it('Should add admin users', async () => {
        const res = await agent
            .post('/users/add')
            .send({
                username: 'testAdmin',
                password: '12345678',
                email: 'testAdmin@gmail.com',
                role: 'Admin'
            })
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toBe('/users');
    });

});

// Login 
describe('Login', () => {
    test('Client user should login and be redirected to Client Page', async () => {

        const clientUser = await User.findOne({username: 'testClient'});

        const res = await agent 
        .post('/users/login')
        .send({username: clientUser.username, password: clientUser.password});

        expect(res.statusCode).toBe(302); 
        expect(res.headers.location).toBe('/client/home'); 
    });

    test('Admin user should login and be redirected to Admin Page', async () => {

        const AdminUser = await User.findOne({username: 'testAdmin'});

        const res = await agent 
        .post('/users/login')
        .send({username: AdminUser.username, password: AdminUser.password});

        expect(res.statusCode).toBe(302); 
        expect(res.headers.location).toBe('/admin/home'); 
    });
});

// Test editing client profile
describe('Client Profile Update', () => {

    beforeAll(async () => {
        const clientUser = await User.findOne({username: 'testClient'});
        const res = await agent
            .post('/users/login')
            .send({username: clientUser.username, password: clientUser.password});

        expect(res.statusCode).toBe(302); 
        expect(res.headers.location).toBe('/client/home'); 
    });

    it('Should update client username & email successfully', async () => {
        const updatedData = {
            username: 'updatedTestClient',
            email: 'updatedTestClient@gmail.com',
            password: '',
            confirmPassword: ''
        };

        const res = await agent
            .post('/users/profile/update')
            .send(updatedData);
                
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('/client/profile?status=1');
    });

    it('Should update client password successfully', async () => {
        const updatedData = {
            username: 'updatedTestClient',
            email: 'updatedTestClient@gmail.com',
            password: 'test1234',
            confirmPassword: 'test1234'
        };

        const res = await agent
            .post('/users/profile/update')
            .send(updatedData);
                
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('/client/profile?status=1');

    });

    afterAll(async () => {
        const clientUser = await User.findOne({username: 'updatedTestClient'});

        clientUser.username = 'testClient';
        clientUser.email = 'testClient@gmail.com';
        clientUser.password = '12345678';
        await clientUser.save();
    });


});

// Test Booking
describe('Client Booking', () => {
    let flight;

    beforeAll(async () => {
        flight = await Flight.create({
            flightNum: "BB101",
            airline: "Bing Bong Airlines",
            aircraftType: "Bing Bong Air Carrier",
            origin: "Manila",
            destination: "Beijing",
            departureDate: new Date("2025-12-10"),
            departureTime: "10:00 AM",
            arrivalDate: new Date("2025-12-11"),
            arrivalTime: "11:30 AM",
            passengerCount: 0,
            seatCap: 60,
            price: 2500
        });
    });

    test('Client can render book flight', async () => {

        const res = await agent
            .post('/client/bookFlight')
            .send({
                origin: flight.origin,
                destination: flight.destination,
                departure: "2025-12-10",
                passengerCount: 1
            });

            expect(res.statusCode).toBe(200);
            expect(res.text).toContain("Book Flights");
    });
        
    
    test('Client can register to a flight', async () => {

        const res = await agent
            .post('/client/register')
            .send({
                flightId: flight._id,
                passengerCount: 1
            });

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Reservation Form");

    });

    test('Client can submit reservation', async () => {
        const clientUser = await User.findOne({username: 'testClient'});

        const res = await agent
            .post('/client/submitReservation')
            .send({
                fullName: clientUser.username,
                email: clientUser.email,
                passportID: 'A1234567',
                flightNum: flight.flightNum,
                meal: 'Standard',
                baggage: '20 kg',
                seatSelection: 'A1',
                passengerCount: 1
            });

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/client/success');

    });

    afterAll(async () => {
        await Flight.deleteOne({ _id: flight._id });
        await Passenger.deleteOne({ flightNum: flight.flightNum });
    });
    
});

//test API check-in
