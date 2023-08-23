
const { ObjectId } = require("mongodb");

const podliczWynikiGrupy = async (wynikiGrupy, id, db, mecze) => {
  wynikiGrupy.sort((a, b) => {
    if (b.wygrane - a.wygrane < 0) {
      return -1;
    }
    if (b.wygrane - a.wygrane > 0) {
      return 1;
    }
    if (b.wygrane - a.wygrane == 0) {
      if (b.sety - a.sety < 0) {
        return -1;
      }
      if (b.sety - a.sety > 0) {
        return 1;
      }
      if (b.sety - a.sety == 0) {
        const foundmecz = mecze.find(
          (item) =>
            (item.player1id.equals(b.id) || item.player2id.equals(b.id)) &&
            (item.player1id.equals(a.id) || item.player2id.equals(a.id))
        );

        if (b.id.equals(foundmecz.player1id) && foundmecz.player1sets == 3)
          return 1;

        if (b.id.equals(foundmecz.player2id) && foundmecz.player2sets == 3)
          return 1;
        if (a.id.equals(foundmecz.player1id) && foundmecz.player1sets == 3)
          return -1;
        if (a.id.equals(foundmecz.player2id) && foundmecz.player2sets == 3)
          return -1;
      }
    }
  });

  wynikiGrupy.map((wynik, index) => {
    wynik.miejsce = index + 1;
  });

  const wygrane = [];
  const sety = [];
  const miejsca = [];
  const zawodnicy = [];
  wynikiGrupy.map((wynik) => {
    wygrane.push(wynik.wygrane);
    sety.push(wynik.sety);
    miejsca.push(wynik.miejsce);
    zawodnicy.push(wynik.id);
  });

  console.log("WWWW", wygrane, zawodnicy)

  await db.collection("grupy").findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        wygrane: wygrane,
        sety: sety,
        miejsce: miejsca,
        zawodnicy: zawodnicy,
      },
    }
  );

  return wynikiGrupy;
};

const podliczMecz = (wynikiGrupy, mecz) => {
  const temp = [
    {
      id: mecz.player1id,
      set: mecz.player1sets,
    },
    {
      id: mecz.player2id,
      set: mecz.player2sets,
    },
  ];

  temp.map((t) => {
    const foundObject = wynikiGrupy.find((item) => item.id.equals(t.id));

    if (foundObject) {
      if (t.set == 3) {
        foundObject.wygrane++;
        foundObject.sety += 3;
      } else {
        foundObject.sety += t.set;
      }
    } else {
      if (t.set == 3) {
        wynikiGrupy.push({
          id: t.id,
          wygrane: 1,
          sety: t.set,
        });
      } else {
        wynikiGrupy.push({
          id: t.id,
          wygrane: 0,
          sety: t.set,
        });
      }
    }
  });
  return wynikiGrupy;
};

const outFromGroup = (groupId, miejsce) => {
    const do18 = [
      [1, 8, 9, 16],
      [8, 1, 16, 9],
      [6, 3, 14, 11],
      [3, 6, 11, 14],
      [4, 5, 12, 13],
      [5, 4, 13, 12],
      [2, 7, 10, 15],
      [7, 2, 15, 10],
    ];
    return do18[groupId][miejsce];
  }

module.exports = {podliczMecz, podliczWynikiGrupy, outFromGroup}