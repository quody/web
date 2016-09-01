import React from 'react'
import {connect} from 'react-redux'

import PageContainer from './PageContainer'
import Text from './Text'

const Settings = ({preferences}) => (
  <PageContainer title={<Text id="settings" />}>
    <p>hello world</p>
  </PageContainer>
)

const mapState = state => ({
  preferences: state.preferences
})

export default connect(mapState)(Settings)
