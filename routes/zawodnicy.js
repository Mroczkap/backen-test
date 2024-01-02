const express = require("express");
const router = express.Router();
const zawodnicyController = require("../controllers/zawodnicyController");

router
  .route("/")
  .get(zawodnicyController.getAllZawodnicy)
  .post(zawodnicyController.createNewZawodnik)
  .put(zawodnicyController.updateZawodnik)
  .delete(zawodnicyController.deleteZawodnik);

module.exports = router;
