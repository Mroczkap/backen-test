const matchService = require('../services/matchService');
const freeMatchService = require('../services/freeMatchService');

const listRoundMatches = async (req, res) => {
  try {
    const idzawodow = req.query.idzawodow;
    const mecze = await matchService.getRoundMatches(idzawodow);
    res.status(200).json(mecze);
  } catch (e) {
    console.error('Error in handleRoundMatch:', e);
    res.status(500).send("Something went wrong");
  }
};

const saveRoundMatch = async (req, res) => {
  try {
    await matchService.saveMatch(req.body);
    res.status(200).json({ message: "Match saved successfully" });
  } catch (e) {
    console.error('Error in handleSave:', e);
    res.status(500).send("Something went wrong");
  }
};

const handleFree = async (req, res) => {
  try {
    await freeMatchService.handleFreeMatch(req.body);
    res.status(200).json({ message: "Free match handled successfully" });
  } catch (e) {
    console.error('Error in handleFree:', e);
    res.status(500).send("Something went wrong");
  }
};

const handleAddSingle = async (req, res) => {
  try {
    const result = await matchService.addMatch(req.body.params);
    res.status(200).json(result);
  } catch (e) {
    console.error('Error in handleAdd:', e);
    res.status(500).send("Something went wrong");
  }
};

const handleShowSingle = async (req, res) => {
  try {
    const date = req.query.date;
    const mecze = await matchService.getMatchesByDate(date);
    res.status(200).json(mecze);
  } catch (e) {
    console.error('Error in handleShow:', e);
    res.status(500).send("Something went wrong");
  }
};

const handleProgress = async (req, res) => {
  try {
    const [id, inProgress] = req.body;
    await matchService.updateMatchProgress(id, inProgress);
    res.status(200).json({ message: "Match progress updated successfully" });
  } catch (e) {
    console.error('Error in handleProgress:', e);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { listRoundMatches, saveRoundMatch, handleFree, handleProgress, handleShowSingle, handleAddSingle };