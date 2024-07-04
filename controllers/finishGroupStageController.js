const { ObjectId } = require("mongodb");
const database = require("../services/db");
const db = database.client.db("zawody");
const { getFree } = require("../services/free");
require("dotenv").config();
const {
  podliczMecz,
  podliczWynikiGrupy,
  outFromGroup2,
  outFromGroup3,
  outFromGroup32,
  outFromGroup35,
  outFromGroup4,
  outFrom4Group,
} = require("../services/counting");

const handleFinish = async (req, res) => {
  try {
    console.log("body", req.body)
    const idzawodow = req.query.idzawodow;
    const groupOut = req.body[0];
    const grupy = await db
      .collection("grupy")
      .find({ idzawodow: new ObjectId(idzawodow) })
      .sort({ grupid: 1 })
      .toArray();

    const groupNo = grupy.length;
    const gru = [];
    let integerValue;
    ////////////          12/ 4
    const floatNumber = groupOut / groupNo;
    if (Number.isInteger(floatNumber)) {
      integerValue = 99;
    } else {
      integerValue = Math.trunc(floatNumber);
    }

    console.log("int", integerValue)
    console.log("float", floatNumber)

    const free = await getFree();
    let limit;

    const asyncTasks = grupy.map(async (grupa) => {
      const mecze = await db
        .collection("mecze")
        .find({ idgrupy: new ObjectId(grupa._id) })
        .toArray();
      let wynikiGrupy = [];

      mecze.map((mecz) => {
        wynikiGrupy = podliczMecz(wynikiGrupy, mecz);
        if (mecz.player1sets != 3 && mecz.player2sets != 3) {
          return res.status(203).json(res);
        }
      });
 
      wynikiGrupy = await podliczWynikiGrupy(
        wynikiGrupy,
        grupa._id,
        db,
        mecze,
        grupa.grupid
      );
 
      if (integerValue === 99) {
        if (floatNumber === 2) limit = 4;
        else if (floatNumber === 3) limit = 6;
        else {
          limit = 8;
        }
   
        if (wynikiGrupy.length < limit) {
          const wolne = limit - wynikiGrupy.length;
          for (let i = 0; i < wolne; i++) {
            wynikiGrupy.push({
              id: free,
              miejsce: limit - i,
              grupid: grupa.grupid,
            });
          }
        }
      }
      return gru.push(wynikiGrupy);
    });

    await Promise.all(asyncTasks);
    console.log("gru", gru)
    gru.forEach((subarray) => {
      const ile = subarray.length;
      subarray.forEach((item) => {
        item.count = ile;
      });
    });

    const groupedByMiejsce = {};

    gru.forEach((subarray) => {
      subarray.forEach((item) => {
        const miejsce = item.miejsce;
        if (!groupedByMiejsce[miejsce]) {
          groupedByMiejsce[miejsce] = [];
        }
        groupedByMiejsce[miejsce].push({
          id: item.id,
          sety: item.sety / (item.count - 1),
          wygrane: item.wygrane / (item.count - 1),
          grupid: item.grupid,
        });
      });
    });

   /////////////////////

    const result = Object.entries(groupedByMiejsce).map(([miejsce, items]) => ({
      miejsce: parseInt(miejsce),
      items: items.sort((a, b) => a.grupid - b.grupid),
    }));
    result.sort((a, b) => a.miejsce - b.miejsce);
    const wynikKoncowy = [];
    result.forEach((item) => {
      if (item.miejsce === integerValue + 1) {
        const granica = result[integerValue].items;
        granica.sort((a, b) => {
          if (a.wygrane !== b.wygrane) {
            return b.wygrane - a.wygrane;
          } else if (a.sety !== b.sety) {
            return b.sety - a.sety;
          }
          return a.grupid - b.grupid;
        });

        granica.forEach((wynik) => {
          wynikKoncowy.push(wynik.id);
        });
      } else {
        const array = item.items;
        array.forEach((wynik) => {
          wynikKoncowy.push(wynik.id);
        });
      }
    });
    let max;
    let runda;

    if (wynikKoncowy.length <= 8) {
      max = 8;
      runda = "1/2";
    } else if (wynikKoncowy.length <= 16) {
      max = 16;

      if (groupNo == 2) {
        runda = "1/2";
      } else {
        runda = "1/4";
      }
    } else if (wynikKoncowy.length <= 24 && groupNo == 4) {
      max = 24;
      runda = "1/4";
    } else {
      max = 32;
      runda = "1/8";
    }

    if (wynikKoncowy.length < max) {
      const wolne = max - wynikKoncowy.length;
      for (let i = 0; i < wolne; i++) {
        wynikKoncowy.push(free);
      }
    }

    await Promise.all(
      wynikKoncowy.map(async (id, index) => {
        let nextmatch;
        if (max === 32) {
          nextmatch = outFromGroup2(index);
        } else if (max === 16) {
          if (limit === 8) {
            if (groupNo == 2) {
              nextmatch = outFromGroup32(index);
            } else {
              nextmatch = outFromGroup35(index);
            }
          } else {
            nextmatch = outFromGroup3(index);
          }
        } else if (max === 8) {
          nextmatch = outFromGroup4(index);
        } else if (max === 24) {
          nextmatch = outFrom4Group(index);
        }

        if (index % 2 == 0) {
          await db.collection("mecze").findOneAndUpdate(
            {
              idzawodow: new ObjectId(idzawodow),
              idmeczu: nextmatch,
              round: runda,
            },
            { $set: { player2id: id, player2sets: 0 } }
          );
        } else {
          await db.collection("mecze").findOneAndUpdate(
            {
              idzawodow: new ObjectId(idzawodow),
              idmeczu: nextmatch,
              round: runda,
            },
            { $set: { player1id: id, player1sets: 0 } }
          );
        }
      })
    );
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleFinish };
