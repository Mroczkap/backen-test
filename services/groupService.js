const { ObjectId } = require("mongodb");
const {
  podliczMecz,
  updateWynikiGrupyWithPlace,
  extractResultArrays,
} = require("../utils/countingUtils");
const groupRepository = require("../repositories/groupRepository");
const playerRepository = require("../repositories/playerRepository");
const matchRepository = require("../repositories/matchRepository");
const rankingRepository = require("../repositories/rankingRepository");
const { addPlayerNamesToMatches } = require("../utils/playerUtils");
const {
  groupByMiejsce,
  prepareResult,
  prepareWynikKoncowy,
  sortEqualPlayers,
  sortWynikiGrupy,
} = require("../utils/sortUtils");
const {
  determineMaxAndRound,
  outFromGroup2,
  outFromGroup,
  outFromGroup3,
  outFromGroup32,
  outFromGroup35,
  outFromGroup4,
  outFrom4Group,
} = require("../utils/roundUtils");

const finishGroup = async (idzawodow, id, nrgrupy, typ) => {
  let wynikiGrupy = [];
  const free = await playerRepository.getFree();
  const mecze = await matchRepository.getMatchesByGroupId(id);
  mecze.forEach((mecz) => {
    wynikiGrupy = podliczMecz(wynikiGrupy, mecz);
    if (!isValidMatch(mecz)) {
      throw new Error(`Invalid match: ${mecz._id}`);
    }
  });
  wynikiGrupy = await podliczWynikiGrupy(wynikiGrupy, id, mecze);
  if (typ === 1) {
    await handleGroupTypeOne(wynikiGrupy, nrgrupy, idzawodow, free);
  } else {
    await handleGroupTypeOther(wynikiGrupy, idzawodow);
  }
  return { success: true };
};

const handleGroupTypeOne = async (wynikiGrupy, nrgrupy, idzawodow, free) => {
  if (wynikiGrupy.length < 4) {
    const wolne = 4 - wynikiGrupy.length;
    for (let i = 0; i < wolne; i++) {
      wynikiGrupy.push({
        id: free,
        miejsce: 4 - i,
      });
    }
  }

  await Promise.all(
    wynikiGrupy.map(async (wynik) => {
      const nextmatch = outFromGroup(nrgrupy - 1, wynik.miejsce - 1);
      const updateData = {
        $set: {
          [`player${nrgrupy % 2 === 0 ? "2" : "1"}id`]: wynik.id,
          player1sets: 0,
          player2sets: 0,
          saved: false,
        },
      };

      await matchRepository.updateMatch(
        idzawodow,
        nextmatch,
        "1/8",
        updateData
      );
    })
  );
};

const handleGroupTypeOther = async (wynikiGrupy, idzawodow) => {
  await Promise.all(
    wynikiGrupy.map(async (wynik) => {
      await matchRepository.saveResult(
        wynik.id,
        wynik.miejsce,
        new ObjectId(idzawodow)
      );
    })
  );
};

const finishAllGroups = async (idzawodow, groupOut) => {

  const grupy = await groupRepository.getGroupsByCompetitionId(idzawodow);
  const groupNo = grupy.length;
  const gru = [];
  const floatNumber = groupOut / groupNo;
  const integerValue = Number.isInteger(floatNumber)
    ? 99
    : Math.trunc(floatNumber);
   
  const free = await playerRepository.getFree();
  
  let limit = calculateLimit(floatNumber);
 
  await processGroups(grupy, gru, integerValue, limit, free);
  
  const groupedByMiejsce = groupByMiejsce(gru);
  const result = prepareResult(groupedByMiejsce);
  const wynikKoncowy = prepareWynikKoncowy(result, integerValue, free);
  const { max, runda } = determineMaxAndRound(wynikKoncowy.length, groupNo);
  await updateMatches(wynikKoncowy, max, runda, idzawodow, free, limit);

  return { success: true };
};

