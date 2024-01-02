const {ObjectId } = require("mongodb");
const {podliczMecz, podliczWynikiGrupy} = require("../services/counting")
const database = require("../services/db");
const db = database.client.db('zawody')


const handleSave = async (req, res) => {
  try {
    
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

    mecze.map((mecz) => {
      wynikiGrupy = podliczMecz(wynikiGrupy, mecz);
    });

    await podliczWynikiGrupy(wynikiGrupy, idgr, db, mecze);

    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};
module.exports = { handleSave};
