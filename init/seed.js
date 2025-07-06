require("dotenv").config();
console.log("MAP_TOKEN:", process.env.MAP_TOKEN); // ⬅️ Add this line

if (!process.env.MAP_TOKEN) {
  throw new Error("❌ MAP_TOKEN is missing from .env or not loading.");
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data: sampleListings } = require("./data");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ Connected to MongoDB");
});

const seedDB = async () => {
  await Listing.deleteMany({});
  console.log("🧹 Deleted all old listings");

  for (let item of sampleListings) {
    try {
      const geoData = await geocoder.forwardGeocode({
        query: item.location,
        limit: 1,
      }).send();

      if (!geoData.body.features.length) {
        console.log(`⚠️ Skipped ${item.title} — location not found`);
        continue;
      }

      const listing = new Listing({
        ...item,
        geometry: geoData.body.features[0].geometry,
        owner: "64e79be9acb2463601234567", // ← Replace with a valid user ID in your DB
      });

      await listing.save();
      console.log(`✅ Saved: ${listing.title}`);
    } catch (err) {
      console.error(`❌ Error for ${item.title}:`, err.message);
    }
  }

  mongoose.connection.close();
  console.log("🌱 Finished seeding and closed DB connection");
};

seedDB();
