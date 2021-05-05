
/*
    parse the source data to create json array
    create header for the excel file
*/
const parse = async(source) => {   
    let keys = []
    let welldata = []
    
    let headerKeys = {'uuid' : 'uuid','WellId' : 'WellId','UWI / API' : 'UWI / API','FieldName' : 'FieldName'}
    for(let k in source[0].wellData){
        if( k != 'Uuid' && k != 'UWI' && k != 'Prev' && k != 'Next'){
            keys.push(k)
            Object.assign(headerKeys,{[k] : k})
        }
    }
    
    for(var i=0; i<source.length; i++){
        delete source[i].wellData['Uuid']
        delete source[i].wellData['UWI']
        delete source[i].wellData['Prev']
        delete source[i].wellData['Next']
        let well = {}
        well['uuid'] = source[i].uuid
        well['WellId'] = source[i].govId['value'] ? source[i].govId['value'] : null
        well['UWI / API'] = source[i].subheader['value'] ? source[i].subheader['value'] : null
        well['FieldName'] = source[i].primaryHeader['value'] ? source[i].primaryHeader['value'] : null
        if(keys.length > 0){
            keys.forEach((key) => {
                well[key] = source[i].wellData[key]
            } )
        }
        welldata.push(well)
    }
    welldata.unshift(headerKeys)
    console.log(welldata[0])
    return welldata
}

export default parse