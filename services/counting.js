const { ObjectId } = require("mongodb");
require("dotenv").config();
const database = require("./db");
const db2 = database.client.db("druzyna");

const podliczWynikiGrupy = async (wynikiGrupy, id, db, mecze, grupid) => {
  const equal = [];

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
        if (!equal.includes(a)) {
          equal.push(a);
        }

        if (!equal.includes(b)) {
          equal.push(b);
        }

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

  if (equal.length > 2) {
    const indexes1 = equal.map((item) => wynikiGrupy.indexOf(item));
    const minIndex = Math.min(...indexes1);

    const rankid = await db2
      .collection("rankingi")
      .find({ opis: "Main" })
      .toArray();

    const collection = db2.collection("ranks");
    const ranks = await collection.find({ rankingid: rankid[0]._id }).toArray();
    const ratios = ranks.map((player) => ({
      playerid: player.playerid,
      ratio: player.winmatch / player.match,
    }));

    equal.sort((a, b) => {
      const ratioA = ratios.find((player) =>
        player.playerid.equals(a.id)
      ).ratio;
      const ratioB = ratios.find((player) =>
        player.playerid.equals(b.id)
      ).ratio;
      return ratioB - ratioA;
    });

    wynikiGrupy.splice(minIndex, equal.length, ...equal);
  }

  wynikiGrupy.map((wynik, index) => {
    wynik.miejsce = index + 1;
    wynik.grupid = grupid;
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
      set: mecz.player1sets - mecz.player2sets,
    },
    {
      id: mecz.player2id,
      set: mecz.player2sets - mecz.player1sets,
    },
  ];

  temp.map((t) => {
    const foundObject = wynikiGrupy.find((item) => item.id.equals(t.id));

    if (foundObject) {
      if (t.set > 0) {
        foundObject.wygrane++;
        foundObject.sety += t.set;
      } else {
        foundObject.sety += t.set;
      }
    } else {
      if (t.set > 0) {
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
//wychodiz 16 ale 8 grup
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
};

//wychodiz z 4 grup do 24
const outFrom4Group = (miejsce) => {
  const do14 = [
    1, 4, 3, 2, 4, 1, 2, 3, 5, 8, 7, 6, 8, 5, 6, 7, 9, 12, 11, 10, 12, 9, 10,
    11,
  ];
  return do14[miejsce];
};
//wychodzi 16
const outFromGroup2 = (miejsce) => {
  const out16 = [
    1, 8, 3, 5, 6, 4, 7, 2, 2, 7, 4, 6, 5, 3, 8, 1, 9, 16, 11, 13, 14, 12, 15,
    10, 10, 15, 12, 14, 13, 11, 16, 9,
  ];
  return out16[miejsce];
};
//wychodzi 8 ale wiecej niż 2 grupy
const outFromGroup3 = (miejsce) => {
  const out8 = [1, 4, 3, 2, 4, 1, 2, 3, 5, 8, 7, 6, 8, 5, 6, 7];
  return out8[miejsce];
};
//wychodzi 8 ale 2 grupy
const outFromGroup35 = (miejsce) => {
  const out8 = [1, 4, 3, 2, 2, 3, 4, 1, 5, 8, 7, 6, 6, 7, 8, 5];
  return out8[miejsce];
};

//wychodzi po 4 na ssekcje przy do 16 z 2 grup
const outFromGroup32 = (miejsce) => {
  const out8 = [1, 2, 2, 1, 3, 4, 4, 3, 5, 6, 6, 5, 7, 8, 8, 7];
  return out8[miejsce];
};

//wychodzi 4
const outFromGroup4 = (miejsce) => {
  const out4 = [1, 2, 2, 1, 3, 4, 4, 3];
  return out4[miejsce];
};

module.exports = {
  podliczMecz,
  podliczWynikiGrupy,
  outFromGroup,
  outFromGroup2,
  outFromGroup3,
  outFromGroup35,
  outFromGroup32,
  outFromGroup4,
  outFrom4Group,
};
