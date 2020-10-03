const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  if(blogs.length === 0) {
    return 0
  }

  const likes = blogs.map(blog => blog.likes).reduce((a, b) => a + b)
  
  return likes
}

const favoriteBlog = blogs => {
  let mostLikes = 0
  let mostLiked
  
  blogs.forEach((blog, blogIndex) => {
    if (blog.likes > mostLikes) {
      mostLikes = blog.likes
      mostLiked = blogIndex
    }
  })

  return blogs[mostLiked]
}

const mostBlogs = blogs => {
  let authors = [];

  blogs.forEach(blog => {
    let authorIndex = authors.findIndex(element => element.author === blog.author)
    if(authorIndex === -1) {
      authors.push({
        author: blog.author,
        blogs: 1
      })
    } else {
      authors[authorIndex].blogs += 1
    }
  })

  let mostBlogs = 0
  let mostBlogged

  authors.forEach((author, authorIndex) => {
    if (author.blogs > mostBlogs) {
      mostBlogs = author.blogs
      mostBlogged = authorIndex
    }
  })

  return authors[mostBlogged]
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}