const resultsService = require('../services/resultsService');

const handleResults = async (req, res) => {
  try {
    const results = await resultsService.getResultsWithPlayerDetails(req.query.idzawodow);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in handleWyniki:', error);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { handleResults };