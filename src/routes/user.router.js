import { Router } from "express";
import { authorization, passportCall } from "../utils.js";
import {
  deleteInactiveUsers,
  deleteUser,
  getUsers,
  rolUpdate,
  deleteUserByEmail,
  userRol,
} from "../controllers/user.controller.js";

import { upload } from "../services/multer.js";

const router = Router();

router.get("/", passportCall("jwt"), authorization(["admin"]), getUsers);
router.delete(
  "/",
  passportCall("jwt"),
  authorization(["admin"]),
  deleteInactiveUsers
);
router.get("/:uid", passportCall("jwt"), authorization(["user", "premium"]));
router.post(
  "/:uid/documents",
  passportCall("jwt"),
  authorization(["user", "premium", "admin"]),
  upload,
  rolUpdate
);

router.post(
  "/:uid",
  passportCall("jwt"),
  authorization(["user", "premium"]),
  userRol
);

router.delete("/delete/email", deleteUserByEmail);
router.delete("/:uid", deleteUser);

export default router;
