import { Feed } from 'feed'
import moment from 'moment'

export default function generateFeed (posts) {
  const feed = new Feed({
    title: "Feed Title",
    description: "This is my personal feed!",
    id: "http://example.com/",
    link: "http://example.com/",
    language: "cs", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: "http://example.com/image.png",
    favicon: "http://example.com/favicon.ico",
    copyright: "All rights reserved 2013, John Doe",
    feedLinks: {
      json: "https://example.com/json",
      atom: "https://example.com/atom"
    },
    author: {
      name: "John Doe",
      email: "johndoe@example.com",
      link: "https://example.com/johndoe"
    }
  })

  posts.forEach(post => {
    feed.addItem({
      title: post.title,
      id: post.url,
      link: post.url,
      description: post.description,
      content: post.content,
      author: [
        {
          name: "Jane Doe",
          email: "janedoe@example.com",
          link: "https://example.com/janedoe"
        }
      ],
      published: moment(post.published).toDate(),
      image: post.image
    })
  })
  return feed
}