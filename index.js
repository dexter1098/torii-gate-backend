require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const PORT = process.env.PORT || 3000;
const userRouter = require("./routes/userRouter");
const propertyRouter = require("./routes/PropertyRouter");
//middleware
app.use(express.json());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { filrSize: 10 * 1024 * 1024 },
  })
);

// cloudinary cofig
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Torii Gate Server" });
});

app.use("/api/auth", userRouter);
app.use("/api/property", propertyRouter);

// error route
app.use((req, res) => {
  res.status(404).json({ success: false, message: "ROUTE NOT FOUND" });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: "toriigate" });
    app.listen(PORT, () => {
      console.log(`App Running on port : ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
