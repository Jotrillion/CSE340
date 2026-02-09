const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build edit inventory view
router.get("/edit/:inventoryId", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventory));

// Route to build delete inventory view
router.get("/delete/:inv_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteInventory));

// Route to build inventory management view
router.get("/", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement));

// Route to get inventory by classification_id as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build add classification view
router.get("/add-classification", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification));

// Process add classification
router.post(
	"/add-classification",
	utilities.checkEmployeeOrAdmin,
	invValidate.classificationRules(),
	invValidate.checkClassificationData,
	utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get("/add-inventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory));

// Process add inventory
router.post(
	"/add-inventory",
	utilities.checkEmployeeOrAdmin,
	invValidate.inventoryRules(),
	invValidate.checkInventoryData,
	utilities.handleErrors(invController.addInventory)
);

// Process inventory update
router.post(
	"/update/",
	utilities.checkEmployeeOrAdmin,
	invValidate.inventoryRules(),
	invValidate.checkUpdateData,
	utilities.handleErrors(invController.updateInventory)
);

// Process inventory deletion
router.post(
	"/delete/",
	utilities.checkEmployeeOrAdmin,
	utilities.handleErrors(invController.deleteInventory)
);

// Route to trigger intentional error (for testing)
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

module.exports = router;