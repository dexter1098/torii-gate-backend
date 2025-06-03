const router = require("express").Router();

const {
  createProperty,
  getLandlordProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
  deleteProperty,
} = require("../controllers/PropertyController");
const { isloggedin, requirePermissions } = require("../middleware/auth");

router.post("/", isloggedin, requirePermissions("landlord"), createProperty);
router.get(
  "/landlord",
  isloggedin,
  requirePermissions("landlord"),
  getLandlordProperties
);
router.patch(
  "/landlord/:propertyId",
  isloggedin,
  requirePermissions("landlord"),
  updatePropertyAvailability
);
router.delete(
  "/landlord/:propertyId",
  isloggedin,
  requirePermissions("landlord"),
  deleteProperty
);

// tenant
router.get("/", isloggedin, getAllProperties);
router.get("/:propertyId", isloggedin, getAProperty);

//delete

module.exports = router;
