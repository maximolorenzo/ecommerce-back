import express from "express";
import run from "./run.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import __dirname from "./utils.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import session from "express-session";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import { addLogger } from "./services/errors/logger.js";
import config from "./config/config.js";
import MongoStore from "connect-mongo";

const app = express();
app.use(addLogger);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoURI,
      dbName: config.mongoDBName,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      ttl: 15,
    }),
    secret: "123456",
    resave: true, // mantiene la session activa
    saveUninitialized: true, // guarda cualquier cosa asi sea vacio
  })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Proyecto back ecommerce",
      description: "Este es un proyecto para entregar de CoderHouse",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

const httpServer = app.listen(config.PORT, () => console.log("Listening..."));
const io = new Server(httpServer);
httpServer.on("error", () => console.log("ERROR"));
run(io, app);
