import React from 'react'
import PropTypes from 'prop-types'

import Field from '../../../Field'
import Button from '../../../Button'

import Style from './Header.module.css'

const Header = ({ well, clickDetails, showDetails }) => {
  const { primaryHeader } = well

  return <>
    <Field large
      valueEllipsis
      labelEmphasis
      valueEmphasis
      label={primaryHeader.label}
      value={primaryHeader.value} />
    <Button className={Style.Button} onClick={clickDetails}>
      {showDetails ? 'Overview' : 'Details'}
    </Button>
  </>
}

Header.propTypes = {
  well: PropTypes.object.isRequired,
  clickDetails: PropTypes.func.isRequired,
  showDetails: PropTypes.bool.isRequired
}

export default Header
