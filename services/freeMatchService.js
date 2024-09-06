const { getFree } = require("../repositories/playerRepository");
const { selectRound } = require("../utils/roundUtils");
const matchRepository = require("../repositories/matchRepository");

const handleFreeMatch = async (matchData) => {
  const [idmeczu, , , , runda, player1id, player2id, idzawodow, nrmeczu] = matchData;

  const free = await getFree();
  const human = player1id === free.toString() ? player2id : player1id;

  await progressFreeMatchToNextRound(runda, nrmeczu, idzawodow, human, free);
  await matchRepository.markMatchAsSaved(idzawodow, idmeczu);
};

const progressFreeMatchToNextRound = async (runda, nrmeczu, idzawodow, humanId, freeId) => {
  const nextMatch = selectRound(runda, nrmeczu);
  const [matchType, nextMatchId1, nextMatchId2] = nextMatch;

  if (matchType === -1) {
    await matchRepository.saveResult(humanId, nextMatchId1, idzawodow);
  } else {
    await updateNextRoundMatches(matchType, idzawodow, runda, nextMatchId1, nextMatchId2, humanId, freeId);
  }
};

const updateNextRoundMatches = async (matchType, idzawodow, runda, nextMatchId1, nextMatchId2, humanId, freeId) => {
  const isPlayer1 = matchType === 1;
  await matchRepository.updateNextMatch(idzawodow, nextMatchId1, runda, humanId, isPlayer1);
  await matchRepository.updateNextMatch(idzawodow, nextMatchId2, runda, freeId, isPlayer1);
};

module.exports = { handleFreeMatch };