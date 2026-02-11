const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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

/* ************************
 * Build classification select list
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
 if (res.locals.loggedin) {
  next()
 } else {
  req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
 }
}

/* ****************************************
 *  Check for Employee or Admin Account Type
 * ************************************ */
Util.checkEmployeeOrAdmin = (req, res, next) => {
 if (res.locals.accountData && (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
  next()
 } else {
  req.flash("notice", "You do not have permission to access this resource. Please log in with an Employee or Admin account.")
  return res.redirect("/account/login")
 }
}

/* **************************************
* Build the reviews HTML for vehicle detail page
* ************************************ */
Util.buildReviewsHTML = async function(reviews, reviewStats, accountData, inv_id) {
  let html = '<div class="reviews-section">'
  html += '<h3>Customer Reviews</h3>'
  
  // Display average rating
  if (reviewStats.review_count > 0) {
    const avgRating = parseFloat(reviewStats.average_rating).toFixed(1)
    html += '<div class="review-summary">'
    html += '<span class="average-rating">' + avgRating + ' / 5</span>'
    html += '<span class="review-count">(' + reviewStats.review_count + ' review' + (reviewStats.review_count > 1 ? 's' : '') + ')</span>'
    html += '<div class="stars">' + Util.buildStars(avgRating) + '</div>'
    html += '</div>'
  } else {
    html += '<p>No reviews yet. Be the first to review this vehicle!</p>'
  }
  
  // Review form (only if logged in)
  if (accountData) {
    html += '<div class="review-form">'
    html += '<h4>Write a Review</h4>'
    html += '<form action="/review/add" method="post">'
    html += '<input type="hidden" name="inv_id" value="' + inv_id + '">'
    html += '<div class="form-group">'
    html += '<label for="review_rating">Rating:</label>'
    html += '<select id="review_rating" name="review_rating" required>'
    html += '<option value="">Select a rating</option>'
    html += '<option value="5">5 - Excellent</option>'
    html += '<option value="4">4 - Very Good</option>'
    html += '<option value="3">3 - Good</option>'
    html += '<option value="2">2 - Fair</option>'
    html += '<option value="1">1 - Poor</option>'
    html += '</select>'
    html += '</div>'
    html += '<div class="form-group">'
    html += '<label for="review_text">Your Review:</label>'
    html += '<textarea id="review_text" name="review_text" rows="4" required placeholder="Share your experience with this vehicle..." minlength="10" maxlength="1000"></textarea>'
    html += '</div>'
    html += '<button type="submit" class="submit-review-btn">Submit Review</button>'
    html += '</form>'
    html += '</div>'
  } else {
    html += '<p><a href="/account/login">Log in</a> to write a review.</p>'
  }
  
  // Display reviews
  if (reviews.length > 0) {
    html += '<div class="reviews-list">'
    reviews.forEach(review => {
      html += '<div class="review-item">'
      html += '<div class="review-header">'
      html += '<span class="reviewer-name">' + review.account_firstname + ' ' + review.account_lastname.charAt(0) + '.</span>'
      html += '<span class="review-rating">' + Util.buildStars(review.review_rating) + '</span>'
      html += '<span class="review-date">' + new Date(review.review_date).toLocaleDateString() + '</span>'
      html += '</div>'
      html += '<div class="review-body">'
      html += '<p>' + review.review_text + '</p>'
      html += '</div>'
      html += '</div>'
    })
    html += '</div>'
  }
  
  html += '</div>'
  return html
}

/* **************************************
* Build star rating HTML
* ************************************ */
Util.buildStars = function(rating) {
  let stars = ''
  const fullStars = Math.floor(rating)
  const hasHalfStar = (rating % 1) >= 0.5
  
  for (let i = 0; i < fullStars; i++) {
    stars += '★'
  }
  if (hasHalfStar) {
    stars += '☆'
  }
  const emptyStars = 5 - Math.ceil(rating)
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆'
  }
  
  return stars
}

/* **************************************
* Build user reviews HTML for account page
* ************************************ */
Util.buildUserReviewsHTML = function(reviews) {
  let html = '<div class="user-reviews-section">'
  
  if (reviews.length === 0) {
    html += '<p>You haven\'t written any reviews yet.</p>'
  } else {
    html += '<ul class="user-reviews-list">'
    reviews.forEach(review => {
      html += '<li class="user-review-item">'
      html += '<div class="review-vehicle-info">'
      html += '<h3>' + review.inv_year + ' ' + review.inv_make + ' ' + review.inv_model + '</h3>'
      html += '<span class="review-rating">' + Util.buildStars(review.review_rating) + ' (' + review.review_rating + '/5)</span>'
      html += '<span class="review-date">' + new Date(review.review_date).toLocaleDateString() + '</span>'
      html += '</div>'
      html += '<p class="review-text">' + review.review_text + '</p>'
      html += '<div class="review-actions">'
      html += '<a href="/review/edit/' + review.review_id + '" class="btn-edit">Edit</a>'
      html += '<a href="/review/delete/' + review.review_id + '" class="btn-delete">Delete</a>'
      html += '</div>'
      html += '</li>'
    })
    html += '</ul>'
  }
  
  html += '</div>'
  return html
}

/* **************************************
* Build the vehicle detail with correct name
* ************************************ */
Util.buildVehicleDetail = Util.buildInventoryDetail

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