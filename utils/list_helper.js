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


module.exports = {
  dummy,
  totalLikes
}