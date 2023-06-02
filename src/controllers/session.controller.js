import { UserService } from "../repository/index.js";
import {
  validateToken,
  isValidPassword as comparePasswords,
  createHash,
} from "../utils.js";

export const changePassword = async (req, res) => {
  const { uid, token } = req.params;
  const { newPassword, confirmation } = req.body;
  const { err } = validateToken(token);
  const user = await UserService.getOneByID(uid);

  if (err?.name === "TokenExpiredError")
    return res.status(403).json({ status: "error", error: "El token expiró" });
  else if (err) return res.json({ status: "error", error: err });

  if (!newPassword || !confirmation)
    return res.status(400).json({
      status: "error",
      error: "Escriba y confirme la nueva contraseña",
    });
  if (comparePasswords(user, newPassword))
    return res.json({
      status: "error",
      error: "La contraseña no puede ser igual a la anterior.",
    });
  if (newPassword != confirmation)
    return res.json({
      status: "error",
      error: "Las contraseñas no coinciden.",
    });

  const hashedPassword = createHash(newPassword);

  const newUser = await UserService.updateUser(uid, {
    password: hashedPassword,
  });
  res.json({ status: "success", payload: newUser }).redirect("/session/login");
};

export const login = async (req, res) => {
  const user = req.user;
  if (!user)
    return res
      .status(400)
      .render("errors/base", { error: "Invalid credentials", user });
  res.cookie("TokenDebon", user.token);
  const dateLog = await UserService.updateUser(user._id, {
    last_connection: Date.now(),
  });
  res.redirect("/api/products");
};

export const logout = async (req, res) => {
  const user = req.user;
  const dateLog = await UserService.updateUser(user._id, {
    last_connection: Date.now(),
  });
  res.clearCookie("TokenDebon").redirect("/session/login");
};

export const sendRecoveryEmail = async (req, res) => {
  const { email } = req.body;
  const result = await UserService.sendEmail(email);

  res.render({ status: "success", payload: result });
};
