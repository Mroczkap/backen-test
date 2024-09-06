const groupService = require('../services/groupService');
const matchService = require('../services/matchService');

const handleSave = async (req, res) => {
  try {
    const [id, player1sets, player2sets, idgr] = req.body;
    await matchService.saveGroupMatch(id, player1sets, player2sets, idgr);
    res.status(200).json({ message: "Match saved successfully" });
  } catch (e) {
    console.error('Error in handleSave:', e);
    res.status(500).send("Something went wrong");
  }
};

const handleFinish = async (req, res) => {
  try {
    const { idzawodow } = req.query;
    const [id, nrgrupy, typ] = req.body;
   
    const result = await groupService.finishGroup(idzawodow, id, nrgrupy, typ);
    res.status(200).json(result);
  } catch (e) {
    if (e.message.startsWith("Invalid match:")) {
      res.status(203).json({ error: e.message });
    } else {
      res.status(500).send("Something went wrong");
    }
  }
};

const handleGroupFinish = async (req, res) => {
  try {
    const { idzawodow } = req.query;
    const [groupOut] = req.body;
    const result = await groupService.finishAllGroups(idzawodow, groupOut);
    res.status(200).json(result);
  } catch (e) {
    if (e.message.startsWith("Invalid match:")) {
      res.status(203).json({ error: e.message });
    } else {
      res.status(500).send("Something went wrong");
    }
  }
};

const handleGroups = async (req, res) => {
  try {
    const { idzawodow } = req.query;
    const result = await groupService.getGroupsAndMatches(idzawodow);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
};

module.exports = { handleFinish, handleGroupFinish, handleGroups, handleSave };
