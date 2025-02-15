const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach( async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash(helper.testUser.password, 10)
    const user = new User({ username: helper.testUser.username, name: helper.testUser.name, passwordHash })
    await user.save()


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

test('a valid blog post can be added', async () => {
    const newBlog = {
        title: 'New blog post',
        url: 'https://newblog.com',
        likes: 5
    }

    const response = await api
        .post('/api/login')
        .send({ username: helper.testUser.username, password: helper.testUser.password })
        .expect(200)
    
    const token = response.body.token

    await api
       .post('/api/blogs')
       .set('Authorization', `Bearer ${token}`)
       .send(newBlog)
       .expect(201)
       .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(blog =>  blog.title)
    assert(contents.includes('New blog post'))
})


test('adding a blog fails with the proper status code 401 Unauthorized if a token is not provided', async () => {
    const newBlog = {
        title: 'New blog post',
        url: 'https://newblog.com',
        likes: 5
    }
    
    const token = null

    await api
       .post('/api/blogs')
       .set('Authorization', `Bearer ${token}`)
       .send(newBlog)
       .expect(401)
})

test('test defualts like value when missing in request', async () => {
    const newBlog = {
        title: 'New Blog post without likes',
        url: 'https://newblog.com'
    }

    const response = await api
        .post('/api/login')
        .send({ username: helper.testUser.username, password: helper.testUser.password })
        .expect(200)
    
    const token = response.body.token

    await api
       .post('/api/blogs')
       .set('Authorization', `Bearer ${token}`)
       .send(newBlog)
       .expect(201)
       .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb() 
    const TitleAndLikes = blogsAtEnd.map(blog =>  ({title: blog.title,likes: blog.likes}))
    assert(TitleAndLikes.find(blog => blog.title==='New Blog post without likes' && blog.likes===0))
})

test('test create blog missing title or url returns 400', async () => {
    const newBlog = {
        author: 'New author'
    }

    const response = await api
        .post('/api/login')
        .send({ username: helper.testUser.username, password: helper.testUser.password })
        .expect(200)
    
    const token = response.body.token


    await api
       .post('/api/blogs')
       .set('Authorization', `Bearer ${token}`)
       .send(newBlog)
       .expect(400)
})

test('deletion of a note', async () => {
    const username = helper.testUser.username
    const password = helper.testUser.password

    const loginResponse = await api
        .post('/api/login')
        .send({ username, password })
        .expect(200)
    
    token = loginResponse.body.token

    const newBlog = {
        title: 'New blog post',
        url: 'https://newblog.com',
        likes: 5
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

    const usersResponse = await api
        .get('/api/users')
        .expect(200)

    const blogToDelete = usersResponse.body[0]["blogs"][0]
    
    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${ token }`)
        .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

    const titles = blogsAtEnd.map(blog => blog.title)
    assert(!titles.includes(blogToDelete.title))
})

test('updating a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlogData = {
        likes: 50
    }

    await api
     .put(`/api/blogs/${blogToUpdate.id}`)
     .send(updatedBlogData)
     .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd[0]
    assert.strictEqual(updatedBlog.likes, 50)
})


after(async () => {
    await mongoose.connection.close()
  })