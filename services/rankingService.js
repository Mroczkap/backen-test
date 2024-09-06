
const { ObjectId } = require('mongodb');
const rankingRepository = require('../repositories/rankingRepository');
const { addtorankingarray, createUpdateObject,createNewPairObject } = require('../utils/rankingUtils');
const { sortByProperty2 } = require('../utils/sortUtils');


const addTournamentToRanking = async (idzawodow, idrankingu) => {
  const ranking = await rankingRepository.getRankingById(idrankingu);
  if (ranking.turnieje.includes(idzawodow)) {
    
    throw new Error("TOURNAMENT_ALREADY_ADDED");
  }

  await rankingRepository.addTournamentToRanking(idzawodow, idrankingu);

  const matches = await rankingRepository.getMatchesByTournament(idzawodow);
  let result = [];

  for (const match of matches) {
    if (match.player1sets === 3 || match.player2sets === 3) {
      const sets = match.player1sets + match.player2sets;
      const winner = match.player1sets === 3 ? 1 : 2;

      addToPair(match._id, match.player1sets, match.player2sets, match.player1id, match.player2id, sets);

      result = addtorankingarray(result, match.player1id, sets, match.player1sets, winner === 1 ? 1 : 0);
      result = addtorankingarray(result, match.player2id, sets, match.player2sets, winner === 2 ? 1 : 0);
    }
  }

  for (const item of result) {
    await rankingRepository.updatePlayerRank(item.playerid, idrankingu, {
      sets: item.sets,
      winsets: item.winsets,
      match: item.match,
      winmatch: item.winmatch,
      tournaments: 1,
    });
  }
};

const getRanking = async (idrankingu, user1, user2) => {
  let ranking = await rankingRepository.getRankingPlayers(idrankingu);
  const zawodnicy = await rankingRepository.getAllPlayers();

  ranking = ranking.map((item, index) => {
    const zawodnik = zawodnicy.find(zaw => zaw._id.equals(item.playerid));
    return {
      ...item,
      name: `${zawodnik.nazwisko} ${zawodnik.imie}`,
      id: index + 1,
      setspercent: item.winsets / item.sets,
      matchpercent: item.winmatch / item.match,
      playerid: item.playerid.toString()
    };
  });

  if (user1 && user2) {
    const filteredRanking = ranking.filter(item => [user1._id, user2._id].includes(item.playerid));
    const pairData = await rankingRepository.getPairData(filteredRanking[0].playerid, filteredRanking[1].playerid);

    if (pairData) {
      filteredRanking.forEach((item, index) => {
        const isPlayer1 = pairData.player1id.equals(new ObjectId(item.playerid));
        item.pairmatch = isPlayer1 ? pairData.p1match : pairData.p2match;
        item.pairsets = isPlayer1 ? pairData.p1sets : pairData.p2sets;
        item.pairmatchp = item.pairmatch / pairData.matchplayed;
        item.pairsetsp = item.pairsets / pairData.setsplayed;
        item.pairmatchplayed = pairData.matchplayed;
        item.pairsetsplayed = pairData.setsplayed;
      });
    }

    return filteredRanking;
  } else {
    return sortByProperty2(ranking, 'matchpercent', 'setspercent', false);
  }
};

const listRankings = async () => {
  return await rankingRepository.listRankings();
};

const updateRankings = async (insertedMatch, player1id, player2id, player1sets, player2sets, rankingid) => {
  const sety = parseInt(player1sets) + parseInt(player2sets);

  let p1 = player1sets === 3 ? 1 : 0;
  let p2 = player1sets === 3 ? 0 : 1;

  addToPair(
    insertedMatch.insertedId,
    player1sets,
    player2sets,
    new ObjectId(player1id),
    new ObjectId(player2id),
    sety
  );

  let result = [];
  result = addtorankingarray(result, new ObjectId(player1id), sety, parseInt(player1sets), p1);
  result = addtorankingarray(result, new ObjectId(player2id), sety, parseInt(player2sets), p2);


  await Promise.all(result.map(async (item) => {
    const existingRank = await rankingRepository.getRankingById(rankingid);
    
    if (existingRank) {
      await rankingRepository.updatePlayerRank(item.playerid, rankingid, {
        sets: item.sets,
        winsets: item.winsets,
        match: item.match,
        winmatch: item.winmatch,
      });
    } else {
      await rankingRepository.insertRank({
        rankingid: new ObjectId(rankingid),
        playerid: item.playerid,
        sets: item.sets,
        winsets: item.winsets,
        match: item.match,
        winmatch: item.winmatch,
      });
    }
  }));
};

const addToPair = async (matchid, player1sets, player2sets, player1id, player2id, sety) => {
  const existingPair = await rankingRepository.getPairData(player1id, player2id);

  if (existingPair) {
    const existingMatches = existingPair.match;
    if (!existingMatches.includes(matchid.toString())) {
      const filter = {
        $or: [
          { $and: [{ player1id: player1id }, { player2id: player2id }] },
          { $and: [{ player1id: player2id }, { player2id: player1id }] },
        ],
      };
      const update = createUpdateObject(player1id, player1sets, player2sets, sety, matchid, existingPair);
      await rankingRepository.updatePair(filter, update);
    }
  } else {
    const newPair = createNewPairObject(player1id, player2id, player1sets, player2sets, sety, matchid);
    await rankingRepository.insertPair(newPair);
  }
};




module.exports = {
  addTournamentToRanking,
  getRanking,
  listRankings,
  updateRankings
};