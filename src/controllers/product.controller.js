import { ProductService, UserService } from "../repository/index.js";
import Mail from "../config/email.js";

export const getAll = async (req, res) => {
  const limit = req.query?.limit || 10;
  const page = req.query?.page || 1;
  const filter = req.query?.filter || "";
  const sortQuery = req.query?.sort || "";
  const sortQueryOrder = req.query?.sortorder || "desc";
  const search = {};
  if (filter) {
    search.title = filter;
  }

  const sort = {};
  if (sortQuery) {
    sort[sortQuery] = sortQueryOrder;
  }

  const options = {
    limit,
    page,
    sort,
    lean: true,
  };

  const data = await ProductService.getPaginate(search, options);

  const user = req.user.user;
  res.render("products", { data, user });
};

export const getRealProducts = async (req, res) => {
  res.render("realTimeProducts", { script: "index.js" });
};

export const createProduct = async (req, res) => {
  const { role, email } = req.user;
  const product = req.body;
  const documents = await UserService.saveDocuments(req.user, req.files);
  product.thumbnails = documents.map((file) => file.reference);
  if (role === "premium") product.owner = email;

  const productAdd = await ProductService.create(product);

  res.render("realTimeProducts", { script: "index.js" });
};

export const deletProduct = async (req, res) => {
  const id = req.params.pid;
  const productDeleted = await ProductService.delete(id);

  if (user.role === "premium" && userEmail !== product.owner) {
    const error = "You can't modify a product owned by another user";
    req.logger.error(error);
    return res.status(403).json({ status: "error", error });
  }
  const owner = await UserService.getOneByEmail(product.owner);
  const mail = new Mail();
  const html = `<h1>Su producto fue eliminado</h1>
  <p>Hola, ${owner.first_name}. Su producto '${product.title}' (ID: ${pid}) ha sido eliminado.</p>`;

  if (owner.role === "premium") {
    mail.send(owner.email, "Producto eliminado", html);
  }

  req.io.emit("updatedProducts", await ProductService.get());
  res.json({
    status: "Success",
    massage: "Product Deleted!",
    productDeleted,
  });
};

export const editProduct = async (req, res) => {
  const id = req.params.pid;
  const productToUpdate = req.body;

  const product = await ProductService.update(
    {
      _id: id,
    },
    productToUpdate
  );
  req.io.emit("socket01", await ProductService.get());
  res.json({
    status: "Success",
    product,
  });
};

export const ProductById = async (req, res) => {
  const id = req.params.pid;
  const showProduct = await ProductService.getById({ _id: id });
  res.render("products", { showProduct });
};
