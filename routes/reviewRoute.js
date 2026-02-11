// Needed Resources
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../utilities/review-validation")

// Route to process adding a review
router.post(
  "/add",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
)

// Route to display user's reviews
router.get(
  "/user",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildUserReviews)
)

// Route to display edit review form
router.get(
  "/edit/:reviewId",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview)
)

// Route to process updating a review
router.post(
  "/update",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
)

// Route to display delete review confirmation
router.get(
  "/delete/:reviewId",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildDeleteReview)
)

// Route to process deleting a review
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
