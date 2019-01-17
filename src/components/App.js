import React from 'react'
import PostsList from './PostsList'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.name = 'AdminPanel'
  }
  render () {
    return <div><PostsList/></div>
  }
}