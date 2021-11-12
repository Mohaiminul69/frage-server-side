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
    const usersCollection = database.collection("users");

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

    // CANCELING ORDER
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // POST USERS DATA
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // UPDATE USER DATA
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // MAKING ADMIN FROM EXISTING USERS
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // CHECKING IF THE USER IS ADMIN OR NOT
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // ADDING NEW PRODUCT
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await perfumesCollection.insertOne(product);
      res.send(result);
    });

    // GET ALL PRODUCTS
    app.get("/allProducts", async (req, res) => {
      const result = await perfumesCollection.find({}).toArray();
      res.json(result);
    });

    // DELETING PRODUCT
    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await perfumesCollection.deleteOne(query);
      res.send(result);
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
