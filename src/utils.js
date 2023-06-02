import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";
import bcrypt, { hashSync } from "bcrypt";
import config from "./config/config.js";
import { faker } from "@faker-js/faker";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;

export const generateToken = (user) => {
  const token = jwt.sign({ user }, config.jwtPrivateKey, { expiresIn: "24h" });

  return token;
};

//ve si existe el token de la cookie y si esta aturizado

export const authToken = (req, res, next) => {
  const token = req.cookies[config.jwtCookieName];
  if (!token)
    return res.status(401).render("errors/base", { error: "Not Auth" });

  jwt.verify(token, jwtPrivateKey, (error, credentials) => {
    if (error)
      return res.status(403).render("errors/base", { error: "Not authorizad" });

    req.user = credentials.user;
    next();
  });
};

//extrae la cokkie
export const extractCookie = (req) => {
  return req && req.cookies ? req.cookies[config.jwtCookieName] : null;
};

export const createHash = (password) => {
  return bcrypt, hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const validateToken = (token) => {
  return jwt.verify(token, config.jwtPrivateKey, function (err, decoded) {
    return {
      err,
      decoded,
    };
  });
};
export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);
      console.log("passportCall: user: ", user);
      if (!user) {
        return res.status(401).render("errors/base", {
          error: info.messages ? info.messages : info.toString(),
        });
        //return next();
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    const user = req.user;
    console.log(user);
    if (!user) return res.status(401).send({ error: "Unauthorized" });
    if (!role.includes(user.role))
      return res.status(403).send({ error: "No Permission" });
    next();
  };
};

export const validateTokenAndGetID = (req, res, next) => {
  const token = req.params.jwt;
  jwt.verify(token, config.jwtPrivateKey, (error, credentials) => {
    if (error)
      return res.render("session/restore", {
        message: "token expired",
      });
    req.id = credentials.user;
    next();
  });
};

export const passwordFormat = (password) => {
  const message = {};
  if (password.length < 8)
    message.large = "Debe tener como minimo 8 caracteres.";
  if (!/[A-Z]/.test(password))
    message.mayus = "Debe contener al menos una mayuscula.";
  if (!/[0-9]/.test(password)) message.number = "Debe contener algun numero.";

  return message;
};

faker.locale = "es";

export const generateProduct = () => {
  return {
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    department: faker.commerce.department(),
    stock: faker.random.numeric(1),
    id: faker.database.mongodbObjectId(),
    image: faker.image.image(),
  };
};
