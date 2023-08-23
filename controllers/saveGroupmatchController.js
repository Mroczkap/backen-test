const { MongoClient, ObjectId } = require("mongodb");
const {podliczMecz, podliczWynikiGrupy} = require("../services/counting")

const handleSave = async (req, res) => {
  try {
    console.log("no jestem")
    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {}
    ).connect();
      console.log("body", req.body)
    const db = mongoClient.db("zawody");
    let id = req.body[0].toString();
    await db
      .collection("mecze")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { player1sets: req.body[1], player2sets: req.body[2] } }
      );
    let idgr = req.body[3].toString();
    let wynikiGrupy = [];

    const mecze = await db
      .collection("mecze")
      .find({ idgrupy: new ObjectId(idgr) })
      .toArray();

    console.log("mecze", mecze);

    mecze.map((mecz) => {
      wynikiGrupy = podliczMecz(wynikiGrupy, mecz);
    });
    console.log("sumaW", wynikiGrupy)
    await podliczWynikiGrupy(wynikiGrupy, idgr, db, mecze);

    mongoClient.close();
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleSave };
