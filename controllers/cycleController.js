const cycleService = require('../services/cycleService');
const { validateAddCycleInput } = require('../middleware/validateInput');

const addTournamentToCycle = async (req, res) => {
  try {
    const { error } = validateAddCycleInput(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { idzawodow, idrankingu } = req.body;
    const result = await cycleService.addTournamentToCycle(idzawodow, idrankingu);

    if (result.alreadyExists) {
      return res.status(203).json({ message: 'Tournament already in cycle' });
    }

    res.status(200).json({ message: 'Tournament added to cycle successfully' });
  } catch (error) {
    console.error('Add tournament to cycle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const showCycleRanking = async (req, res) => {
  try {
    const { idrankingu } = req.query;
    const ranking = await cycleService.getCycleRanking(idrankingu);
    res.status(200).json(ranking);
  } catch (error) {
    console.error('Show cycle ranking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const listCycles = async (req, res) => {
  try {
    const cycles = await cycleService.listAllCycles();
    res.status(200).json(cycles);
  } catch (error) {
    console.error('List cycles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { addTournamentToCycle, showCycleRanking, listCycles };