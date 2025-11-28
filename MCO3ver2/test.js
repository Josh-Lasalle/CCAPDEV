const superT = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Flight = require('./models/flight.model');
const Passenger = require('./models/passenger.model');
const Url = 'http://localhost:3000';
const client = superT.agent(Url); 
const admin = superT.agent(Url);

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/airlinedb');
    await User.create({ username: 'testAdmin', password: '12345678', email: 'testAdmin@gmail.com', role: 'Admin' });
    await admin.post('/users/login').send({ username: 'testAdmin', password: '12345678' });
});

afterAll(async () => {
    await User.deleteMany({
        username: {$in: ['testAdmin']}
    });
    await mongoose.connection.close();
});


describe('Login', () => {

    it('Should register client users', async () => {
        const res = await client.post('/users/register').send({
            username: 'testClient',
            password: '12345678',
            email: 'testClient@gmail.com',
            role: 'Client'
        });
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toBe('/users/login');

        const clientCheck = await User.findOne({username: 'testClient'});
        expect(clientCheck).not.toBeNull();
    });

    test('Client user should login and be redirected to Client Page', async () => {

        const clientUser = await User.findOne({username: 'testClient'});

        const res = await client.post('/users/login').send({username: clientUser.username, password: '12345678'});

        expect(res.statusCode).toBe(302); 
        expect(res.headers.location).toBe('/client/home'); 
    });

});

describe('Client Profile Update', () => {

    it('Should update client username & email successfully', async () => {
        const updatedData = {
            username: 'updatedTestClient',
            email: 'updatedTestClient@gmail.com',
            password: '',
            confirmPassword: ''
        };

        const res = await client.post('/users/profile/update').send(updatedData);
                
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

        const res = await client.post('/users/profile/update').send(updatedData);
                
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/client/profile?status=1');

    });

    test('Fails as password do not match', async () => {
        const updatedData = {
            username: 'updatedTestClient',
            email: 'updatedTestClient@gmail.com',
            password: 'test1234',
            confirmPassword: 'failtest1234'
        };

        const res = await client.post('/users/profile/update').send(updatedData);
                
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/client/profile?error=2');
    });

    test('Fails as username is invalid', async () => {
        const updatedData = {
            username: '',
            email: 'updatedTestClient@gmail.com',
            password: 'test1234',
            confirmPassword: 'test1234'
        };

        const res = await client.post('/users/profile/update').send(updatedData);
                
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/client/profile?error=3');
    });

    // force revert
    afterAll(async () => {
        const clientUser = await User.findOne({username: 'updatedTestClient'});

        clientUser.username = 'testClient';
        clientUser.email = 'testClient@gmail.com';
        clientUser.password = '12345678';
        await clientUser.save();
    });

});

describe('Flight Creation', () => {
  
    test('Admin should be able to create flights', async () => {

        const flightData =  {
            flightNum: 'BB123',
            airline: 'Bing Bong Airlines',
            aircraftType: 'Bing Bong Carrier',
            origin: 'Manila',
            destination: 'Beijing',
            departureDate: '2025-12-30',
            departureTime: '08:00',
            arrivalDate: '2025-12-30',
            arrivalTime: '10:00',
            seatCap: 60,
            price: 2500,
        };

        const res = await admin.post('/flights/add').send(flightData);
        
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/flights');

        const flightCheck = await Flight.findOne({flightNum: 'BB123'});
        expect(flightCheck).not.toBeNull();

    });

    test('Failed as flight number is invalid', async () => {

        const flightData =  {
            flightNum: 'A1',
            airline: 'Bing Bong Airlines',
            aircraftType: 'Bing Bong Carrier',
            origin: 'Manila',
            destination: 'Beijing',
            departureDate: '2025-12-30',
            departureTime: '08:00',
            arrivalDate: '2025-12-30',
            arrivalTime: '10:00',
            seatCap: 60,
            price: 2500,
        };

        const res = await admin.post('/flights/add').send(flightData);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Flight number must be exactly 5 characters long.');
    });
});

describe('Client Booking', () => {

    test('Client can render book flight', async () => {
        const flight = await Flight.findOne({flightNum: 'BB123'});
        const res = await client.post('/client/bookFlight').send({
                origin: flight.origin,
                destination: flight.destination,
                departure: "2025-12-10",
                passengerCount: 1
            });

            expect(res.statusCode).toBe(200);
            expect(res.text).toContain("Book Flights");
    });
        
    
    test('Client can register to a flight', async () => {
        const flight = await Flight.findOne({flightNum: 'BB123'});
        const res = await client.post('/client/register').send({
            flightId: flight._id,
            passengerCount: 1
        });

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Reservation Form");

    });

    test('Client can submit reservation', async () => {
        const flight = await Flight.findOne({flightNum: 'BB123'});
        const clientUser = await User.findOne({username: 'testClient'});

        const res = await client.post('/client/submitReservation').send({
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
        const flight = await Flight.findOne({flightNum: 'BB123'});
        await Flight.deleteOne({ _id: flight._id });
        await Passenger.deleteOne({ flightNum: flight.flightNum });
    });   
});

describe('Deleting Users', () => {
    let deleteUser;

    test('Delete the test client user as Admin', async () => {
        deleteUser = await User.findOne({username: 'testClient'});

        const res = await admin.post(`/users/delete/${deleteUser._id}`);

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/users');
    });
   
});
