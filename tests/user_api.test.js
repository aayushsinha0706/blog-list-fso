const { test, beforeEach, describe, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')


const app = require('../app')
const api = supertest(app)

const User = require('../models/user')


describe('invalid users are not created and added', () => {
    beforeEach( async () => {
        await User.deleteMany({})
        const testPassword = 'testPassword'
        const passwordHash = await bcrypt.hash(testPassword, 10)
        const user = new User({ username: 'testuser', name: 'Test User', passwordHash })
        await user.save()
    })    

    test('fails with status code 400 if username doest not exist', async () => {
        const usersAtStart = await helper.usersInDb()

        const invalidUser = {
            name: 'invalid user',
            password: 'testpassword'
        }

        const result = await api
         .post('/api/users')
         .send(invalidUser)
         .expect(400)
        
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        assert(result.body.error.includes('Username and password are required'))
    })

    test('fails with statuscode 400 if password is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const invalidUser = {
            username: 'invalidUser2',
            name: 'Invalid User 2',
            password: 'sp'
        }

        const result = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
        
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        assert(result.body.error.includes('Username and password must be at least 3 characters long'))


    })

    test('creation fails with proper statuscode and message if username is not unique', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'testuser',
            name: 'New User',
            password: 'testPassword'
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
        
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        assert(result.body.error.includes('expected `username` to be unique'))
    })


})

after(async () => {
    await mongoose.connection.close()
  })