const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const encryptedKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD,
    process.env.PRIVATE_KEY
  );
  fs.writeFileSync("./.encyrpyKey.json", encryptedKey);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(`Error: ${err}`);
    process.exit(1);
  });
