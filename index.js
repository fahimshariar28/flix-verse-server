const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_ID}:${process.env.DB_PASS}@cluster0.6txwjll.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const watchList = client.db("flix-verse").collection("watchList");

    app.post("/addLikedMovie", async (req, res) => {
      //   check if movie already exists
      const movie = req.body;
      const query = { email: movie.email, movieId: movie.movieId };
      const result = await likedMovies.find(query).toArray();
      if (result.length > 0) {
        res.send("Movie already exists");
      } else {
        const result = await likedMovies.insertOne(movie);
        res.send(result);
      }
    });
    //   add to watch list
    app.post("/addWatchList", async (req, res) => {
      //   check if movie already exists
      const movie = req.body;
      const query = { email: movie.email, movieId: movie.movieId };
      const result = await watchList.find(query).toArray();
      if (result.length > 0) {
        res.send("Movie already exists");
      } else {
        const result = await watchList.insertOne(movie);
        res.send(result);
      }
    });

    //   get watch list
    app.get("/getWatchList/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await watchList.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Flix Verse is running!");
});

app.listen(port, () => {
  console.log(`Flix Verse is running at http://localhost:${port}`);
});
