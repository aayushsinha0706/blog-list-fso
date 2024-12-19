const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    const result = blogs.reduce((favourite, blog) => (blog.likes > favourite.likes ? blog : favourite ),blogs[0])
    return result ? {title: result.title, author: result.author, likes: result.likes} : null
}



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}