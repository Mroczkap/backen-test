const playerRepository = require("../repositories/playerRepository");
const tournamentRepository = require("../repositories/tournamentRepository");
const tournamentUtils = require("../utils/tournamentUtils");

const createTournament = async (tournamentData) => {
  const players = await playerRepository.getPlayersByIds(
    tournamentData.zawodnicy
  );
  const groups = tournamentUtils.createGroups(
    tournamentData.selectedGroup,
    players.length,
    players
  );
  const type = tournamentUtils.determineTournamentType(
    tournamentData.selectedGroup,
    players.length
  );

  const tournament = await tournamentRepository.createTournament({
    dataturneju: new Date(),
    nazwaturnieju: tournamentData.nazwa,
    liczbagrup: tournamentData.selectedGroup,
    zawodnicy: tournamentData.zawodnicy,
    typ: type,
  });

  await createTournamentStructure(tournament, groups, players);

  return tournament;
};

const createTournamentStructure = async (tournament, groups, players) => {
  await tournamentRepository.createGroupMatchesForTournament(
    tournament._id,
    groups
  );

  if (tournament.typ !== 4) {
    let matchCount = tournamentUtils.calculateMatchCount(
      players.length
    );

    if (players.length > 16) {
      if (players.length <= 24 && tournament.liczbagrup === 4) {
        matchCount = 12;
      } else {
        matchCount = 16;
        await tournamentRepository.createRoundForTournament(
          tournament._id,
          "1/8",
          matchCount
        );
      }
    }

    if (players.length > 8) {
      matchCount = matchCount === 0 ? 8 : matchCount;
      if (tournament.liczbagrup !== 2) {
        await tournamentRepository.createRoundForTournament(
          tournament._id,
          "1/4",
          matchCount
        );
      }
    }

    matchCount = matchCount === 0 ? 4 : matchCount;
    await tournamentRepository.createRoundForTournament(
      tournament._id,
      "1/2",
      matchCount
    );
    await tournamentRepository.createRoundForTournament(
      tournament._id,
      "final",
      matchCount
    );
  }

  await tournamentRepository.createResultsForTournament(
    tournament._id,
    players.length
  );
};

const getAllTournaments = async () => {
  const tournaments = await tournamentRepository.findAllTournaments();
  return tournaments.map(tournamentUtils.formatTournamentDate);
};

module.exports = { createTournament, getAllTournaments };
