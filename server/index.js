import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { userRouter } from "./src/routes/userRoute.js";
import { productRouter } from "./src/routes/productRoute.js";
import { cartRouter } from "./src/routes/cartRoute.js";

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: [
    "https://mern-ecommerce-frontend-theta.vercel.app",
    "https://mern-ecommerce-frontend-git-main-victorchrollo14.vercel.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// parse data from client
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.JWT_PRIVATE_KEY));

// static files fetching
app.use("/product/ProductAssets", express.static("ProductAssets"));

app.get("/", (req, res) => {
  res.send("ok");
});

// routes
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);

const runServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to mongodb");
    app.listen(PORT, () => {
      console.log(`Server started on ${PORT}`);
    });
  } catch (err) {
    console.log(`error: ${err}`);
  }
};

runServer();
