// Query Park Inc. 2018

// This component handles searching

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FetchWithTimeout from '../../util/FetchWithTimeout'

import AsyncSelect from 'react-select/lib/Async'
import { SearchOption, ChosenWell, WellsFound } from './components'
import ErrorDisplay from '../ErrorDisplay'

import Style from './index.module.css'

const { Headers } = window
const fetch = FetchWithTimeout(window.fetch)

const QP_URL_ROOT = 'https://api.querypark.com/v1/'

const createNewHeaders = (apiKey) => new Headers({
  'Content-Type': 'application/json',
  'x-api-key': apiKey
})

const DEFAULT_STATE = {
  well: {},
  showDetails: false,
  error: null
}

class SearchBar extends Component {
  constructor (props) {
    super(props)

    this.state = Object.assign({}, DEFAULT_STATE)

    this.headers = createNewHeaders(props.API_KEY)
    this.onChange = this.onChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.getWells = this.getWells.bind(this)
    this.reset = this.reset.bind(this)
    this.chosenWellHeader = this.chosenWellHeader.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
  }

  reset () {
    this.setState(DEFAULT_STATE)
    this.props.updateHeader(<h1>Well Search</h1>)
    this.props.updateFooter(<p />)
  }

  chosenWellHeader (chosenWell, showDetails = false) {
    this.props.updateHeader(<ChosenWell.Header well={chosenWell}
      clickDetails={this.handleClickDetails(chosenWell)}
      showDetails={showDetails}
    />)
  }

  onChange (chosenWell) {
    this.chosenWellHeader(chosenWell)
    this.props.updateFooter(<ChosenWell.Footer reset={this.reset} />)

    this.setState({ well: chosenWell })

    if (typeof this.props.onWellSelect === 'function') {
      this.props.onWellSelect(chosenWell)
    }
  }

  handleInputChange (_val, action) {
    if (this.state.error) {
      this.setState({ error: null })
    }

    if (action.action === 'input-blur') {
      this.props.updateFooter(<p />)
    }
  }

  handleClickDetails (chosenWell) {
    return () => {
      const showDetails = !this.state.showDetails
      this.setState({ showDetails })
      this.chosenWellHeader(chosenWell, showDetails)
    }
  }

  async getWells (input) {
    const query = `?query=${input.replace(/[^A-Za-z0-9]/g, '')}`
    const url = QP_URL_ROOT + 'suggest' + query

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      }, this.props.timeout)

      const json = await response.json()

      if (!json.ok) {
        throw new Error(json.message)
      }

      const wells = json.payload.wells
      this.props.updateFooter(<WellsFound json={json} />)
      return wells
    } catch (error) {
      this.setState({ error })
      return []
    }
  }

  onInputChange (val, action) {
    if (action.action === 'input-blur') {
      this.props.updateFooter(<p />)
    }
  }

  render () {
    const { well, showDetails, error } = this.state

    if (well.uuid) {
      return showDetails
        ? <ChosenWell.Details well={well} />
        : <ChosenWell well={well} />
    } else {
      return <>
        <AsyncSelect className={Style.SearchBar}
          components={{ Option: SearchOption }}
          styles={{ menu: (_base, _style) => ({ margin: '5px 0 0' }) }}
          backspaceRemovesValue={false}
          onInputChange={this.handleInputChange}
          getOptionLabel={(option) => option.primaryHeader.value}
          getOptionValue={(option) => option.uuid}
          cacheOptions={!error}
          loadOptions={this.getWells}
          onChange={this.onChange}
          // remove filtering (this is already done by the api)
          filterOption={null} />
        {
          error &&
          <ErrorDisplay error={error} />
        }
      </>
    }
  }
}

SearchBar.propTypes = {
  API_KEY: PropTypes.string.isRequired,
  onWellSelect: PropTypes.func,
  timeout: PropTypes.number,

  updateHeader: PropTypes.func.isRequired,
  updateFooter: PropTypes.func.isRequired
}

SearchBar.defaultProps = {
  timeout: 2500
}

export default SearchBar
