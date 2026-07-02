const express = require("express");

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    module: req.baseUrl,
    message: `${req.baseUrl} module is connected successfully.`,
  });
});

module.exports = router;
