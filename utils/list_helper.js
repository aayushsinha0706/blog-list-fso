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

const mostBlogs = (blogs) => {
    const authors = {};
    for (const blog of blogs) {
      if (blog.author in authors) {
        authors[blog.author] += 1;
      } else {
        authors[blog.author] = 1;
      }
    }
    const maxAuthor = Object.keys(authors).length > 0 ? Object.keys(authors).reduce((max,author) => authors[author] > authors[max] ? author : max) : null
    const result = Object.keys(authors).length > 0 ? {author: maxAuthor, blogs: authors[maxAuthor]} : null
    return result
}

const mostLikes = (blogs) => {
    const authorLikes = {}
    for (let i = 0; i < blogs.length; i++) {
        const blog = blogs[i]

        if(authorLikes[blog.author]) {
            authorLikes[blog.author] += blog.likes;
        }
        else {
            authorLikes[blog.author] = blog.likes;
        }
    }

    let maxLikesAuthor = { author: '', likes: 0 }
    for (const author in authorLikes) {
        if (authorLikes[author] > maxLikesAuthor.likes) {
            maxLikesAuthor = { author, likes: authorLikes[author]}
        }
    }
    return maxLikesAuthor
}



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}