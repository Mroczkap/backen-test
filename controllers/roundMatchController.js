const { MongoClient, ObjectId } = require("mongodb");
// import dotenv from 'dotenv';
// dotenv.config();
const uri =
  "mongodb+srv://mroczkapawel:shHRikMiMqs7gYdV@cluster0.0hcmknt.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);
const options = {};

const handleRoundMatch = async (req, res) => {
  const mongoClient = await new MongoClient(uri, options).connect();
  // console.log(mongoClient);
  //mongoClient.db("admin").command({ ping: 1 });
  console.log("Just Connected!");
 
    try {
      const idzawodow = req.query.idzawodow;
  
      const db = mongoClient.db("zawody");
      const mecze = await db
        .collection("mecze")
        .find({ idzawodow: new ObjectId(idzawodow) })
        .sort({ idmeczu: 1 })
        .toArray();
      const db2 = mongoClient.db("druzyna");
      const zawodniki = await db2
        .collection("zawodnik")
        .find({})
  
        .toArray();
  
      // console.log("zawodniki", zawodniki)
      // console.log(mecze);
      mecze.map((mecz) => {
        let zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player1id));
  
        if (zawodnik) {
          mecz.player1name = zawodnik.imie + " " + zawodnik.nazwisko;
        }
        zawodnik = zawodniki.find((zaw) => zaw._id.equals(mecz.player2id));
        if (zawodnik) {
          mecz.player2name = zawodnik.imie + " " + zawodnik.nazwisko;
        }
      });
      // console.log("newwwww", mecze)
  
      res.status(200).json(mecze);
   
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleRoundMatch };
