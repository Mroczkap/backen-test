const { ObjectId } = require("mongodb");
const matchRepository = require("../repositories/matchRepository");
const playerRepository = require("../repositories/playerRepository");
const rankingService = require("./rankingService");
const { addPlayerNamesToMatches } = require("../utils/playerUtils");
const { selectRound } = require("../utils/roundUtils");
const { podliczMecz} = require("../utils/countingUtils");
const {podliczWynikiGrupy} = require("./groupService")

const getRoundMatches = async (tournamentId) => {
  const matches = await matchRepository.findMatchesByZawody(tournamentId);
  const players = await playerRepository.getAllPlayers();

  return addPlayerNamesToMatches(matches, players);
};

const saveMatch = async (matchData) => {
  const [
    idmeczu,
    player1sets,
    player2sets,
    ,
    runda,
    player1id,
    player2id,
    idzawodow,
    nrmeczu,
  ] = matchData;

  await matchRepository.updateMatchScore(idmeczu, player1sets, player2sets);

  if (player1sets === 3 || player2sets === 3) {
    const winner = player1sets === 3 ? player1id : player2id;
    const loser = player1sets === 3 ? player2id : player1id;

    // Only progress players to the next round if there's a winner
    await progressPlayersToNextRound(runda, nrmeczu, idzawodow, winner, loser);
  }
};

const saveGroupMatch = async (id, player1sets, player2sets, idgr) => {
  // Update the match score
  await matchRepository.updateMatchScore(id, player1sets, player2sets);

  // Recalculate group results
  let wynikiGrupy = [];
  const mecze = await matchRepository.getMatchesByGroupId(idgr);

  mecze.forEach((mecz) => {
    wynikiGrupy = podliczMecz(wynikiGrupy, mecz);
  });

  await podliczWynikiGrupy(wynikiGrupy, idgr, mecze);

  return { success: true };
};

const progressPlayersToNextRound = async (
  runda,
  nrmeczu,
  idzawodow,
  winnerId,
  loserId
) => {
  const nextMatch = selectRound(runda, nrmeczu);
  const [matchType, winnerNextMatch, loserNextMatch] = nextMatch;

  if (matchType === -1) {
    await saveFinalResults(
      winnerId,
      loserId,
      winnerNextMatch,
      loserNextMatch,
      idzawodow
    );
  } else {
    await updateNextRoundMatches(
      matchType,
      idzawodow,
      runda,
      winnerNextMatch,
      loserNextMatch,
      winnerId,
      loserId
    );
  }
};

const updateNextRoundMatches = async (
  matchType,
  idzawodow,
  runda,
  winnerNextMatch,
  loserNextMatch,
  winnerId,
  loserId
) => {
  const isPlayer1 = matchType === 1;
  await matchRepository.updateNextMatch(
    idzawodow,
    winnerNextMatch,
    runda,
    winnerId,
    isPlayer1
  );
  await matchRepository.updateNextMatch(
    idzawodow,
    loserNextMatch,
    runda,
    loserId,
    isPlayer1
  );
};

const saveFinalResults = async (
  winnerId,
  loserId,
  winnerPlace,
  loserPlace,
  idzawodow
) => {
  await matchRepository.saveResult(winnerId, winnerPlace, idzawodow);
  await matchRepository.saveResult(loserId, loserPlace, idzawodow);
};

const addMatch = async (params) => {
  const { player1sets, player2sets, player1id, player2id, rankingid } = params;
  const insertedMatch = await matchRepository.insertMatch({
    date: new Date(),
    player1id: new ObjectId(player1id),
    player2id: new ObjectId(player2id),
    player1sets: player1sets,
    player2sets: player2sets,
    rankingid: new ObjectId(rankingid),
  });

  if (player1sets == 3 || player2sets == 3) {
    await rankingService.updateRankings(
      insertedMatch,
      player1id,
      player2id,
      player1sets,
      player2sets,
      rankingid
    );
  }

  return { success: true };
};

const getMatchesByDate = async (date) => {
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);

  const zawodniki = await playerRepository.getAllPlayers();
  const mecze = await matchRepository.getMatchesByDateRange(startDate, endDate);

  return addPlayerNamesToMatches(mecze, zawodniki);
};

const updateMatchProgress = async (id, inProgress) => {
  await matchRepository.updateMatchProgress(id, inProgress);
};

module.exports = {
  getRoundMatches,
  saveMatch,
  saveGroupMatch,
  addMatch,
  getMatchesByDate,
  updateMatchProgress,
};
