import crypto from "crypto";

const TokenUtility = {
  generate: () => {
    return crypto.randomBytes(32).toString("hex");
  },
  hashToken: (tokenToHash) => {
    return crypto.createHash("sha256").update(tokenToHash).digest("hex");
  },
};

export default TokenUtility;
