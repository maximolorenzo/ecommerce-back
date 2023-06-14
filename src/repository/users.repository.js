import UserDTO from "../dao/dto/users.dto.js";
import Mail from "../config/email.js";
import config from "../config/config.js";
import { generateToken } from "../utils.js";
export default class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  get = async () => {
    return await this.dao.get();
  };

  getOneByID = async (id) => {
    return await this.dao.getOneByID(id);
  };

  getOneByEmail = async (email) => {
    return await this.dao.getOneByEmail(email);
  };

  create = async (data) => {
    const dataToInsert = new UserDTO(data);

    return await this.dao.create(dataToInsert);
  };

  updateUser = async (id, data) => {
    return await this.dao.update(id, data);
  };

  deleteUser = async (id) => {
    return await this.dao.delete(id);
  };

  deleteManyUsers = async (ids) => {
    return await this.dao.deleteMany(ids);
  };

  sendEmail = async (email) => {
    const user = await this.getOneByEmail(email);

    /*if (!user) {
      CustomError.createError({
        name: "Authentication error",
        cause: generateProdErrorInfo(),
        message: "Error trying to find user",
        code: EErros.INVALID_TYPES_ERROR,
      } else {
    });*/

    const token = generateToken(user._id, "1h");

    const html = `<h1>Recupera tu contraseña</h1>
      <p>Hola, solicitaste recupar tu contraseña</p>
      <p>Deno ser asi no respondas este email</p>
      <p>Podés hacerlo desde acá:</p>
      <a href="${config.URL_BASE}/api/session/forgotPassword/${user._id}/${token}">Cambiar contraseñaa</a>
      <br>
      <p>¡Saludos!</p>`;

    const mailClass = new Mail();
    const result = await mailClass.send(
      email,
      "Restauración de contraseña",
      html
    );

    return result;
  };

  saveDocuments = async (user, files) => {
    const newDocuments = files.map((file) => ({
      name: file.document_type,
      reference: `${file.destination.replace(`${__dirname}/public`, "")}/${
        file.filename
      }`,
    }));

    const updatedUser = {
      ...user,
      documents: user.documents.concat(newDocuments),
    };

    await this.updateUser(user.id, updatedUser);
    return newDocuments;
  };
}
