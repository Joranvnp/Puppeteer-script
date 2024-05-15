import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const url = process.env.MONGODB_URL;

const dbName = process.env.MONGODB_DB;

const client = new MongoClient(url);

async function writeDB(products) {
  try {
    await client.connect();

    const db = client.db(dbName);

    const collection = db.collection("products");

    await collection.insertMany(products);

    console.log("Produits insérés dans la base de données");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export default writeDB;
