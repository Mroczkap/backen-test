const { ObjectId } = require("mongodb");
const database = require("../services/db");
const db = database.client.db("zawody");
const {getFree} = require('../services/free')
require("dotenv").config();
const {
  podliczMecz,
  podliczWynikiGrupy,
  outFromGroup2,
  outFromGroup3,
  outFromGroup4,
} = require("../services/counting");

const handleFinish = async (req, res) => {
  try {
   
   
  
    const idzawodow = req.query.idzawodow;
    const groupOut = req.body[0];

    // const db = mongoClient.db("zawody");
    const grupy = await db
      .collection("grupy")
      .find({ idzawodow: new ObjectId(idzawodow) })
      .sort({ grupid: 1 })
      .toArray();

    console.log("G", grupy);
    const groupNo = grupy.length;
    const gru = [];
    console.log(groupOut);
    console.log(groupNo);
    // console.log(gru);
    let integerValue;

    const floatNumber = groupOut / groupNo;
    if (Number.isInteger(floatNumber)) {
      integerValue = 99;
    } else {
      integerValue = Math.trunc(floatNumber);
    }

    console.log(integerValue);
    const free = await getFree();
    
    
    
    const asyncTasks = grupy.map(async (grupa) => {
      console.log("grupka", grupa._id);
      const mecze = await db
        .collection("mecze")
        .find({ idgrupy: new ObjectId(grupa._id) })
        .toArray();
      let wynikiGrupy = [];

      mecze.map((mecz) => {
        wynikiGrupy = podliczMecz(wynikiGrupy, mecz);
        if (mecz.player1sets != 3 && mecz.player2sets != 3) {
          // Close the client and send response inside this condition
          // mongoClient.close(true);
          return res.status(203).json(res);
        }
      });
     

    
      
      // Convert the array of bytes to a string
     

      wynikiGrupy = await podliczWynikiGrupy(
        wynikiGrupy,
        grupa._id,
        db,
        mecze,
        grupa.grupid
      );
      if (integerValue === 99) {
        let limit;
        floatNumber === 2 ? (limit = 4) : (limit = 8);
console.log("limit", limit)

        if (wynikiGrupy.length < limit) {
          const wolne = limit - wynikiGrupy.length;
          console.log("wolne",wolne)
          for (let i = 0; i < wolne; i++) {
            console.log(free)
            wynikiGrupy.push({
              id: free,
              miejsce: limit - i,
              grupid: grupa.grupid
            });
          }
        }
      }

      return gru.push(wynikiGrupy);
    });

    // Wait for all promises to resolve
    await Promise.all(asyncTasks);

  

    gru.forEach((subarray) => {
      const ile = subarray.length;
      subarray.forEach((item) => {
        item.count = ile;
      });
    });

    console.log("gru",gru);

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

    const result = Object.entries(groupedByMiejsce).map(([miejsce, items]) => ({
      miejsce: parseInt(miejsce), // Convert to number
      items: items.sort((a, b) => a.grupid - b.grupid), // Sort items by grupid
    }));

    // Sort the result array based on miejsce value
    result.sort((a, b) => a.miejsce - b.miejsce);

    console.log("hmm", result);

    //console.log(granica);
    const wynikKoncowy = [];
    //console.log("test", result[0]);

    result.forEach((item) => {
      if (item.miejsce === integerValue + 1) {
        console.log("mscs", item.miejsce);
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
          console.log("...", wynik.id, item.miejsce);
          wynikKoncowy.push(wynik.id);
        });
      } else {
        console.log("elsemscs", item.miejsce);
        const array = item.items;
        console.log("array", array);
        array.forEach((wynik) => {
          console.log("e...", wynik.id, item.miejsce);
          wynikKoncowy.push(wynik.id);
        });
      }
    });
    console.log("ide sobie w pizud");
    console.log("wynkoncowy", wynikKoncowy);

    let max;
    let runda;

    if (wynikKoncowy.length <= 8) {
      max = 8;
      runda = "1/2";
    } else if (wynikKoncowy.length <= 16) {
      max = 16;
      runda = "1/4";
    } else {
      max = 32;
      runda = "1/8";
    }
    console.log("runda", runda);
    console.log("max", max);

    if (wynikKoncowy.length < max) {
      const wolne = max - wynikKoncowy.length;
      for (let i = 0; i < wolne; i++) {
        wynikKoncowy.push(free);
      }
    }

    console.log("wk after los", wynikKoncowy);

    await Promise.all(
      wynikKoncowy.map(async (id, index) => {
        console.log(".......", id, index);
        let nextmatch;
        if (max === 32) {
          nextmatch = outFromGroup2(index);
        } else if (max === 16) {
          nextmatch = outFromGroup3(index);
        } else if (max === 8) {
          nextmatch = outFromGroup4(index);
        }

        console.log(nextmatch);
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

    // mongoClient.close(true);
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleFinish };
