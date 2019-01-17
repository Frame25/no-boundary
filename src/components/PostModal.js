import React from 'react'
import axios from 'axios'

const postLimit = 950;

function countryFind (countries = [], country = '') {
  return countries.find(el => {
    if (el.name.slice(-2) === 'ия') {
      el.name_dp = el.name.slice(0, -2) + 'ию';
      if (el.name_dp.toString().toLowerCase() === country.toString().toLowerCase()) return true;
    }
    return el.id.toString() === country.toString() || el.name.toString().toLowerCase() === country.toString().toLowerCase() || el.name_rp.toString().toLowerCase() === country.toString().toLowerCase() || el.alias.toString().toLowerCase() === country.toString().toLowerCase();
  });
}

export default class AddPostModal extends React.Component {
  constructor (props) {
    super(props)
    this.name = 'AddPostModal'
    // STATE
    this.state = {
      postTitle: '',
      postText: '',
      postTTS: '',
      postCountry: 0,
      postImage: '',
      postTags: '',
      postLength: 0,
      postTTSLength: 0,
      tooLong: false,
      tooLongTTS: false,
      countryIsOpen: false,
      countryName: '',
      countryNameRp: '',
      countryAlias: '',
      isError: false,
      errorMessage: '',
      countryExist: false,
    }

    // BINDINGS
    this.inputPostTitle = this.inputPostTitle.bind(this)
    this.inputPostText = this.inputPostText.bind(this)
    this.inputPostTTS = this.inputPostTTS.bind(this)
    this.inputPostTags = this.inputPostTags.bind(this)
    this.inputPostCountry = this.inputPostCountry.bind(this)
    this.inputPostImage = this.inputPostImage.bind(this)
    this.checkCountry = this.checkCountry.bind(this)
    this.inputCountryName = this.inputCountryName.bind(this)
    this.inputCountryNameRp = this.inputCountryNameRp.bind(this)
    this.inputCountryAlias = this.inputCountryAlias.bind(this)
    this.openCountryAdd = this.openCountryAdd.bind(this)
    this.closeCountryAdd = this.closeCountryAdd.bind(this)
    this.addPost = this.addPost.bind(this)
    this.addCountry = this.addCountry.bind(this)
    this.removeCountryBlockError = this.removeCountryBlockError.bind(this)

    // REFS
    this.titleBlock = React.createRef()
    this.textBlock = React.createRef()
    this.countryBlock = React.createRef()
    this.countryNameBlock = React.createRef()
    this.countryNameRpBlock = React.createRef()
    this.countryAliasBlock = React.createRef()

  }

  addPost () {
    if (this.state.postTitle && this.state.postText && this.state.postCountry && !this.state.tooLong && !this.state.tooLongTTS) {
      if (this.props.post && this.props.post.id) {
        let postData = {update: true, post: {id: this.props.post.id, title: this.state.postTitle, text: this.state.postText, tts: this.state.postTTS, image: this.state.postImage, tags: this.state.postTags, country: this.state.postCountry}};
        // console.log(postData, countryFind(this.props.countries, postData.post.country));
        axios.post('/posts', postData)
        .then(res => {this.props.updatePosts(); this.props.closeModal('s');})
      } else {
        axios.post('/posts', {title: this.state.postTitle, text: this.state.postText, tts: this.state.postTTS, image: this.state.postImage, tags: this.state.postTags, country: this.state.postCountry})
        .then(res => {this.props.updatePosts(); this.props.closeModal('s');})
      }
    } else {
      if (!this.state.postTitle) {this.titleBlock.current.classList.add('error')}
      if (!this.state.postText || this.state.tooLong) {this.textBlock.current.classList.add('error')}
      if (!this.state.postCountry) {this.countryBlock.current.classList.add('error')}
    }
  }

  addCountry () {
    if (this.state.countryName && this.state.countryNameRp && this.state.countryAlias) {
      let nc = {name: this.state.countryName, name_rp: this.state.countryNameRp, alias: this.state.countryAlias}
      axios.post('/countries', nc).then(res => {
        axios.get('/countries').then(r=>{
          this.props.updateCountries(r.data.countries)
          this.closeCountryAdd()
          this.setState({ countryName: '', countryNameRp: '', countryAlias: '' })
        }).catch(e=>console.log(e))
      }).catch(err => console.log(err))
    } else {
      if (!this.state.countryName) {this.countryNameBlock.current.classList.add('error')}
      if (!this.state.countryNameRp) {this.countryNameRpBlock.current.classList.add('error')}
      if (!this.state.countryAlias) {this.countryAliasBlock.current.classList.add('error')}
    }
  }

  inputPostTitle (e) {
    e = e || window.event
    this.setState({postTitle: e.target.value})
    if (this.titleBlock.current.classList.contains('error')) this.titleBlock.current.classList.remove('error')
  }

  inputPostText (e) {
    e = e || window.event
    this.setState({postText: e.target.value, postLength: e.target.value.length, tooLong: e.target.value.length > postLimit})
    if (this.textBlock.current.classList.contains('error')) this.textBlock.current.classList.remove('error')
  }

  inputPostTTS (e) {
    e = e || window.event
    this.setState({postTTS: e.target.value, postTTSLength: e.target.value.length, tooLongTTS: e.target.value.length > postLimit})
  }

