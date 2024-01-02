const { ObjectId } = require("mongodb");

const selectRound = (round, idmeczu) => {
  let match;
  switch (round) {
    case "1/4":
      match = do14(idmeczu);
      break;
    case "1/2":
      match = do12(idmeczu);
      break;
    case "final":
      match = dofinalu(idmeczu);
      break;
    case "wyniki":
      match = final(idmeczu);
      break;
    default:
      console.log(`Sorry, we are out of ${expr}.`);
  }

  return match;
};

const do14 = (idmeczu) => {
  let dodatek = 0;
  if (idmeczu > 8) {
    dodatek = 8;
    idmeczu = idmeczu - dodatek;
  }
  if (idmeczu % 2 == 0) {
    return [2, idmeczu / 2 + dodatek, idmeczu / 2 + 4 + dodatek];
  } else {
    return [1, (idmeczu + 1) / 2 + dodatek, (idmeczu + 1) / 2 + 4 + dodatek];
  }
};

const do12 = (idmeczu) => {
  let dodatek;
  if (idmeczu % 4 == 0) {
    dodatek = (idmeczu / 4 - 1) * 4;
  } else {
    dodatek = idmeczu - (idmeczu % 4);
  }

  if (idmeczu % 2 == 0) {
    return [
      2,
      (idmeczu - dodatek) / 2 + dodatek,
      (idmeczu - dodatek) / 2 + 2 + dodatek,
    ];
  } else {
    return [
      1,
      (idmeczu - dodatek + 1) / 2 + dodatek,
      (idmeczu - dodatek + 1) / 2 + 2 + dodatek,
    ];
  }
};

const dofinalu = (idmeczu) => {
  [0, 1];

  if (idmeczu % 2 == 0) {
    return [2, idmeczu - 1, idmeczu];
  } else {
    return [1, idmeczu, idmeczu + 1];
  }
};

const final = (idmeczu) => {
  return [-1, 2 * idmeczu - 1, 2 * idmeczu];
};

const player1nextMatch = async (
  collecion,
  idzawodow,
  idmeczu,
  runda,
  wynik
) => {
  await collecion.findOneAndUpdate(
    {
      idzawodow: new ObjectId(idzawodow),
      idmeczu: idmeczu,
      round: runda,
    },
    { $set: { player1id: wynik } }
  );
};

const player2nextMatch = async (
  collecion,
  idzawodow,
  idmeczu,
  runda,
  wynik
) => {
  await collecion.findOneAndUpdate(
    {
      idzawodow: new ObjectId(idzawodow),
      idmeczu: idmeczu,
      round: runda,
    },
    { $set: { player2id: wynik } }
  );
};

const saveResults = async (db, idzawodnika, miejsce, idzawodow) => {
  const result = await db.collection("wyniki").findOneAndUpdate(
    {
      idzawodow: idzawodow,
      miejsce: miejsce,
    },
    { $set: { idzawodnika: idzawodnika } }
  );

  return result;
};

module.exports = {
  selectRound,
  player1nextMatch,
  player2nextMatch,
  saveResults,
};
