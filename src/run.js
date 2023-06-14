import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import productsModel from "./dao/mongo/models/products.model.js";
import chatRouter from "./routes/chat.router.js";
import messagesModel from "./dao/mongo/models/messages.model.js";
import sessionRouter from "./routes/session.router.js";
import { passportCall } from "./utils.js";
import mockingProduct from "./routes/mocking.router.js";
import errorMidle from "./services/errors/errorMidle.js";
import __dirname from "./utils.js";
import userRouter from "./routes/user.router.js";
const run = (io, app) => {
  app.use("/api/session", sessionRouter);
  app.get("/", (req, res) => {
    res.redirect("/session/login");
  });
  app.use("/api/user", userRouter);
  app.use("/api/products", passportCall("jwt"), productRouter);
  app.use("/api/carts", cartRouter);
  app.use("/chat", chatRouter);

  app.use("/mockingproducts", mockingProduct);

  io.on("connection", async (socket) => {
    console.log("New cliente connected");

    const products = await productsModel.find().lean().exec();
    io.emit("socket01", products);

    socket.on("message", async (data) => {
      await messagesModel.create(data);
      const messages = await messagesModel.find().lean().exec();
      io.emit("logs", messages);
    });

    socket.on("deleteProduct", async (data) => {
      const value = await data;
      console.log(value);
      await productsModel.deleteOne({ _id: value });
    });
  });

  app.use(errorMidle);
};

export default run;
