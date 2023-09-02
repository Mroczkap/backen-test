const { MongoClient, ObjectId } = require("mongodb");
const {
  podliczMecz,
  podliczWynikiGrupy,
  outFromGroup,
} = require("../services/counting");

const { saveResults } = require("../services/nextMatch");

const handleFinish = async (req, res) => {
  try {
    const mongoClient = await new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    }).connect();

    const idzawodow = req.query.idzawodow;
    console.log("idzaw", idzawodow)
    const typ = req.body[2];
    console.log("typ", typ);
    const id = req.body[0].toString();
    const nrgrupy = req.body[1];
    let wynikiGrupy = [];

    const db = mongoClient.db("zawody");
    const mecze = await db
      .collection("mecze")
      .find({ idgrupy: new ObjectId(id) })
      .toArray();

    mecze.map((mecz) => {
      wynikiGrupy = podliczMecz(wynikiGrupy, mecz);

      // if (mecz.player1sets != 3 && mecz.player2sets != 3){
      //   console.log("jestem", mecz)
      // mongoClient.close(true);
      // res.status(203).json(res);
      // }
    });

    wynikiGrupy = await podliczWynikiGrupy(wynikiGrupy, id, db, mecze);
    if (typ === 1) {
      if (wynikiGrupy.length < 4) {
        const wolne = 4 - wynikiGrupy.length;
        for (let i = 0; i < wolne; i++) {
          wynikiGrupy.push({
            id: new ObjectId("64d6154e509bb85987990033"),
            miejsce: 4 - i,
          });
        }
      }
      await Promise.all(
        wynikiGrupy.map(async (wynik) => {
          const nextmatch = outFromGroup(nrgrupy - 1, wynik.miejsce - 1);

          if (nrgrupy % 2 == 0) {
            await db.collection("mecze").findOneAndUpdate(
              {
                idzawodow: new ObjectId(idzawodow),
                idmeczu: nextmatch,
                round: "1/8",
              },
              {
                $set: {
                  player2id: wynik.id,
                  player2sets: 0,
                  saved: false,
                  player1sets: 0,
                },
              }
            );
          } else {
            await db.collection("mecze").findOneAndUpdate(
              {
                idzawodow: new ObjectId(idzawodow),
                idmeczu: nextmatch,
                round: "1/8",
              },
              {
                $set: {
                  player1id: wynik.id,
                  player1sets: 0,
                  saved: false,
                  player2sets: 0,
                },
              }
            );
          }
        })
      );
    } else {
      console.log("wyniki grupy, ", wynikiGrupy);

      await Promise.all(
        wynikiGrupy.map(async(wynik) => {
          await saveResults(db, wynik.id, wynik.miejsce, new ObjectId(idzawodow));
        })
      );
    }

    mongoClient.close(true);
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleFinish };
