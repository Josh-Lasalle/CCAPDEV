const superT = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Url = 'http://localhost:3000';

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/airlinedb');
});

afterAll(async () => {
    await User.deleteMany({
        username: {$in: ['testClient', 'testAdmin', 'updatedTestClient']}
    });
    await mongoose.connection.close();
});


describe('Login', () => {
    const agent = superT.agent(Url);
    test('Client user should login and be redirected to Client Page', async () => {

        await User.create({
            username: 'testClient',
            password: '12345678',
            email: 'testClient@gmail.com',
            role: 'Client'
        });

        const res = await agent 
        .post('/users/login')
        .send({username:'testClient', password:'12345678'});

        expect(res.statusCode).toBe(302); 
        expect(res.headers.location).toBe('/client/home'); 
    });

    test('Admin user should login and be redirected to Admin Page', async () => {

        await User.create({
            username: 'testAdmin',
            password: '12345678',
            email: 'testAdmin@gmail.com',
            role: 'Admin'
        });

        const res = await agent 
        .post('/users/login')
        .send({username:'testAdmin', password:'12345678'});

        expect(res.statusCode).toBe(302); 
        expect(res.headers.location).toBe('/admin/home'); 
    });
});

//test editing client profile
describe('Client Profile Update', () => {
    const agent = superT.agent(Url); 

    beforeAll(async () => {
        const clientUser = await User.findOne({username: 'testClient'});
        const res = await agent
            .post('/users/login')
            .send({username: 'testClient', password:'12345678'});

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
});
//test editing users & deleting
//test booking
//test API check-in