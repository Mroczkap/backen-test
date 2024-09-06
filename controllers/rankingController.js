const RankingService = require('../services/rankingService');

const handleAdd = async (req, res) => {
  try {
    const { idzawodow, idrankingu } = req.body;
    await RankingService.addTournamentToRanking(idzawodow, idrankingu);
    res.status(200).json({ message: 'Tournament added to ranking successfully' });
  } catch (e) {
    if (e.message === "TOURNAMENT_ALREADY_ADDED") {
        res.status(203).json({ error: 'Tournament already added to ranking' });
      } else {
    res.status(500).json({ error: 'Something went wrong', details: e.message });
  }}
};

const handleShow = async (req, res) => {
  try {
    const { idrankingu, user1, user2 } = req.query;
    const ranking = await RankingService.getRanking(idrankingu, user1, user2);
    res.status(200).json(ranking);
  } catch (e) {

    res.status(500).json({ error: 'Something went wrong', details: e.message });
  }
};

const handleList = async (req, res) => {
  try {
    const rankings = await RankingService.listRankings();
    res.status(200).json(rankings);
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong', details: e.message });
  }
};

module.exports = { handleAdd, handleShow, handleList };