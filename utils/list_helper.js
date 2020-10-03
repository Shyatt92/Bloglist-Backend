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


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}