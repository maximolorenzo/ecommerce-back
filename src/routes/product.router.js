import { Router } from "express";
import { authorization, passportCall } from "../utils.js";
import {
  getAll,
  getRealProducts,
  createProduct,
  deletProduct,
  editProduct,
  ProductById,
} from "../controllers/product.controller.js";
import { upload } from "../services/multer.js";
const router = Router();

//get
router.get("/", getAll);

router.get(
  "/realtimeproducts",
  passportCall("jwt"),
  authorization(["premium", "admin"]),
  getRealProducts
);

router.post(
  "/",
  passportCall("jwt"),
  authorization(["premium", "admin"]),
  createProduct,
  upload
);

router.delete(
  "/:pid",
  passportCall("jwt"),
  authorization(["premium", "admin"]),
  deletProduct
);
router.put(
  "/:pid",
  passportCall("jwt"),
  authorization(["premium", "admin"]),
  editProduct,
  upload
);

router.get("/:pid", ProductById);

export default router;
