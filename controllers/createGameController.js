const { MongoClient, ObjectId } = require("mongodb");
const {
  createGroups,
  createGroupMatches,
  createround,
  createResults,
} = require("../services/create");

const handleCreate = async (req, res) => {
  try {

    const mongoClient = await new MongoClient(
      process.env.MONGODB_URI,
      {}
    ).connect();
    console.log(req.body);

   
    const db = mongoClient.db("druzyna");
    const db2 = mongoClient.db("zawody");

    console.log(req.body.zawodnicy);
    let ids = req.body.zawodnicy;

    const records = await db.collection("zawodnik")
      .find({
        _id: {
          $in: ids.map(function (id) {
            return new ObjectId(id);
          }),
        },
      })
      .sort({ ranking: -1 })
      .toArray();
    console.log("recorduno", records[0]._id);

    const groups = createGroups(8, records.length, records);

    await db2
      .collection("turnieje")
      .insertOne({
        dataturneju: new Date(),
        nazwaturnieju: req.body.nazwa,
        liczbagrup: 8,
        zawodnicy: req.body.zawodnicy,
      })
      .then(async (result) => {
        console.log("Reeeee",result)
      console.log("grups",groups)
      const idzawodow = result.insertedId;
       await createGroupMatches(db2, groups, idzawodow);
        await createround(db2,"1/8", 16, idzawodow);
        await createround(db2, "1/4", 16, idzawodow);
        await createround(db2, "1/2", 16, idzawodow);
        await createround(db2, "final", 16, idzawodow);
        await createResults(db2, idzawodow, records.length);
      });
      
     mongoClient.close();
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleCreate };
