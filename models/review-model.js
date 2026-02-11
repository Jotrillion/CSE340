const pool = require("../database/")

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(inv_id, account_id, review_text, review_rating) {
  try {
    const sql = `INSERT INTO public.review (inv_id, account_id, review_text, review_rating) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`
    const data = await pool.query(sql, [inv_id, account_id, review_text, review_rating])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error: " + error)
    return null
  }
}

/* ***************************
 *  Get all reviews for a specific inventory item
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `SELECT r.review_id, r.review_text, r.review_rating, r.review_date,
                        a.account_firstname, a.account_lastname, a.account_id
                 FROM public.review r
                 JOIN public.account a ON r.account_id = a.account_id
                 WHERE r.inv_id = $1
                 ORDER BY r.review_date DESC`
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error)
    return []
  }
}

/* ***************************
 *  Get average rating for a specific inventory item
 * ************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `SELECT AVG(review_rating) as average_rating, COUNT(*) as review_count
                 FROM public.review
                 WHERE inv_id = $1`
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getAverageRating error: " + error)
    return { average_rating: null, review_count: 0 }
  }
}

/* ***************************
 *  Get reviews by account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `SELECT r.review_id, r.review_text, r.review_rating, r.review_date,
                        i.inv_make, i.inv_model, i.inv_year, r.inv_id
                 FROM public.review r
                 JOIN public.inventory i ON r.inv_id = i.inv_id
                 WHERE r.account_id = $1
                 ORDER BY r.review_date DESC`
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByAccountId error: " + error)
    return []
  }
}

/* ***************************
 *  Check if user has already reviewed a vehicle
 * ************************** */
async function hasUserReviewed(inv_id, account_id) {
  try {
    const sql = `SELECT review_id FROM public.review 
                 WHERE inv_id = $1 AND account_id = $2`
    const data = await pool.query(sql, [inv_id, account_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("hasUserReviewed error: " + error)
    return false
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM public.review WHERE review_id = $1`
    const data = await pool.query(sql, [review_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("deleteReview error: " + error)
    return false
  }
}

/* ***************************
 *  Get a specific review by ID
 * ************************** */
async function getReviewById(review_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year
                 FROM public.review r
                 JOIN public.inventory i ON r.inv_id = i.inv_id
                 WHERE r.review_id = $1`
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    return null
  }
}

/* ***************************
 *  Update a review
 * ************************** */
async function updateReview(review_id, review_text, review_rating) {
  try {
    const sql = `UPDATE public.review 
                 SET review_text = $1, review_rating = $2
                 WHERE review_id = $3
                 RETURNING *`
    const data = await pool.query(sql, [review_text, review_rating, review_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateReview error: " + error)
    return null
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getAverageRating,
  getReviewsByAccountId,
  hasUserReviewed,
  deleteReview,
  getReviewById,
  updateReview
}
