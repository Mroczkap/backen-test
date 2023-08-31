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
      {useNewUrlParser: true}
    ).connect();
    console.log(req.body);

    const db = mongoClient.db("druzyna");
    const db2 = mongoClient.db("zawody");

    console.log(req.body.zawodnicy);
    console.log(req.body.selectedGroup);
    let ids = req.body.zawodnicy;

    const records = await db
      .collection("zawodnik")
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

    const groups = createGroups(
      req.body.selectedGroup,
      records.length,
      records
    );
    const typ = req.body.selectedGroup == 8 ? 1 : 2;
    //typ = 1 - osiem grup sztywno
    //typ = 2 - inna liczba zmienna grup
    await db2
      .collection("turnieje")
      .insertOne({
        dataturneju: new Date(),
        nazwaturnieju: req.body.nazwa,
        liczbagrup: req.body.selectedGroup,
        zawodnicy: req.body.zawodnicy,
        typ: typ,
      })
      .then(async (result) => {
        console.log("Reeeee", result);
        console.log("grups", groups);
        const idzawodow = result.insertedId;
        let liczbameczy = 0;
        await createGroupMatches(db2, groups, idzawodow);
        if (records.length > 16) {
          liczbameczy = 16;
          await createround(db2, "1/8", liczbameczy, idzawodow);
        }
        if (records.length > 8) {
          liczbameczy = liczbameczy == 0 ? 8 : liczbameczy;
          await createround(db2, "1/4", liczbameczy, idzawodow);
        }
        liczbameczy = liczbameczy == 0 ? 4 : liczbameczy;
        await createround(db2, "1/2", liczbameczy, idzawodow);
        await createround(db2, "final", liczbameczy, idzawodow);
        await createResults(db2, idzawodow, records.length);
      });

    mongoClient.close(true);
    res.status(200).json(res);
  } catch (e) {
    res.send("Somethnig went wrong");
  }
};

module.exports = { handleCreate };