const getGroupsAndMatches = async (idzawodow) => {
  const zawodniki = await playerRepository.getAllPlayers();
  const grupy = await groupRepository.getGroupsByCompetitionId(idzawodow);
  const groupsid = grupy.map((grupa) => grupa._id);
  grupy.forEach((grupa) => {
    grupa.zawodnicy = grupa.zawodnicy.map((item) => {
      const zawodnik = zawodniki.find((zaw) => zaw._id.equals(item));
      return `${zawodnik.imie} ${zawodnik.nazwisko}`;
    });
  });
  const mecze = await matchRepository.getMatchesByGroupIds(groupsid);

  const meczeznaziwskami = addPlayerNamesToMatches(mecze, zawodniki);

  return [grupy, meczeznaziwskami];
};

const isValidMatch = (mecz) => {
  return mecz.player1sets === 3 || mecz.player2sets === 3;
};

const calculateLimit = (floatNumber) => {
  if (floatNumber === 2) return 4;
  else if (floatNumber === 3) return 6;
  else return 8;
};

const processGroups = async (grupy, gru, integerValue, limit, free) => {
  for (const grupa of grupy) {
    const mecze = await matchRepository.getMatchesByGroupId(grupa._id);
    let wynikiGrupy = [];
    mecze.forEach((mecz) => {
      wynikiGrupy = podliczMecz(wynikiGrupy, mecz);
      if (!isValidMatch(mecz)) {
        throw new Error(`Invalid match: ${mecz._id}`);
      }
    });
    wynikiGrupy = await podliczWynikiGrupy(
      wynikiGrupy,
      grupa._id,
      mecze,
      grupa.grupid
    );
    if (integerValue === 99 && wynikiGrupy.length < limit) {
      const wolne = limit - wynikiGrupy.length;
      for (let i = 0; i < wolne; i++) {
        wynikiGrupy.push({
          id: free,
          miejsce: limit - i,
          grupid: grupa.grupid,
        });
      }
    }
    gru.push(wynikiGrupy);
  }
};

const updateMatches = async (wynikKoncowy, max, runda, idzawodow, free, limit) => {
  if (wynikKoncowy.length < max) {
    const wolne = max - wynikKoncowy.length;
    for (let i = 0; i < wolne; i++) {
      wynikKoncowy.push(free);
    }
  }

  for (let index = 0; index < wynikKoncowy.length; index++) {
    const id = wynikKoncowy[index];
    let nextmatch;

    switch (max) {
      case 32:
        nextmatch = outFromGroup2(index);
        break;

      case 16:
        if (limit === 8) {
          nextmatch =
            groupNo === 2 ? outFromGroup32(index) : outFromGroup35(index);
        } else {
          nextmatch = outFromGroup3(index);
        }
        break;

      case 8:
        nextmatch = outFromGroup4(index);
        break;

      case 24:
        nextmatch = outFrom4Group(index);
        break;

      default:
        break;
    }
    await matchRepository.updateNextMatch(
      idzawodow,
      nextmatch,
      runda,
      id,
      index % 2 === 0 ? 0 : 1
    );
  }
};

const podliczWynikiGrupy = async (wynikiGrupy, id, mecze, grupid) => {
  let { wynikiGrupy: sortedWynikiGrupy, equal } = sortWynikiGrupy(
    wynikiGrupy,
    mecze
  );

  if (equal.length > 2) {
    const indexes1 = equal.map((item) => sortedWynikiGrupy.indexOf(item));
    const minIndex = Math.min(...indexes1);

    const rankid = await rankingRepository.findMainRanking();
    const ranks = await rankingRepository.getRankingPlayers(rankid[0]._id);

    const ratios = ranks.map((player) => ({
      playerid: player.playerid,
      ratio: player.winmatch / player.match,
    }));

    const sortedEqual = sortEqualPlayers(equal, ratios);
    sortedWynikiGrupy.splice(minIndex, equal.length, ...sortedEqual);
  }

  sortedWynikiGrupy = updateWynikiGrupyWithPlace(sortedWynikiGrupy, grupid);

  const { wygrane, sety, miejsca, zawodnicy } =
    extractResultArrays(sortedWynikiGrupy);

  await groupRepository.updateGroupResults(
    id,
    wygrane,
    sety,
    miejsca,
    zawodnicy
  );

  return sortedWynikiGrupy;
};

module.exports = {
  finishGroup,
  finishAllGroups,
  getGroupsAndMatches,
  podliczWynikiGrupy,
};
