const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uhrrv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Database Connect hoise");

    const database = client.db("frage-perfume");
    const perfumesCollection = database.collection("perfumes");
    const orderCollection = database.collection("orders");

    // GET ALL PERFUMES
    app.get("/perfumes", async (req, res) => {
      const result = await perfumesCollection.find({}).toArray();
      res.json(result);
    });

    // GET SINGLE PERFUME WITH ID
    app.get("/purchase/:perfumeId", async (req, res) => {
      const id = req.params.perfumeId;
      const query = { _id: ObjectId(id) };
      const result = await perfumesCollection.findOne(query);
      res.json(result);
    });

    // ADD ORDER FROM USER
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // GET ORDERS BY USER EMAIL
    app.get("/myOrders/:email", async (req, res) => {
      const mail = req.params.email;
      const query = { email: mail };
      const orders = await orderCollection.find(query).toArray();
      res.json(orders);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Frage User!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
