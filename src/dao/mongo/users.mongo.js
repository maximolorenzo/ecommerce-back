import UserModel from "./models/user.model.js";

export default class User {
  constructor() {}

  get = async () => {
    return await UserModel.find().lean().exec();
  };

  create = async (data) => {
    return await UserModel.create(data);
  };

  getOneByID = async (id) => {
    return await UserModel.findById(id).lean().exec();
  };

  getOneByEmail = async (email) => {
    return await UserModel.findOne({ email }).lean().exec();
  };

  update = async (id, data) => {
    return await UserModel.updateOne(
      { _id: id },
      {
        $set: {
          data,
        },
      }
    );
  };
}
