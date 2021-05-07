// Query Park Inc. 2021

// This component handles searching

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FetchWithTimeout from '../../util/FetchWithTimeout'

// import AsyncSelect from 'react-select/async'
import { SearchOption, ChosenWell, WellsFound } from './components'
import ErrorDisplay from '../ErrorDisplay'
// import { MDBDataTable, MDBTableBody, MDBTableHead , NavLink } from 'mdbreact';
import Style from './index.module.css'
import { regionOptions } from '../../util/constants'
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
    this.state.inputValue = ''
    this.state.inputregionValue = []
    this.state.suggestedWells = []
    this.state.well = ''
    this.headers = createNewHeaders(props.API_KEY)
    this.onChange = this.onChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.getWells = this.getWells.bind(this)
    this.reset = this.reset.bind(this)
    this.chosenWellHeader = this.chosenWellHeader.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
    this.handleRegionChange = this.handleRegionChange.bind(this)
  }

  reset (region) {
    this.setState(DEFAULT_STATE)
    // this.setState({inputValue  : '' , suggestedWells   : []})

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

  handleInputChange (e) {
    e.preventDefault()
    e.stopPropagation()

    this.setState({ inputValue: e.target.value }, () => {
      this.setState({ suggestedWells: [] })
      this.getWells()
    })
    if (this.state.error) {
      this.setState({ error: null })
    }
  }

  handleClickDetails (chosenWell) {
    Object.assign(chosenWell, { 'search': this.state.inputValue })
    return () => {
      const showDetails = !this.state.showDetails
      this.setState({ showDetails })
      this.chosenWellHeader(chosenWell, showDetails)
    }
  }

  async getWells () {
    if (this.state.inputValue !== '' && this.state.inputValue !== null) {
      // console.log(this.state.inputregionValue)
      const query = `?query=${this.state.inputValue.replace(/[^A-Za-z0-9]/g, '')}`
      const region = `&region=${this.state.inputregionValue.join(',')}`
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
        this.setState({ suggestedWells: wells })

        //  this.props.updateFooter(<WellsFound json={json} />)
      } catch (error) {
        this.setState({ error })
      }
    }
  }

  showsuggestedwellsdivc () {
    return this.state.suggestedWells.map((well) => {
      return <SearchOption data={well} selectOption={this.onChange} />
    })
  }

  showsuggestedwellstable () {
    return this.state.suggestedWells.map((well) => {
      return (<SearchOption data={well} selectOption={this.onChange} />)
    })

    const namedivStyle = {
      fontSize: '20px',
      color: 'blue'
    }

    if (this.state.suggestedWells.length > 0) {
      const wellTable = {
        columns: [
          {
            label: 'Well Name',
            field: 'wellname'
          }/* ,
          {
            label : 'Operator',
            field : 'operator'
          },
          {
            label : 'Region',
            field : 'region'
          } */
        ],
        // rows : this.state.suggestedWells.map((w) => {return ({wellname : w.primaryHeader['value'] !== undefined? <div style = {namedivStyle} onClick = {() => this.onChange(w)}> {w.primaryHeader['value']} </div> : <div> {w.wellData.fieldname} </div>, operator :<div style = {namedivStyle} onClick = {() => this.onChange(w)}> {w.owner['value']} </div>,region:w.attributes.region})})
        rows: this.state.suggestedWells.map((w) => {
          Object.assign(w, { 'search': this.state.inputValue })
          return ({ wellname: <SearchOption data={w} selectOption={this.onChange} /> })
        })
      }
      return <MDBDataTable searching={false} data={wellTable} />
    }
  }

  onInputChange (val, action) {
    if (action.action === 'input-blur') {
      this.props.updateFooter(<p />)
    }
  }

  filterRegions (inputValue) {
    return regionOptions.filter(i => {
    //  console.log(i)
      i.label.includes(inputValue)
    })
  };

  loadOptions (inputValue, callback) {
    setTimeout(() => {
      callback(this.filterRegions(inputValue))
    }, 1000)
  };

  handleRegionChange (newValue) {
  //  console.log(newValue)
    let regionValue = []
    newValue.forEach(v => {
      regionValue.push(v.value.replace(/\W/g, ''))
    })
    this.setState({ inputregionValue: regionValue }, () => {
      this.setState({ suggestedWells: [] })
      this.getWells()
    })
  };

  render () {
    const { well, showDetails, error } = this.state

    if (well.uuid) {
      return showDetails
        ? <ChosenWell.Details well={Object.assign(well, { 'search': this.state.inputValue })} />
        : <ChosenWell well={Object.assign(well, { 'search': this.state.inputValue })} />
    } else {
      return <>
        {/* <AsyncSelect className={Style.SearchBar}
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
                  filterOption={null} /> */}
        <div className={Style.SearchBar}>
          {/* <AsyncSelect className={Style.SearchBar}
              isMulti
              placeholder = "Select Region(s)"
              defaultOptions={regionOptions}
              loadOptions = {this.loadOptions}
              onChange = {this.handleRegionChange} /> */}
          <input type='text' autoFocus onFocus={e => e.currentTarget.select()} placeholder='Search...' className={Style.ip2} name='search' id='search' value={this.state.inputValue} onChange={this.handleInputChange} />
        </div>
        <br />
        <br />
        <br />
        {this.showsuggestedwellstable()}
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
  timeout: 5000
}

export default SearchBar
