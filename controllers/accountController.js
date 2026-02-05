const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const accountController = {}

accountController.buildLogin = async function(req, res){
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    notice: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",   
    nav,
    errors: null,
    notice: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
      notice: 'Sorry, there was an error processing the registration.',
    })
    return
  }

  const regResult = await accountModel.accountRegister(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      notice: `Congratulations, you're registered ${account_firstname}. Please log in.`,
    })
  } else {
    res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
      notice: "Sorry, the registration failed. Please try again.",
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email } = req.body

  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    notice: "Login functionality coming soon.",
  })
}

module.exports = accountController
module.exports.buildRegister = buildRegister
module.exports.registerAccount = registerAccount
module.exports.loginAccount = loginAccount
