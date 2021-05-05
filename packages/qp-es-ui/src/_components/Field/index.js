// Query Park Inc. 2018

// This component renders a field with a stylized label

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Style from './index.module.css'

const Field = ({
  className,
  large,
  valueEmphasis,
  labelEllipsis,
  labelEmphasis,
  valueEllipsis,
  label,
  value
}) => {
  const ContainerStyle = classNames({
    [Style.Container]: labelEllipsis || valueEllipsis
  }, className)
  const LabelStyle = classNames({
    [Style.LabelLarge]: large,
    [Style.LabelSmall]: !large,
    [Style.Emphasis]: labelEmphasis,
    [Style.Ellipsis]: labelEllipsis
  })
  const ValueStyle = classNames({
    [Style.ValueLarge]: large,
    [Style.ValueSmall]: !large,
    [Style.Emphasis]: valueEmphasis,
    [Style.Ellipsis]: valueEllipsis
  })
  return (
    <div className={ContainerStyle}>
      <h2 className={LabelStyle}>{ label }</h2>
      <p className={ValueStyle}>{ value }</p>
    </div>
  )
}

Field.propTypes = {
  className: PropTypes.string,
  large: PropTypes.bool,
  valueEmphasis: PropTypes.bool,
  valueEllipsis: PropTypes.bool,
  labelEmphasis: PropTypes.bool,
  labelEllipsis: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.string
}

Field.defaultProps = {
  value: 'None'
}

export default Field
