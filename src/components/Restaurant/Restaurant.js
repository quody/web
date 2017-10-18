// @flow
import React from 'react'
import {observer} from 'mobx-react'
import {withRouter} from 'react-router-dom'
import Walk from 'react-icons/lib/md/directions-walk'
import Bike from 'react-icons/lib/md/directions-bike'
import Location from 'react-icons/lib/io/pin'
import Star from 'react-icons/lib/md/star'
import More from 'react-icons/lib/md/more-vert'
import Flag from 'react-icons/lib/md/flag'
import c from 'classnames'
import {Link} from 'react-router-dom'
import moment from 'moment'

import Colon from '../Colon'
import CourseList from '../CourseList'
import {preferenceStore, uiState} from '../../store'
import Text from '../Text'
import css from './Restaurant.scss'

const Distance = ({distance}) => {
  const kilometers = distance > 1500
  return (
    <div className={css.meta + ' ' + css.location}>
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

@observer
export default withRouter(class Restaurant extends React.Component {
  toggleStar = () => {
    const {restaurant} = this.props
    preferenceStore.setRestaurantStarred(restaurant.id, !restaurant.isStarred)
  }
  render() {
    const {restaurant} = this.props
    const dayOfWeek = uiState.day.isoWeekday() - 1
    const isClosed = uiState.day.isSame(moment(), 'day') && !restaurant.isOpenNow
    const {search} = this.props.location
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
            {restaurant.openingHours[dayOfWeek] &&
              [<Colon key="colon">{restaurant.openingHours[dayOfWeek].replace('-', '–')}</Colon>, <br key="lineBreak" />]
            }
            {isClosed && <Text id="restaurantClosed" className={css.closedText} element="small" />}
          </div>
        </div>
        <CourseList className={css.body} courses={restaurant.courses} />
        <div className={css.restaurantActions}>
          <Link
            className={css.actionIcon}
            to={{pathname: `/report/${restaurant.id}`, search}}>
            <Flag size={18} />
          </Link>
          <div style={{marginLeft: 'auto'}}>
            <a
              onClick={this.toggleStar}
              style={{color: restaurant.isStarred ? '#FFA726' : undefined}}
              className={css.actionIcon}>
              <Star size={18} />
            </a>
            &nbsp;
            <Link
              className={css.actionIcon}
              to={{pathname: `/restaurant/${restaurant.id}`, search}}>
              <More size={18} />
            </Link>
          </div>
        </div>
      </div>
    )
  }
})
