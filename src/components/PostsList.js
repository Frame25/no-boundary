import React from 'react'
import axios from 'axios'
import PostModal from './PostModal'

const postLimit = 950;

function easeScrollTo(to) {
  let curPos = window.scrollY
  let maxY = document.body.offsetHeight - window.screen.height
  if (to > maxY) to = maxY
  if (to < 0) to = 0
  if (window.easeScrollTo_Direction !== 'bottom') {
      if (curPos > to) {
          window.easeScrollTo_Direction = 'top'
          let delta = curPos - to
          if (delta > 5) {
              let target = curPos - delta * 0.2
              window.scrollTo(0, target)
              setTimeout(() => {
                  easeScrollTo(to)
              },10)
          } else {
              window.scrollTo(0, to)
              delete window.easeScrollTo_Direction
          }
      }
  }
  if (window.easeScrollTo_Direction !== 'top') {
      if (curPos < to) {
          window.easeScrollTo_Direction = 'bottom'
          let delta = to - curPos
          if (delta > 5) {
              let target = curPos + delta * 0.2
              window.scrollTo(0, target)
              setTimeout(() => {
                  easeScrollTo(to)
              },10)
          } else {
              window.scrollTo(0, to)
              delete window.easeScrollTo_Direction
          }
      }
  }
}

export default class PostsList extends React.Component {
  constructor (props) {
    super(props)
    this.name = 'PostsList'
    this.state = {
      loaded: false,
      posts: '',
      countries: '',
      modalIsOpen: false,
      selectedPost: ''
    }
    this.closeModal = this.closeModal.bind(this)
    this.updateCountries = this.updateCountries.bind(this)
    this.loadContent = this.loadContent.bind(this)
  }

  deletePost (id) {
    let postIndex = this.state.posts.findIndex(el => el.id === parseInt(id))
    let conf = confirm('Уверены, что хотите удалить пост навсегда?')
    if (conf) {
      axios.delete('/posts/' + id).then(res => {
        this.setState(oldState => {
          oldState.posts.splice(postIndex, 1)
          return {posts: oldState.posts}
        })
        // this.forceUpdate()
      }).catch(err => console.log(err))
    }    
  }

  updateCountries (countries) {
    this.setState({ countries: countries })
  }

  openModal (post = '') { this.setState({modalIsOpen: true, selectedPost: post}) }
  closeModal (silent = '') {
    let conf;
    if (silent === 's' || silent === 'silent' || silent === true) conf = true
    else conf = confirm('Уверены? Если закрыть окно, внесенные изменения не сохранятся!')

    if (conf) this.setState({modalIsOpen: false, selectedPost: ''}) 
  }

  loadContent () {
    axios.get('/posts').then(res => {
      this.setState({posts: res.data.posts, countries: res.data.countries, loaded: true})
      this.forceUpdate()
      // this.openModal()
    }).catch(err => {
      console.log(err)
      this.setState({posts: [], loaded: true})
    })
  }

  componentDidMount () {
    this.loadContent()
  }

  //TODO: добавить методы к кнопкам редактирования
  render () {
    return pug`
      div.container.main-container
        .btn-up(onClick=()=>easeScrollTo(0))
        h1 Админ панель для постов Алисы

        .main-btn.btn-add-post(onClick=this.openModal.bind(this)) Добавить новый пост
        if this.state.posts && this.state.posts.length
          h2 Список имеющихся сейчас постов:
          .posts-wrapper
            each post, index in this.state.posts
              .post-card(key='post' + index)
                h2.post__title
                  span.grey
                  span=post.title
                  //- span.btn-edit
                  small.post__letter-count(className=post.text.length > postLimit ? 'text-red' : '')=post.text.length
                h4.post__country=post.country_name
                  //- span.btn-edit
                p.post__tags 
                  strong Теги:
                  span=' ' + (post.tags || 'нету :(')
                  //- span.btn-edit
                .post__content
                  .post__img
                    img.img--max(src=post.image || 'http://placehold.it/200?text=No___image')
                  p.post__text=post.text
                .main-btn.btn-remove-post(onClick=this.deletePost.bind(this, post.id)) Удалить
                .main-btn.btn-edit-post(onClick=this.openModal.bind(this, post))
                  span.btn-edit.mr-2.ml-0
                  | Изменить
        if this.state.modalIsOpen
          PostModal(
            closeModal=this.closeModal 
            countries=this.state.countries 
            updateCountries=this.updateCountries
            post=this.state.selectedPost
            updatePosts=this.loadContent
          )
    `
  }
}