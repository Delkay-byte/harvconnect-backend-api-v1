const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  updateLocationAndStatus,
} = require("../controllers/transportController");
const { validateUpdateTransport } = require("../validators/transport.validator");

router.put("/status", auth, authorize("TRANSPORT"), validateUpdateTransport, updateLocationAndStatus);

module.exports = router;
