import FileManager from "./fileManager.js";
class CartMaganer {
  constructor() {
    this.fileManager = new FileManager("db_file/carts.json");
  }

  read = () => {
    if (fs.existsSync(this.path)) {
      return fs.promises
        .readFile(this.path, "utf-8")
        .then((r) => JSON.parse(r));
    }
    return [];
  };

  getNextId = (list) => {
    const count = list.length;
    return count > 0 ? list[count - 1].id + 1 : 1;
  };

  write = (list) => {
    return fs.promises.writeFile(this.path, JSON.stringify(list));
  };

  get = async () => {
    const data = await this.read();

    return data;
  };

  getID = async (id) => {
    const data = await this.read();

    return data.find((p) => p.id == id);
  };

  create = async () => {
    const carts = await this.read();
    const nextID = this.getNextId(carts);
    const newCart = {
      id: nextID,
      products: [],
    };

    carts.push(newCart);

    await this.write(carts);

    return newCart;
  };

  update = async (id, obj) => {
    obj.id = id;
    const list = await this.read();
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        list[i] = obj;
        break;
      }
    }
    await this.write(list);
  };

  addProduct = async (cartID, productID) => {
    const cart = await this.getID(cartID);

    let found = false;

    for (let i = 0; i < cart.products.length; i++) {
      if (cart.products[i].id == productID) {
        cart.products[i].quantity++;

        found = true;
        break;
      }
    }
    if (!found) {
      cart.products.push({
        id: productID,
        quantity: 1,
      });
    }
    await this.update(cartID, cart);
    return cart;
  };

  async deleteProduct(idDelete) {
    let pdelete = await this.get();
    let existe = pdelete.some((e) => e.id === idDelete);
    if (!existe) {
      console.log(" No se borro nada ");
    } else {
      pdelete = pdelete.filter((e) => e.id !== idDelete);
    }

    await this.write(pdelete);
  }
}

export default CartMaganer;
