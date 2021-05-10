import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'

class CustomDialog extends Component {
  render () {
    return (
      <Dialog open={this.props.open}>
        <DialogContent>
          {this.props.content}
        </DialogContent>
        <DialogActions>
          {this.props.action}
        </DialogActions>
      </Dialog>
    )
  }
}
CustomDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  content: PropTypes.string,
  action: PropTypes.object
}
export default CustomDialog
