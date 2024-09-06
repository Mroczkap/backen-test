const tournamentService = require('../services/tournamentService');

const handleCreate = async (req, res) => {
  try {
    const tournamentData = await tournamentService.createTournament(req.body);
    res.status(200).json(tournamentData);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Error creating tournament', error: error.message });
  }
};

const getTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.getAllTournaments();
    res.status(200).json(tournaments);
  } catch (error) {
    console.error('Error in getTournaments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { handleCreate, getTournaments };