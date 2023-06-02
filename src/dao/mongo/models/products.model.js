import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const productCollection = "products";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  price: Number,
  category: String,
  thumbnail: [String],
  stock: Number,
  owner: {
    type: String,
    default: "admin",
  },
});
mongoose.set("strictQuery", false);
productSchema.plugin(mongoosePaginate);
const productsModel = mongoose.model(productCollection, productSchema);

export default productsModel;
