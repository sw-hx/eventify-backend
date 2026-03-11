import models from "../../models/index.js";
import errorFormatter from "../../utility/errorFormatterHelperFunction.js";
import { ACCOUNT_STATUS } from "../../enums/userInfoEnum.js";
import token_type from "../../enums/token_types.js";

const registerUser = async (
  username,
  full_name,
  email,
  password_hash,
  token_hash,
) => {
  let transaction;
  try {
    transaction = await models.user.sequelize.transaction();

    //now start the transaction process
    const user = await models.user.create(
      {
        username,
        full_name,
        email,
        password_hash,
        isVerified: false,
        account_status: ACCOUNT_STATUS.ACTIVE,
      },
      { transaction: transaction },
    );
    //now link the new token to the user

    //make the token alive for 30 minute
    const expires_at = new Date(Date.now() + 30 * 60 * 1000);
    const user_token = await models.user_token.create(
      {
        token_type: token_type.EMAIL_VERIFICATION,
        token_hash,
        expires_at,
        user_id: user.id,
      },
      { transaction: transaction },
    );

    await transaction.commit();
  } catch (exception) {
    if (transaction) await transaction.rollback();
    const message = `Error cannot register user: ${email || username}`;
    errorFormatter.printError(exception, message);
    errorFormatter.throwError(500, message);
  }
};
export default registerUser;
