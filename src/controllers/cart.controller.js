import { CartService, ProductService } from "../repository/index.js";
import TicketModel from "../dao/mongo/models/ticket.model.js";
import { v4 as uuidv4 } from "uuid";
import CustomError from "../services/errors/custom_error.js";
import { generateCartErrorInfo } from "../services/errors/info.js";
import EError from "../services/errors/enums.js";
import productsModel from "../dao/mongo/models/products.model.js";

export const cartGet = async (req, res) => {
  const carts = await CartService.get();
  res.json({ carts });
};

export const createCart = async (req, res) => {
  const cartNew = await CartService.create({});

  res.json({ status: "success", cartNew });
};

export const cartId = async (req, res) => {
  const user = req.user;
  const id = req.params.cid;
  const carts = await CartService.getByIdLean(id);
  res.render("cart", { data: carts, user });
};

export const addProduct = async (req, res) => {
  const cartID = req.params.cid;
  const productID = req.params.pid;
  const quantity = req.body.quantity || 1;

  const cart = await CartService.getById(cartID);
  const infoProduct = await ProductService.getById(productID);
  if (infoProduct.stock < quantity) {
    await CustomError.createError({
      name: "add product error",
      cause: generateCartErrorInfo(infoProduct),
      message: "Error dont have Stock",
      code: EError.INVALID_TYPES_ERROR,
    });
  }

  const userID = req.user.id;
  const owner = infoProduct?.owner;

  if (req.user.role == "premium" && owner == userID)
    CustomError.createError({
      name: "Authorization error",
      cause: generateAuthorizationError(),
      message: "You can't add your own product to your cart.",
      code: EErrors.AUTHORIZATION_ERROR,
    });

  let found = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].id == productID) {
      cart.products[i].quantity++;
      found = true;
      break;
    }
  }
  if (found == false) {
    cart.products.push({
      id: productID,
      quantity,
    });
  }
  await cart.save();
  res.redirect("/api/products");
};

export const deleteCartProduct = async (req, res) => {
  const cartID = req.params.cid;
  const productID = req.params.pid;
  const quantity = req.body.quantity || 1;
  const cart = await CartService.getById(cartID);

  if (!cart)
    return res.status(404).json({ status: "error", error: "cart not found" });

  const productIDX = cart.products.findIndex((p) => p.id == productID);
  if (productIDX < 0)
    return res
      .status(404)
      .json({ status: "error", error: "Product not found on cart" });

  cart.products.splice(productIDX, 1);

  await cart.save();

  res.json({ status: "success", cart });
};

export const deleteAllCartProduct = async (req, res) => {
  const cartID = req.params.cid;
  const cart = await CartService.findById(cartID);
  cart.products = [];
  await cart.save();
  res.json({
    status: "Success",
    massage: "Product Deleted!",
    cart,
  });
};

export const cartPut = async (req, res) => {
  const cartID = req.params.cid;
  const cartUpdate = req.body;
  const cart = await CartService.findById(cartID);
  cart.products = cartUpdate;
  await cart.save();

  res.json({ status: "success", cart });
};

export const cartQuantity = async (req, res) => {
  const cartID = req.params.cid;
  const productID = req.params.pid;
  const quantity = req.body.quantity || 1;
  const cart = await CartService.findById(cartID);

  if (!cart)
    return res.status(404).json({ status: "error", error: "cart not found" });

  const productIDX = cart.products.findIndex((p) => p.id == productID);

  productIDX.quantity = quantity;

  await cart.save();

  res.json({ status: "success", cart });
};

export const ticketCart = async (req, res) => {
  const cartID = req.params.cid;
  const cart = await CartService.getById(cartID);

  let totalPrice = 0;
  const noStock = [];
  const comparation = cart.products;

  comparation.map(async (p) => {
    console.log(p.id.stock);
    if (p.id.stock >= p.quantity) {
      p.id.stock -= p.quantity;
      totalPrice += p.id.price * p.quantity;
      await productsModel.findByIdAndUpdate({ _id: p.id._id }, p.id);
    } else {
      noStock.push({
        title: p.id.title,
        price: p.id.price,
        quantity: p.quantity,
      });
    }
  });
  console.log(totalPrice);

  let ticket;
  if (totalPrice > 0)
    ticket = await TicketModel.create({
      purchaser: req.user.user.email,
      amount: totalPrice,
      code: uuidv4(),
    });
  const ticketFinish = await TicketModel.find({
    purchaser: req.user.user.email,
  })
    .lean()
    .exec();

  res.render("ticket", { ticketFinish });
};
