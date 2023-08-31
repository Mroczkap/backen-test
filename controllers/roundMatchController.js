const { MongoClient, ObjectId } = require("mongodb");

const handleRoundMatch = async (req, res) => {
  try {
   
    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {useNewUrlParser: true}
    ).connect();
    const idzawodow = req.query.idzawodow;
    const db = mongoClient.db("zawody");
    const mecze = await db
      .collection("mecze")
      .find({ idzawodow: new ObjectId(idzawodow) })
      .sort({ idmeczu: 1 })
      .toArray();
    const db2 = mongoClient.db("druzyna");
    const zawodniki = await db2.collection("zawodnik").find({}).toArray();
    //podmiana id na imie i nazwisko w meczach 
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

    const adminDb = mongoClient.db('admin');
    const serverStatus = await adminDb.command({ serverStatus: 1 });
    const connections = serverStatus.connections;
    console.log('Number of open connections:', connections.current);
        
    mongoClient.close(true);

    const adminDb2 = mongoClient.db('admin');
    const serverStatus2 = await adminDb2.command({ serverStatus: 1 });
    const connections2 = serverStatus2.connections;
    console.log('Number of open connections:', connections2.current);
    
    res.status(200).json(mecze);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleRoundMatch };
