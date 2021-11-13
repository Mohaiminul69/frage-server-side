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
    const reviewsCollection = database.collection("reviews");

    // GET ALL PERFUMES
    app.get("/perfumes/:category", async (req, res) => {
      const category = req.params.category;
      let result;
      if (category === "all") {
        result = await perfumesCollection.find({}).toArray();
      } else {
        const query = { madeFor: category };
        result = await perfumesCollection.find(query).toArray();
      }
      res.json(result);
    });

    // GET SINGLE PERFUME WITH ID
    app.get("/purchase/:perfumeId", async (req, res) => {
      const id = req.params.perfumeId;
      const query = { _id: ObjectId(id) };
      const result = await perfumesCollection.findOne(query);
      res.json(result);
    });

    // GETTING SINGLE ORDER FROM USER
    app.get("/order/:perfumeId", async (req, res) => {
      const id = req.params.perfumeId;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
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
    // WAS USED FOR TESTING
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

    // GET ALL ORDER MADE BY USERS/CUSTOMERS
    app.get("/allOrders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    // CANCELING ORDERS FROM USERS
    app.delete("/cancelOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // APPROVING ORDER FOR SHIPPING
    app.put("/approveOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateStatus = req.body;
      const result = await orderCollection.updateOne(query, {
        $set: {
          status: updateStatus.status,
        },
      });
      res.send(result);
    });

    // ADDING REVIEWS
    app.post("/addReview", async (req, res) => {
      const product = req.body;
      const result = await reviewsCollection.insertOne(product);
      res.send(result);
    });

    // GETTING REVIEWS
    app.get("/getReviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
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
