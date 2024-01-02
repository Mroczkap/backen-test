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

const createGroupMatches = async (db, groups, idzawodow) => {
  let grupid = 0;
  groups.forEach(async (group) => {
    grupid++;
    const array = [];
    for (let j = 0; j < group.length; j++) {
      array.push(0);
    }

    await db
      .collection("grupy")
      .insertOne({
        grupid: grupid,
        idzawodow: idzawodow,
        zawodnicy: group,
        wygrane: array,
        sety: array,
        miejsce: array,
      })
      .then(async (result) => {
        //tworzenie meczu kazdy z kadnym w grupie
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            await db.collection("mecze").insertOne({
              idzawodow: idzawodow,
              idgrupy: result.insertedId,
              player1id: group[i],
              player2id: group[j],
              player1sets: 0,
              player2sets: 0,
              inprogress: false,
            });
          }
        }
      });
  });
};

const createround = async (db, round, liczbameczy, idzawodow) => {
  for (let i = 0; i < liczbameczy; i++) {
    await db.collection("mecze").insertOne({
      idzawodow: idzawodow,
      round: round,
      idmeczu: i + 1,
      player1id: "",
      player2id: "",
      player1sets: 0,
      player2sets: 0,
      inprogress: false,
    });
  }
};

const createResults = async (db, idzawodow, liczbazawodników) => {
  for (let i = 0; i < liczbazawodników; i++) {
    await db.collection("wyniki").insertOne({
      idzawodow: idzawodow,
      idzawodnika: "",
      miejsce: i + 1,
    });
  }
};

module.exports = {
  createResults,
  createround,
  createGroupMatches,
  createGroups,
};
