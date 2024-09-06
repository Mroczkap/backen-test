const playerRepository = require('../repositories/playerRepository');
const resultsRepository = require('../repositories/resultsRepository');

const getResultsWithPlayerDetails = async (idzawodow) => {
  try {
    const results = await resultsRepository.getResultsByCompetitionId(idzawodow);
    const players = await playerRepository.getAllPlayers();

    return results.map(result => {
      const player = players.find(player => player._id.equals(result.idzawodnika));
      return {
        ...result,
        imie: player ? player.imie : null,
        nazwisko: player ? player.nazwisko : null
      };
    });
  } catch (error) {
    console.error('Error in getResultsWithPlayerDetails:', error);
    throw error;
  }
};

module.exports = { getResultsWithPlayerDetails };