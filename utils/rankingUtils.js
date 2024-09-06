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

const createUpdateObject = (player1id, player1sets, player2sets, sety, matchid, existingPair) => {
  const p1sets = player1id.equals(existingPair.player1id) ? player1sets : player2sets;
  const p2sets = player1id.equals(existingPair.player1id) ? player2sets : player1sets;
  
  return {
    $inc: {
      matchplayed: 1,
      p1match: p1sets > p2sets ? 1 : 0,
      p1sets: p1sets,
      p2match: p1sets > p2sets ? 0 : 1,
      p2sets: p2sets,
      setsplayed: sety,
    },
    $set: {
      match: [...existingPair.match, matchid.toString()],
    },
  };
};

const createNewPairObject = (player1id, player2id, player1sets, player2sets, sety, matchid) => {
  return {
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
};

module.exports = {
  createUpdateObject,
  createNewPairObject,
  addtorankingarray
};
