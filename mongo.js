const mongoose = require('mongoose')
const config = require('./utils/config')

const url = config.MONGODB_URI
mongoose.set('strictQuery', true)

const connectToDb = async () => {
    await mongoose.connect(url)
}


const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
})

const Blog = mongoose.model('Blog',blogSchema)

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
      },
      {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5
      }
]

const setInitialBlogs = async () => {
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

}

const getBlogs = async () => {
    const blogs = await Blog.find({})
    blogs.forEach(blog => console.log(blog))
}

const main = async () => {
    await connectToDb()
    await setInitialBlogs()
    await getBlogs()
    await mongoose.connection.close()
}

main()