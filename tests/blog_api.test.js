const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')

const mongoose = require('mongoose')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach( async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test(' all notes are returned as JSON', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('test that identifier property of the blog posts is named id and not _id', async () => {
    const mockData = helper.initialBlogs[0]
    const formattedBlog = helper.createMockBlogAndFormat(mockData)
    assert.ok(formattedBlog.id)
    assert.strictEqual(typeof formattedBlog.id, 'string')
    assert.strictEqual(formattedBlog._id, undefined) 
})

after( async () => {
    await mongoose.connection.close()
})
