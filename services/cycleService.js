const { ObjectId } = require("mongodb");
const cycleRepository = require("../repositories/cycleRepository");
const tournamentRepository = require("../repositories/tournamentRepository");
const playerRepository = require("../repositories/playerRepository");
const { sortByProperty } = require("../utils/sortUtils");
const { v4: uuidv4 } = require("uuid");

const addTournamentToCycle = async (tournamentId, cycleId) => {
  const cycle = await cycleRepository.getCycleById(cycleId);
  if (cycle.turnieje.includes(tournamentId)) {
    return { alreadyExists: true };
  }

  await cycleRepository.addTournamentToCycle(cycleId, tournamentId);
  const results = await tournamentRepository.getTournamentResults(tournamentId);
  const points = await cycleRepository.getPointSystem("Main");
  
  const cycleEntry = createCycleEntry(
    cycleId,
    results,
    points,
    cycle.turnieje.length
  );
  await cycleRepository.addCycleEntry(cycleEntry);

  return { alreadyExists: false };
};

const getCycleRanking = async (cycleId) => {
  const cycleEntries = await cycleRepository.getCycleEntries(cycleId);
  const playerResults = aggregatePlayerResults(cycleEntries);
  const players = await playerRepository.getAllPlayers();

  const rankingArray = Object.values(playerResults).map((result) => {
    const player = players.find((p) => p._id.equals(result.idzawodnika));
    result.name = `${player.nazwisko} ${player.imie}`;
    return result;
  });

  return sortByProperty(rankingArray, "sumapkt", "name", false);
};

const listAllCycles = async () => {
  return await cycleRepository.getAllCycles();
};

const createCycleEntry = (cycleId, results, points, tournamentNumber) => {
  const zawodnicyIds = [];
  const zdobytePunkty = [];

  results.forEach((result) => {
    const pointsValue = points.pkt[result.miejsce];
    zawodnicyIds.push(result.idzawodnika);
    zdobytePunkty.push(pointsValue);
  });

  return {
    cyklid: new ObjectId(cycleId),
    zawodnicy: zawodnicyIds,
    setspunkty: zdobytePunkty,
    turniejid: results[0].idzawodow,
    numer: tournamentNumber,
  };
};

const aggregatePlayerResults = (cycleEntries) => {
  const playerResults = {};

  cycleEntries.forEach((entry) => {
    const { numer, zawodnicy, setspunkty } = entry;

    zawodnicy.forEach((idzawodnika, index) => {
      if (!playerResults[idzawodnika]) {
        playerResults[idzawodnika] = { id: uuidv4(), idzawodnika, sumapkt: 0 };
      }

      const punkty = setspunkty[index];
      playerResults[idzawodnika][`z${numer}`] = punkty;
      playerResults[idzawodnika].sumapkt += punkty;
    });
  });

  return playerResults;
};

module.exports = { addTournamentToCycle, getCycleRanking, listAllCycles };
