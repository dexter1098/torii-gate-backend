const router = require("express").Router();

const {
  createProperty,
  getLandlordProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
} = require("../controllers/PropertyController");
const {isloggedin, requirePermissions} = require('../middleware/auth')

router.post('/', isloggedin, requirePermissions('landlord'), createProperty)
router.get('/landlord', isloggedin, requirePermissions('landlord'), getLandlordProperties)
router.patch('/landlord/:propertyId', isloggedin, requirePermissions('landlord'), updatePropertyAvailability)

// tenant
router.get('/', isloggedin, getAllProperties)
router.get('/:propertyId', isloggedin, getAProperty)




module.exports = router;
