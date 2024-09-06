const playerService = require('../services/playerService');

const getAllPlayers = async (req, res) => {
  try {
    const sorting = req.query.sorting ? { nazwisko: 1 } : { ranking: -1 };
    const players = await playerService.getAllPlayers(sorting);
    res.status(200).json(players);
  } catch (error) {
    console.error('Error in getAllPlayers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createNewPlayer = async (req, res) => {
  try {
    const newPlayer = await playerService.createPlayer(req.body);
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Error in createNewPlayer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const updatedPlayer = await playerService.updatePlayer(req.query.id, req.body);
    res.status(200).json(updatedPlayer);
  } catch (error) {
    console.error('Error in updatePlayer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePlayer = async (req, res) => {
  try {
    await playerService.deletePlayer(req.query.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deletePlayer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllPlayers,
  createNewPlayer,
  updatePlayer,
  deletePlayer,
};