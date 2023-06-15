import { UserService } from "../repository/index.js";
import config from "../config/config.js";

const { jwtCookieName } = config;

export const getUsers = async (req, res) => {
  const users = await UserService.get();
  const usersData = users.map(({ first_name, last_name, email, role }) => ({
    first_name,
    last_name,
    email,
    role,
  }));

  res.json({ status: "success", payload: usersData });
};

export const deleteInactiveUsers = async (req, res) => {
  const result = await Usuario.deleteMany({
    last_connection: { $lte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    role: { $ne: "admin" },
  });

  res.json({ status: "success", result });
};

export const rolUpdate = async (req, res) => {
  const user = req.user;
  if (
    user.documents.includes("identificacion") &&
    user.documents.includes("comprobante de domicilio") &&
    user.documents.includes("comprobante de estado de cuenta")
  ) {
    user.role = "premium";
    await UserService.updateUser(user._id, user);
    res.redirect("api/session/profile");
  }
  res.error(
    "Falto subir uno de estos archivos: identificacion,comprobante de domicilio,comprobante de estado de cuenta"
  );
};

export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await UserService.deleteUser(uid);
    res.json({ status: "success", result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

export const deleteUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await UserService.getOneByEmail(email);
    if (!user)
      CustomError.createError({
        name: "Authentication error",
        cause: generateAuthenticationError(),
        message: "Error trying to find user.",
        code: EErrors.AUTHENTICATION_ERROR,
      });
    const result = await UserService.deleteUser(user._id || user.id);
    res.json({ status: "success", result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

export const uploadDocuments = async (req, res) => {
  try {
    const user = await UserService.getUserDataByID(req.user.id);
    const documents = await UserService.saveDocuments(user, req.files);
    res.json({ status: "success", payload: documents });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

export const userRol = async (req, res) => {
  const id = req.params.uid;
  const user = await UserService.getOne(id);
  if (!user) res.send(404);
  if (user.role == "admin") res.redirect("/api/user/profile");
  user.role = user.role == "user" ? "premium" : "user";
  const newUser = await UserService.update(id, user);
  res.redirect("/api/user/profile");
};
