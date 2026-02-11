const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* ***************************
 *  Process add review
 * ************************** */
reviewCont.addReview = async function (req, res, next) {
  const { review_text, review_rating, inv_id } = req.body
  const account_id = res.locals.accountData.account_id

  // Check if user has already reviewed this vehicle
  const hasReviewed = await reviewModel.hasUserReviewed(inv_id, account_id)
  
  if (hasReviewed) {
    req.flash("notice", "You have already reviewed this vehicle. You can edit your existing review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  const addResult = await reviewModel.addReview(inv_id, account_id, review_text, review_rating)

  if (addResult) {
    req.flash("notice", "Review submitted successfully!")
    res.redirect(`/inv/detail/${inv_id}`)
  } else {
    const nav = await utilities.getNav()
    const data = await invModel.getInventoryByInventoryId(inv_id)
    const grid = await utilities.buildVehicleDetail(data)
    
    // Get existing reviews
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id)
    const reviewStats = await reviewModel.getAverageRating(inv_id)
    const reviewsHTML = await utilities.buildReviewsHTML(reviews, reviewStats, res.locals.accountData, inv_id)
    
    req.flash("notice", "Sorry, submitting the review failed.")
    res.status(500).render("./inventory/detail", {
      title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
      nav,
      grid,
      reviewsHTML,
      errors: null,
      review_text,
      review_rating,
    })
  }
}

/* ***************************
 *  Build user reviews view
 * ************************** */
reviewCont.buildUserReviews = async function (req, res, next) {
  const nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const reviews = await reviewModel.getReviewsByAccountId(account_id)
  const reviewsHTML = await utilities.buildUserReviewsHTML(reviews)
  
  res.render("./account/reviews", {
    title: "My Reviews",
    nav,
    reviewsHTML,
    errors: null,
  })
}

/* ***************************
 *  Build edit review view
 * ************************** */
reviewCont.buildEditReview = async function (req, res, next) {
  const review_id = parseInt(req.params.reviewId)
  const nav = await utilities.getNav()
  const reviewData = await reviewModel.getReviewById(review_id)
  
  if (!reviewData) {
    req.flash("notice", "Review not found.")
    return res.redirect("/account/reviews")
  }
  
  // Check if the logged-in user owns this review
  if (reviewData.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to edit this review.")
    return res.redirect("/account/reviews")
  }
  
  res.render("./account/edit-review", {
    title: `Edit Review - ${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`,
    nav,
    errors: null,
    review_id: reviewData.review_id,
    review_text: reviewData.review_text,
    review_rating: reviewData.review_rating,
    inv_make: reviewData.inv_make,
    inv_model: reviewData.inv_model,
    inv_year: reviewData.inv_year,
  })
}

/* ***************************
 *  Process update review
 * ************************** */
reviewCont.updateReview = async function (req, res, next) {
  const { review_id, review_text, review_rating } = req.body
  const nav = await utilities.getNav()
  
  // Get review to verify ownership
  const reviewData = await reviewModel.getReviewById(review_id)
  
  if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to edit this review.")
    return res.redirect("/account/reviews")
  }
  
  const updateResult = await reviewModel.updateReview(review_id, review_text, review_rating)

  if (updateResult) {
    req.flash("notice", "Review updated successfully!")
    res.redirect("/account/reviews")
  } else {
    req.flash("notice", "Sorry, updating the review failed.")
    res.status(500).render("./account/edit-review", {
      title: `Edit Review - ${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`,
      nav,
      errors: null,
      review_id,
      review_text,
      review_rating,
      inv_make: reviewData.inv_make,
      inv_model: reviewData.inv_model,
      inv_year: reviewData.inv_year,
    })
  }
}

/* ***************************
 *  Build delete review confirmation view
 * ************************** */
reviewCont.buildDeleteReview = async function (req, res, next) {
  const review_id = parseInt(req.params.reviewId)
  const nav = await utilities.getNav()
  const reviewData = await reviewModel.getReviewById(review_id)
  
  if (!reviewData) {
    req.flash("notice", "Review not found.")
    return res.redirect("/account/reviews")
  }
  
  // Check if the logged-in user owns this review
  if (reviewData.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to delete this review.")
    return res.redirect("/account/reviews")
  }
  
  res.render("./account/delete-review", {
    title: `Delete Review - ${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`,
    nav,
    errors: null,
    review_id: reviewData.review_id,
    review_text: reviewData.review_text,
    review_rating: reviewData.review_rating,
    inv_make: reviewData.inv_make,
    inv_model: reviewData.inv_model,
    inv_year: reviewData.inv_year,
  })
}

/* ***************************
 *  Process delete review
 * ************************** */
reviewCont.deleteReview = async function (req, res, next) {
  const review_id = parseInt(req.body.review_id)
  
  // Get review to verify ownership
  const reviewData = await reviewModel.getReviewById(review_id)
  
  if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You do not have permission to delete this review.")
    return res.redirect("/account/reviews")
  }
  
  const deleteResult = await reviewModel.deleteReview(review_id)

  if (deleteResult) {
    req.flash("notice", "Review deleted successfully!")
    res.redirect("/account/reviews")
  } else {
    const nav = await utilities.getNav()
    req.flash("notice", "Sorry, deleting the review failed.")
    res.status(500).render("./account/delete-review", {
      title: `Delete Review - ${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`,
      nav,
      errors: null,
      review_id: reviewData.review_id,
      review_text: reviewData.review_text,
      review_rating: reviewData.review_rating,
      inv_make: reviewData.inv_make,
      inv_model: reviewData.inv_model,
      inv_year: reviewData.inv_year,
    })
  }
}

module.exports = reviewCont
