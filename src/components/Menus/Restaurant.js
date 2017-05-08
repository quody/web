// @flow
import React from 'react'
import {observer} from 'mobx-react'
import Walk from 'react-icons/lib/md/directions-walk'
import Bike from 'react-icons/lib/md/directions-bike'
import Heart from 'react-icons/lib/io/heart'
import Location from 'react-icons/lib/io/pin'
import c from 'classnames'
import {Link} from 'react-router-dom'
import moment from 'moment'
import times from 'lodash/times'
import random from 'lodash/random'

import {preferenceStore} from '../../store'
import Text from '../Text'
import css from '../../styles/Restaurant.scss'

const Distance = ({distance}) => {
  const kilometers = distance > 1500
  return (
    <div className={css.meta}>
      {!distance ? <Location className="inline-icon" />
      : kilometers
      ? <Bike className="inline-icon" />
      : <Walk className="inline-icon" />}
      {!distance ? <Text id="locating" />
      : kilometers
      ? parseFloat(distance / 1000).toFixed(1)
      : Math.round(distance)}
      &nbsp;
      {distance && <Text id={kilometers ? 'kilometers' : 'meters'} />}
    </div>
  )
}

export class Placeholder extends React.Component {
  shouldComponentUpdate() {
    return false
  }
  render() {
    return (
      <div className={css.container + ' ' + css.placeholder}>
        <div className={css.header} style={{width: random(30, 70) + '%'}}></div>
        <div className={css.body}>
          {times(10, i => <div key={i} className={css.course} style={{width: random(40, 100) + '%'}}></div>)}
        </div>
      </div>
    )
  }
}

@observer
export default class Restaurant extends React.PureComponent {
  toggleStar = () => {
    const {restaurant} = this.props
    preferenceStore.setRestaurantStarred(restaurant.id, !restaurant.isStarred)
  }
  render() {
    const {restaurant, dayOffset} = this.props
    const dayOfWeek = moment().add(dayOffset, 'day').locale('fi').weekday()
    const isClosed = dayOffset === 0 && !restaurant.isOpenNow
    return (
      <div className={c(css.container, {
        [css.empty]: restaurant.noCourses,
        [css.shut]: isClosed
      })}>
        <div className={css.header}>
          <h2>
            {restaurant.name}
            {preferenceStore.useLocation &&
            <Distance distance={restaurant.distance} />
            }
          </h2>
          <div className={css.meta} style={{textAlign: 'right'}}>
            {restaurant.openingHours[dayOfWeek] && restaurant.openingHours[dayOfWeek].replace('-', '–')}
            {isClosed && <Text id="restaurantClosed" style={{display: 'block'}} element="small" />}
          </div>
        </div>
        <div className={css.body}>
          {restaurant.noCourses ?
            <Text id="noMenu" element="span" className={css.emptyText} />
            : restaurant.courses.map((course, i) => 
            <div
              className={c(css.course, course.isFavorite && css.favoriteCourse)}
              key={i}>
              {course.isFavorite && <Heart className={`inline-icon ${css.icon}`} />}
              <span className={css.title}>{course.title}</span>
              <span className={css.props}>{course.properties.join(' ')}</span>
            </div>
          )}
        </div>
        <div className={css.restaurantActions}>
          <a
            onClick={this.toggleStar}
            style={{color: restaurant.isStarred ? '#e6c100' : undefined}}
            className={css.actionIcon}>
            <Text id={restaurant.isStarred ? 'removeStar' : 'addStar'} />
          </a>
          &nbsp;
          <Link className={css.actionIcon} to={`/restaurant/${restaurant.id}`}>
            <Text id="moreInfo" />
          </Link>
        </div>
      </div>
    )
  }
}
