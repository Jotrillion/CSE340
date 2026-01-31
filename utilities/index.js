const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
module.exports = Util



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


 /* **************************************
* Build the inventory item detail view HTML
* ************************************ */
Util.buildInventoryDetail = async function(vehicle) {
  let detail = '<div id="inv-detail-container">'
  
  // Image Section
  detail += '<div class="vehicle-image">'
  detail += '<img src="' + vehicle.inv_image + '" alt="' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '">'
  detail += '</div>'
  
  // Details Section
  detail += '<div class="vehicle-details">'
  
  // Title (Year Make Model)
  detail += '<h2 class="vehicle-title">' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>'
  
  // Prominent Price
  detail += '<p class="vehicle-price">' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price) + '</p>'
  
  // Key Details Section - Mileage
  detail += '<div class="vehicle-key-specs">'
  detail += '<div class="spec-item">'
  detail += '<span class="spec-label">MILEAGE</span>'
  detail += '<span class="spec-value">' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</span>'
  detail += '</div>'
  detail += '</div>'
  
  // Full Description
  detail += '<div class="vehicle-description">'
  detail += '<h3>Description</h3>'
  detail += '<p>' + vehicle.inv_description + '</p>'
  detail += '</div>'
  
  // Additional Vehicle Information
  detail += '<div class="vehicle-specs-table">'
  detail += '<h3>Vehicle Specifications</h3>'
  
  detail += '<div class="spec-row">'
  detail += '<span class="spec-label">Exterior Color:</span>'
  detail += '<span class="spec-value">' + vehicle.inv_color + '</span>'
  detail += '</div>'
  
  detail += '<div class="spec-row">'
  detail += '<span class="spec-label">Year:</span>'
  detail += '<span class="spec-value">' + vehicle.inv_year + '</span>'
  detail += '</div>'
  
  detail += '<div class="spec-row">'
  detail += '<span class="spec-label">Make:</span>'
  detail += '<span class="spec-value">' + vehicle.inv_make + '</span>'
  detail += '</div>'
  
  detail += '<div class="spec-row">'
  detail += '<span class="spec-label">Model:</span>'
  detail += '<span class="spec-value">' + vehicle.inv_model + '</span>'
  detail += '</div>'
  
  detail += '</div>'
  detail += '</div>' // Close vehicle-details
  detail += '</div>' // Close inv-detail-container
  
  return detail
}