// @flow
import {observable, computed} from 'mobx'
import orderBy from 'lodash/orderBy'
import moment from 'moment'
import get from 'lodash/get'
import haversine from 'haversine'

import type PreferenceStore from './PreferenceStore'
import type UIState from './UIState'
import type {UserType, AreaType, FavoriteType, MenuType, RestaurantType} from './types'
import Resource from './Resource'

const STARRED = -1
const NEARBY = -2

const isOpenNow = (restaurant, day) => {
  const weekday = day.weekday()
  if (!restaurant.openingHours[weekday]) {
    return false
  }
  const [open, close] = restaurant.openingHours[weekday].split(' - ')
  const now = moment()
  return now.isAfter(moment(open, 'HH:mm')) && now.isBefore(moment(close, 'HH:mm'))
}

const orderRestaurants = (restaurants, orderType) => {
  const order = {
    properties: ['isStarred', 'isOpenNow', 'noCourses', 'favoriteCourses', 'distance'],
    orders: ['desc', 'desc', 'asc', 'desc', 'asc']
  }
  if (orderType === 'ORDER_ALPHABET') {
    order.properties = ['isStarred', 'name']
    order.orders = ['desc', 'asc']
  } else if (orderType === 'ORDER_DISTANCE') {
    order.properties = ['isStarred', 'distance']
    order.orders = ['desc', 'asc']
  }
  return orderBy(restaurants, order.properties, order.orders)
}

export default class DataStore {
  @observable areas: Resource<AreaType> = new Resource('areas')
  @observable user: Resource<UserType> = new Resource('user', true)
  @observable favorites: Resource<FavoriteType> = new Resource('favorites')
  @observable menus: Resource<MenuType> = new Resource('menus')
  @observable restaurants: Resource<RestaurantType> = new Resource('restaurants')

  preference: PreferenceStore
  uiState: UIState

  constructor(preference: PreferenceStore, uiState: UIState) {
    this.preference = preference
    this.uiState = uiState
  }

  @computed get selectedFavoriteIds(): Array<number> {
    if (this.favorites.fulfilled) {
      return this.favorites.data.filter(({id}) => this.preference.favorites.indexOf(id) > -1)
    }
    return []
  }

  @computed get selectedArea(): ?AreaType {
    return this.areas.data.find(a => a.id === this.preference.selectedArea)
  }

  @computed get favorites() {
    return orderBy(this.favorites.data, ['name']).map(favorite => ({
      ...favorite,
      isSelected: this.preference.favorites.indexOf(favorite.id) > -1
    }))
  }

  @computed get isLoggedIn(): boolean {
    return this.user.fulfilled
  }

  @computed get restaurants() {
    const day = moment().add(this.uiState.dayOffset, 'day')
    const formattedRestaurants = this.restaurants.data
    .map(restaurant => {
      let favoriteCourses = 0
      const courses = get(this.menus.data, [restaurant.id, day.format('YYYY-MM-DD')], [])
      .filter(course => course.title)
      .map(course => {
        const isFavorite = this.favorites.some(favorite => course.title.match(new RegExp(favorite.regexp, 'i')))
        if (isFavorite) {
          favoriteCourses++
        }
        return {
          ...course,
          isFavorite
        }
      })
      const distance = location && haversine(location, restaurant, {unit: 'meter'})
      return {
        ...restaurant,
        courses,
        distance,
        noCourses: !courses.length,
        favoriteCourses: favoriteCourses > 0,
        isOpenNow: isOpenNow(restaurant, day),
        isStarred: this.preference.starredRestaurants.includes(restaurant.id)
      }
    })
    .filter(restaurant => {
      if (this.preference.selectedArea === STARRED) {
        return restaurant.isStarred
      } else if (this.preference.selectedArea === NEARBY) {
        return restaurant.distance < 1500
      }
      const selectedArea = this.selectedArea
      return selectedArea && selectedArea.restaurants && selectedArea.restaurants.some(r => r.id === restaurant.id)
    })

    return orderRestaurants(formattedRestaurants, this.preference.order)
  }
 }