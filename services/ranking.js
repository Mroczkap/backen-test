const { ObjectId } = require("mongodb");

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
    // If the object doesn't exist, add it to the array
    result.push(objectToUpdate);
  }

  return result;
};

module.exports = {
  addtorankingarray,
};
