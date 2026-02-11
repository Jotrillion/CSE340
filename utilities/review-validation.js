const utilities = require(".")
const { body, validationResult } = require("express-validator")
const reviewModel = require("../models/review-model")
const validate = {}

/* *****************************
 *  Review Data Validation Rules
 * ***************************** */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .notEmpty()
      .withMessage("Please provide a review.")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters."),
    
    body("review_rating")
      .trim()
      .notEmpty()
      .withMessage("Please provide a rating.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),
    
    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("Inventory ID is required.")
      .isInt({ min: 1 })
      .withMessage("Invalid inventory ID."),
  ]
}

/* ******************************
 * Check review data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_text, review_rating, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const invModel = require("../models/inventory-model")
    const data = await invModel.getInventoryByInventoryId(inv_id)
    const grid = await utilities.buildVehicleDetail(data)
    
    // Get existing reviews
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id)
    const reviewStats = await reviewModel.getAverageRating(inv_id)
    const reviewsHTML = await utilities.buildReviewsHTML(reviews, reviewStats, res.locals.accountData, inv_id)
    
    res.render("./inventory/detail", {
      title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
      nav,
      grid,
      reviewsHTML,
      errors,
      review_text,
      review_rating,
    })
    return
  }
  next()
}

module.exports = validate