  inputPostTags (e) {
    e = e || window.event
    this.setState({postTags: e.target.value})
  }
  
  inputPostImage (e) {
    e = e || window.event
    this.setState({postImage: e.target.value})
  }

  inputPostCountry (e) {
    e = e || window.event
    this.checkCountry(e.target.value)
    this.setState({postCountry: e.target.value})
    this.removeCountryBlockError()
  }

  removeCountryBlockError () {
    if (this.countryBlock.current.classList.contains('error')) this.countryBlock.current.classList.remove('error')
  }
  
  inputCountryName (e) {
    e = e || window.event
    this.setState({countryName: e.target.value})
    if (this.countryNameBlock.current.classList.contains('error')) this.countryNameBlock.current.classList.remove('error')
  }
  
  inputCountryNameRp (e) {
    e = e || window.event
    this.setState({countryNameRp: e.target.value})
    if (this.countryNameRpBlock.current.classList.contains('error')) this.countryNameRpBlock.current.classList.remove('error')
  }
  
  inputCountryAlias (e) {
    e = e || window.event
    this.setState({countryAlias: e.target.value})
    setTimeout(() => {
      if (this.countryAliasBlock.current.classList.contains('error')) this.countryAliasBlock.current.classList.remove('error')
    }, 10)
  }

  checkCountry (txt) {
    let foundCountry = countryFind(this.props.countries, txt)
    this.setState({countryExist: !!foundCountry})
  }

  openCountryAdd () { this.setState({countryIsOpen: true}) }
  closeCountryAdd () { this.setState({countryIsOpen: false}) }

  componentDidMount () {
    if (!this.props.countries.length) {
      alert('Произошла ошибка при загрузке данных. Страница будет перезагружена.')
      location.reload()
    }
    if (this.props.post && this.props.post.id) {
      // console.log(this.props.post)
      this.setState({
        postTitle: this.props.post.title,
        postText: this.props.post.text,
        postTTS: this.props.post.tts,
        postTags: this.props.post.tags,
        postImage: this.props.post.image,
        postCountry: this.props.post.country,
        postLength: this.props.post.text.length,
        postTTSLength: this.props.post.tts.length,
        countryExist: true,
        tooLong: this.props.post.text.length > postLimit,
        tooLongTTS: this.props.post.tts.length > postLimit
      })
    }
  }

  render () {
    return pug`
      .post-modal
        .modal__overlay(onClick=this.props.closeModal)
        .modal__content
          .btn-close(onClick=this.props.closeModal)
          h2.modal__title Добавление нового поста
          .add-form
            .title-block(ref=this.titleBlock)
              p Название поста
              input(className="post__input", type="text", placeholder="Название поста", value=this.state.postTitle, onChange=this.inputPostTitle)
            .country-block(ref=this.countryBlock)
              p Страна
              select(className="post__select", value=this.state.postCountry, onChange=this.inputPostCountry)
                each country, index in this.props.countries
                  option(value=country.id, key='opt' + index)=country.name
              .check-icon(className=this.state.countryExist ? 'ok' : '')
              .main-btn.btn-add-country(onClick=this.openCountryAdd) Добавить новую страну
              if this.state.countryIsOpen
                .country-block__add
                  .btn-close(onClick=this.closeCountryAdd)
                  .country-name-block(ref=this.countryNameBlock)
                    p Название страны
                    input(className="country__input", type="text", placeholder="Название страны", value=this.state.countryName, onChange=this.inputCountryName)
                  .country-namerp-block(ref=this.countryNameRpBlock)
                    p Название страны в предложном падеже, типа о "Китае / России"
                    input(className="country__input", type="text", placeholder="Название страны в родительном падеже", value=this.state.countryNameRp, onChange=this.inputCountryNameRp)
                  .country-alias-block(ref=this.countryAliasBlock)
                    p Название страны на английском с маленькой буквы
                    input(className="country__input", type="text", placeholder="Название страны на английском", value=this.state.countryAlias, onChange=this.inputCountryAlias)
                  .main-btn.btn-country-save(onClick=this.addCountry) Сохранить
            .tags-block
              p Теги через запятую
              input(className="post__input", type="text", placeholder="Теги через запятую", value=this.state.postTags, onChange=this.inputPostTags)
            .image-block
              p Ссылка на изображение
              input(className="post__input", type="text", placeholder="Ссылка на изображение", value=this.state.postImage, onChange=this.inputPostImage)
            .text-block(ref=this.textBlock, autocomplete="on")
              p Текст поста без всяких смайлов
              p Длина (
                span(className=this.state.tooLong ? 'text-red' : 'text-green')=this.state.postLength
                |  / #{postLimit}) символов
              textarea(className="post__textarea", type="text", placeholder="Текст поста без всяких смайлов", value=this.state.postText, onChange=this.inputPostText, rows="10")
            .text-block
              p Текст для преобразования в голос
              p знак "+" - ударение, " - " и "." - пауза.
              p Длина (
                span(className=this.state.tooLongTTS ? 'text-red' : 'text-green')=this.state.postTTSLength
                |  / #{postLimit}) символов
              textarea(className="post__textarea", type="text", placeholder="Текст для преобразования в голос", value=this.state.postTTS, onChange=this.inputPostTTS, rows="10")
          .main-btn.btn-save-post(onClick=this.addPost) Сохранить пост
    `
  }
}