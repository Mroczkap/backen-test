require("dotenv").config();
const database = require("../services/db");
const db = database.client.db('druzyna')



const getFree = async () => {
    const collection = db.collection("zawodnik");
    const results = await collection
      .find({ imie: "Wolny" })
      .toArray();
      return results[0]._id
}

module.exports = {
   getFree
    
}