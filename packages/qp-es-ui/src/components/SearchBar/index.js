// Query Park Inc. 2021

// This component handles searching

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FetchWithTimeout from '../../util/FetchWithTimeout'
import convertToCSV from '../../util/convertTocsv'
import dataToExcel from '../../util/exportToExcel'
import Pagination from '../Paginations'
// import AsyncSelect from 'react-select/async'
import { SearchOption, ChosenWell, WellsFound } from './components'
import ErrorDisplay from '../ErrorDisplay'
import CustomDialog from '../Dialog/Dialog'
import Style from './index.module.css'
import { regionOptions } from '../../util/constants'
import parse from '../../util/parse'
import ReactTable from 'react-table-v6'
// import "react-table/react-table.css";

const { Headers } = window
const fetch = FetchWithTimeout(window.fetch)

const QP_URL_ROOT = 'https://api.querypark.com/v1/'

const createNewHeaders = (apiKey) => new Headers({
  'Content-Type': 'application/json',
  'x-api-key': apiKey
})

const DEFAULT_STATE = {
  well: {},
  showDetails: true,
  error: null,
  confirmationModal: false,
  confirmationMessage: 'File created.'
}

function groupBy (list, keyGetter) {
  const map = new Map()
  list.forEach((item) => {
    const key1 = keyGetter(item)

    let key = keyGetter(item)

    const collection = map.get(key)

    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })

  return map
}
class SearchBar extends Component {
  constructor (props) {
    super(props)
    // this.state.confirmationModal = false
    // this.state.confirmationMessage = 'File created.'
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

  handleConfirmationOk () {
    this.setState({ confirmationModal: !this.state.confirmationModal })
  }

  reset (region) {
    this.setState(DEFAULT_STATE)
    // this.setState({inputValue  : '' , suggestedWells   : []})

    this.props.updateHeader(<h1>Well Search</h1>)
    this.props.updateFooter(<p />)
  }

  chosenWellHeader (chosenWell, showDetails = true) {
    this.props.updateHeader(<ChosenWell.Header well={chosenWell}
      clickDetails={() => this.handleClickDetails(chosenWell)}
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

  async handleClickDetails (chosenWell) {
    Object.assign(chosenWell, { 'search': this.state.inputValue })
    console.log(chosenWell)
    let parsedJson = await parse(chosenWell)
    console.log(parsedJson)
    let parsedObject = [{ key: chosenWell.wellData.Region, value: parsedJson }]
    let fileCreated = await dataToExcel(parsedObject)
    if (fileCreated) {
      this.setState({ confirmationModal: !this.state.confirmationModal })
    }
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

  async exportExcel (e) {
    e.preventDefault()
    //  console.log(this.state.suggestedWells[3])
    let jsonObject = this.state.suggestedWells
    // console.log(jsonObject[0])
    let groupedObject = groupBy(jsonObject, jsonObject => jsonObject.wellData.Region)
    // console.log(groupedObject)

    let parsedObject = []
    for (let [k, value] of groupedObject.entries()) {
      // console.log(k,value.length,value[0])
      let parsedJson = await parse(value)
      parsedObject.push({ key: k, value: parsedJson })
    }
    console.log(parsedObject)
    /* for(let p=0; p<parsedObject.length; p++) {
      console.log(parsedObject)
      for (let k in parsedObject[0].value[1]) {
        console.log(parsedObject[0].value[1][k])
      }
    } */
    let fileCreated = await dataToExcel(parsedObject)
    if (fileCreated) {
      this.setState({ confirmationModal: !this.state.confirmationModal })
    }
  }
  /* showsuggestedwellsdivc(){
    const data = this.state.suggestedWells.map((well) => {
      return ({wellname : <SearchOption data = {well} selectOption = {this.onChange}/>})
    })
    const columns = [{
      Header : 'Wellname',
      accessor : 'wellname'
    }]
    return <Table columns = {columns} data = {data} />
  } */

  showsuggestedwellstable () {
    console.log(this.state.suggestedWells)
    if (this.state.suggestedWells.length > 0) {
      const data = this.state.suggestedWells.map((well) => {
        Object.assign(well, { 'search': this.state.inputValue })
        return ({ wellname: <SearchOption data={well} selectOption={this.onChange} /> })
      })
      const columns = [{
        Header: '',
        accessor: 'wellname',
        minWidth: 500
      }]
      return (<><div className={Style.SearchOption} style={{ width: '100px', align: 'right' }}><button style={{ backgroundColor: 'lightblue' }} onClick={this.exportExcel.bind(this)}>Export</button></div><div className={Style.SearchOption}>  <ReactTable loadingText={' '} columns={columns} data={data} /> </div></>)
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
        ? <> <ChosenWell.Details well={Object.assign(well, { 'search': this.state.inputValue })} />
          <CustomDialog
            open={this.state.confirmationModal}
            content={this.state.confirmationMessage}
            action={<button variant='outlined' color='primary' onClick={this.handleConfirmationOk.bind(this)}> Ok </button>}
          />
        </>
        : <> <ChosenWell well={Object.assign(well, { 'search': this.state.inputValue })} />
          <CustomDialog
            open={this.state.confirmationModal}
            content={this.state.confirmationMessage}
            action={<button variant='outlined' color='primary' onClick={this.handleConfirmationOk.bind(this)}> Ok </button>}
          />
        </>
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
        <CustomDialog
          open={this.state.confirmationModal}
          content={this.state.confirmationMessage}
          action={<button variant='outlined' color='primary' onClick={this.handleConfirmationOk.bind(this)}> Ok </button>}
				  />
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
