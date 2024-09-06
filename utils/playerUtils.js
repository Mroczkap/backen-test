const getPlayerName = (player) => 
    player ? `${player.imie} ${player.nazwisko}` : undefined;

const addPlayerNamesToMatches = (matches, players) => {
    matches.forEach(match => {
      const player1 = players.find(zaw => zaw._id.equals(match.player1id));
      const player2 = players.find(zaw => zaw._id.equals(match.player2id));
      match.player1name = getPlayerName(player1);
      match.player2name = getPlayerName(player2);
    });
    return matches; // Return for chaining, though the original array is modified
  };

  module.exports = { addPlayerNamesToMatches};