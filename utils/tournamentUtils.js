const createGroups = (groupsno, contestno, zawodnicy) => {
    let x = contestno; // liczba zawodników
    let y = groupsno; // liczba grup
  
    let wynik;
    const groups = [];
    //pętlna dla y grup
    for (let i = 1; i <= y; i++) {
      const grupa = [];
  
      grupa.push(zawodnicy[i - 1]._id);
      for (let j = 2; j <= x; j++) {
        if (j % 2 == 0) {
          wynik = j * y - i + 1;
          if (wynik > x) break;
          grupa.push(zawodnicy[wynik - 1]._id);
        } else {
          wynik = (j - 1) * y + i;
          if (wynik > x) break;
          grupa.push(zawodnicy[wynik - 1]._id);
        }
      }
      groups.push(grupa);
    }
    return groups;
  };
  
  const determineTournamentType = (groupCount, playerCount) => {
    if (groupCount === 8) return 1; // stały tryb
    if (playerCount > 17) return 2; // grupowo pucharowy wychodzi 16
    if (groupCount === 1) return 4; // stały jedna grupa każdy-z-każdym
    return 3; // grupowo pucharowy wychodzi 8 lub 4
  };
  
  const calculateMatchCount = (playerCount) => {
       if (playerCount > 16) {
      return 16;
    } else if (playerCount > 8) {
      return 8;
    } else {
      return 4;
    }
  };
  
  const formatTournamentDate = (tournament) => {
    const date = tournament.dataturneju;
    tournament.data = `[${date.getDate()}-${date.getMonth() + 1}]`;
    return tournament;
  };
  
  const generateGroupMatches = (group) => {
    const n = group.length;
    let rounds = [];
  
    // If the number of players is odd, add a dummy player
    let participants = [...group];
    if (n % 2 !== 0) {
      participants.push(null); // dummy player
    }
  
    const half = participants.length / 2;
  
    for (let round = 0; round < participants.length - 1; round++) {
      const roundMatches = [];
  
      for (let i = 0; i < half; i++) {
        const player1 = participants[i];
        const player2 = participants[participants.length - 1 - i];
  
        if (player1 !== null && player2 !== null) {
          roundMatches.push([player1, player2]);
        }
      }
  
      // Rotate participants but keep the first player fixed
      participants = [
        participants[0],
        ...participants.slice(-1),
        ...participants.slice(1, -1),
      ];
  
      rounds.push(...roundMatches);
    }
  
    return rounds;
  };
  
  module.exports = {
    createGroups,
    determineTournamentType,
    calculateMatchCount,
    formatTournamentDate,
    generateGroupMatches
  };