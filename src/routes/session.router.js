import { Router } from "express";
import passport from "passport";
import config from "../config/config.js";
import {
  passportCall,
  generateToken,
  authToken,
  authorization,
} from "../utils.js";
import {
  changePassword,
  sendRecoveryEmail,
} from "../controllers/session.controller.js";
import { ProductService } from "../repository/index.js";
const router = Router();

//Vista para registrar usuarios
router.get("/register", (req, res) => {
  res.render("sessions/register");
});

// API para crear usuarios en la DB
router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/session/failregister",
  }),
  async (req, res) => {
    res.redirect("/api/session/login");
  }
);
router.get("/failregister", (req, res) => {
  req.logger.warning("Fail Strategy");
  res.send({ error: "Failed" });
});

// Vista de Login
router.get("/login", (req, res) => {
  res.render("sessions/login");
});

// API para login
router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/api/session/faillogin" }),
  async (req, res) => {
    if (!req.user) {
      return res
        .status(400)
        .send({ status: "error", error: "Invalid credentiales" });
    }
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
    };

    res.cookie(config.jwtCookieName, req.user.token).redirect("/api/products");
  }
);
router.get("/faillogin", (req, res) => {
  res.send({ error: "Fail Login" });
});

router.get("/profile", passportCall("jwt"), (req, res) => {
  const user = req.user.user;
  res.render("sessions/profile", {
    user,
    premium: req.user.role == "premium" || "",
  });
});

// Cerrar Session
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).render("errors/base", { error: err });
    } else res.clearCookie(config.jwtCookieName).redirect("/api/session/login");
  });
});

// olvido su contrasña
router.get("/forgotPassword", (req, res) => {
  res.render("sessions/recovery");
});
router.post("/forgotPassword", sendRecoveryEmail);

//crear nuevo pass

router.get("/forgotPassword/:uid/:token", (req, res) => {
  const uid = req.params.uid;
  const token = req.params.token;
  res.render("sessions/changePassword", { uid: uid, token: token });
});

router.post("/forgotPassword/:uid/:token", changePassword);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);
router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    console.log("Callback: ", req.user);

    req.session.user = req.user;
    console.log("User Session:", req.session.user);
    res.cookie(config.jwtCookieName, req.user.token).redirect("/api/products");
  }
);

router.get(
  "/private",
  passportCall("jwt"),
  authorization("user"),
  (req, res) => {
    res.send({ status: "success", payload: req.user, role: "user" });
  }
);

router.get(
  "/secret",
  passportCall("jwt"),
  authorization("admin"),
  (req, res) => {
    res.send({ status: "success", payload: req.user, role: "ADMIN" });
  }
);

router.get(
  "/current",
  passportCall("jwt"),
  authorization("user"),
  (req, res) => {
    console.log("get: ", req.user);
    res.render("sessions/profile", {
      user: req.user.user,
    });
  }
);
export default router;
