const { MongoClient, ObjectId } = require("mongodb");
// import dotenv from 'dotenv';
// dotenv.config();
const uri =
  "mongodb+srv://mroczkapawel:shHRikMiMqs7gYdV@cluster0.0hcmknt.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);
const options = {};

const handleWyniki = async (req, res) => {
  const mongoClient = await new MongoClient(uri, options).connect();
  // console.log(mongoClient);
  //mongoClient.db("admin").command({ ping: 1 });
  console.log("Just Connected!");
 
    try {
      const db = mongoClient.db("zawody");
      const collection = db.collection("wyniki");
      const wyniki = await collection
        .find({ idzawodow: new ObjectId(req.query.idzawodow) })
        .sort({ miejsce: 1 })
        .toArray();
  
      const db2 = mongoClient.db("druzyna");
      const zawodniki = await db2.collection("zawodnik").find({}).toArray();
  
      // console.log("zawodniki", zawodniki)
      // console.log(mecze);
      wyniki.map((wynik) => {
        let zawodnik = zawodniki.find((zaw) => zaw._id.equals(wynik.idzawodnika));
  
        if (zawodnik) {
          wynik.imie = zawodnik.imie;
          wynik.nazwisko = zawodnik.nazwisko;
        }
      });
  
      res.status(200).json(wyniki);
    } catch (e) {
      res.send("Somethnig went wrong");
    }
  
};

module.exports = { handleWyniki };
