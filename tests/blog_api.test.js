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

test('a valid blog post can be added', async () => {
    const newBlog = {
        title: 'New blog post',
        author: 'New author',
        url: 'https://newblog.com',
        likes: 5
    }

    await api
       .post('/api/blogs')
       .send(newBlog)
       .expect(201)
       .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(blog =>  blog.title)
    assert(contents.includes('New blog post'))
})

test('test defualts like value when missing in request', async () => {
    const newBlog = {
        title: 'New Blog post without likes',
        author: 'New author',
        url: 'https://newblog.com'
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
    
    const blogsAtEnd = await helper.blogsInDb() 
    const TitleAndLikes = blogsAtEnd.map(blog =>  ({title: blog.title,likes: blog.likes}))
    assert(TitleAndLikes.find(blog => blog.title==='New Blog post without likes' && blog.likes===0))
})

test('test create blog missing title or url returns 400', async () => {
    const newBlog = {
        author: 'New author'
    }

    await api
       .post('/api/blogs')
       .send(newBlog)
       .expect(400)
})

test('deletion of a note', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    assert(!titles.includes(blogToDelete.title))
})
after( async () => {
    await mongoose.connection.close()
})
