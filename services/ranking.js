const { ObjectId } = require("mongodb");
require("dotenv").config();
const database = require("./db");
const db2 = database.client.db("druzyna");

const addtorankingarray = (result, playerid, sety, playersets, iswin) => {
  const objectToUpdate = {
    playerid: playerid,
    sets: sety,
    winsets: playersets,
    match: 1,
    winmatch: iswin,
  };

  const index = result.findIndex((element) =>
    element.playerid.equals(playerid)
  );

  if (index !== -1) {
    result[index].sets += objectToUpdate.sets;
    result[index].winsets += objectToUpdate.winsets;
    result[index].match += objectToUpdate.match;
    result[index].winmatch += objectToUpdate.winmatch;
  } else {
    result.push(objectToUpdate);
  }

  return result;
};

const addtopair = async (
  matchid,
  player1sets,
  player2sets,
  player1id,
  player2id,
  sety
) => {
  const collection = db2.collection("pary");
  const filter = {
    $or: [
      { $and: [{ player1id: player1id }, { player2id: player2id }] },
      { $and: [{ player1id: player2id }, { player2id: player1id }] },
    ],
  };
  const ranks = await collection.find(filter).toArray();

  const field = {
    player1id: player1id,
    player2id: player2id,
    matchplayed: 1,
    p1match: player1sets > player2sets ? 1 : 0,
    p1sets: player1sets,
    p2match: player1sets > player2sets ? 0 : 1,
    p2sets: player2sets,
    setsplayed: sety,
    match: ["", matchid.toString()],
  };
  if (ranks.length > 0) {
    const mecze = ranks[0].match;

    const index = mecze.indexOf(matchid.toString());

    if (index == -1) {
      mecze.push(matchid.toString());
      let p1sets = 0;
      let p2sets = 0;

      if (player1id.equals(ranks[0].player1id)) {
        p1sets = player1sets;
        p2sets = player2sets;
      } else {
        p1sets = player2sets;
        p2sets = player1sets;
      }

      await collection.findOneAndUpdate(filter, {
        $inc: {
          matchplayed: 1,
          p1match: p1sets > p2sets ? 1 : 0,
          p1sets: p1sets,
          p2match: p1sets > p2sets ? 0 : 1,
          p2sets: p2sets,
          setsplayed: sety,
        },
        $set: {
          match: mecze,
        },
      });
    }
  } else {
    await collection.insertOne(field);
  }
};

module.exports = {
  addtorankingarray,
  addtopair,
};
