import { Router } from "express";
import { authorization, passportCall } from "../utils.js";

import {
  cartGet,
  createCart,
  cartId,
  addProduct,
  deleteCartProduct,
  deleteAllCartProduct,
  cartPut,
  cartQuantity,
  ticketCart,
} from "../controllers/cart.controller.js";
const router = Router();
//muestra los carritos
router.get("/", cartGet);

//crea el carrito
router.post("/", createCart);
//trae el carrito por id
router.get("/:cid", cartId);

//agrega un producto al carrito
router.post(
  "/:cid/product/:pid",
  passportCall("jwt"),
  authorization(["user", "premium"]),
  addProduct
);
//elemina un producto del carrito
router.delete(
  "/:cid/product/:pid",
  passportCall("jwt"),
  authorization(["user", "premium"]),
  deleteCartProduct
);
//elemina todos los productos de un carrito
router.delete("/:cid", deleteAllCartProduct);
//actualizar carrito
router.put("/:cid", cartPut);
// canitdad
router.put("/:cid/product/:pid", cartQuantity);

router.post(
  "/:cid/purchase",
  passportCall("jwt"),
  authorization(["user", "premium"]),
  ticketCart
);

export default router;
