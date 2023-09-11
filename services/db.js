const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();

module.exports = {
    client: client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }),
    connectToDB: async () => {
        try {
            await client.connect()
            console.log('connected!')
        } catch (err) {
            console.log('Err', err)
        }

    }
}