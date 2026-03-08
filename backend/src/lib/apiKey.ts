import { createHash, randomBytes } from "node:crypto";

const API_KEY_PREFIX = "fk_";

export const generateApiKey = (): { plain: string; hash: string; keyPrefix: string } => {
  const plain = `${API_KEY_PREFIX}${randomBytes(24).toString("hex")}`;
  const hash = createHash("sha256").update(plain).digest("hex");
  const keyPrefix = plain.slice(0, 10);

  return { plain, hash, keyPrefix };
};
