import React from 'react'
import {bindActionCreators} from 'redux'
import {Provider} from 'react-redux'
import page from 'page';

import '../styles/main.scss'

import store from '../store'
import {setView} from '../store/actions/values';

import App from './App'
import Restaurants from './Restaurants'
import PrivacyPolicy from './PrivacyPolicy'
import Contact from './Contact'
import NotFound from './NotFound'

const routes = {
  '/': Restaurants,
  '/privacy-policy': PrivacyPolicy,
  '/contact': Contact,
  '*': NotFound
}

Object.keys(routes).forEach(path => {
  page(path, () => {
    if (window.ga) {
      window.ga('send', 'pageview', path)
    }
    const route = {
      path,
      view: React.createElement(routes[path])
    }
    store.dispatch(setView(route))
  })
})
page()

export default function() {
   return (
      <Provider store={store}>
         <App />
      </Provider>
   )
}
