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

    const userCollection = client.db("flix-verse").collection("users");

    //   add to watch list
    app.post("/addWatchList", async (req, res) => {
      const { email, data } = req.body;
      const existUser = await userCollection.findOne({ email: email });
      if (existUser) {
        const { likedMovies } = existUser;
        const movieAlreadyExist = likedMovies.find(({ id }) => id === data.id);
        if (!movieAlreadyExist) {
          const result = await userCollection.updateOne(
            { email: email },
            { $push: { likedMovies: data } }
          );
          res.send(result);
        } else {
          res.send("Movie already exists");
        }
      } else {
        const result = await userCollection.insertOne({
          email: email,
          likedMovies: [data],
        });
        res.send(result);
      }
    });

    //   get watch list
    app.get("/getWatchList/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      if (user) {
        return res.json({ msg: "success", movies: user.likedMovies });
      } else {
        return res.json({ msg: "User Not Found" });
      }
    });

    // delete from watch list
    app.put("/deleteWatchList", async (req, res) => {
      const { email, movieId } = req.body;
      const user = await userCollection.findOne({ email: email });
      if (user) {
        const movies = user.likedMovies;
        const movieIndex = movies.findIndex(({ id }) => id === movieId);
        if (!movieIndex) {
          res.status(400).send({ msg: "Movie not found." });
        }
        movies.splice(movieIndex, 1);
        // await userCollection.findByIdAndUpdate(
        //   user._id,
        //   {
        //     likedMovies: movies,
        //   },
        //   { new: true }
        // );
        await userCollection.findOneAndUpdate(
          { _id: user._id },
          { $set: { likedMovies: movies } },
          { new: true }
        );

        return res.json({ msg: "Movie successfully removed.", movies });
      } else return res.json({ msg: "User with given email not found." });
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
