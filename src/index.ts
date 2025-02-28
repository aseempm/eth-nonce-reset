import { JsonRpcProvider, parseEther, parseUnits, Wallet } from "ethers";
import "dotenv/config";

require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new JsonRpcProvider(process.env.RPC);
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

  const currentNonce = await provider.getTransactionCount(
    wallet.address,
    "latest"
  );
  const pendingNonce = await provider.getTransactionCount(
    wallet.address,
    "pending"
  );

  console.log("📌 Current Nonce:", currentNonce);
  console.log("📌 Pending Nonce:", pendingNonce);

  if (currentNonce < pendingNonce) {
    console.log(
      "⚠️  Sending 0-value transaction to fix nonce with increased fees..."
    );

    try {
      const minGasPrice = parseUnits(process.env.MIN_GAS_PRICE!, "gwei");

      const tx = {
        nonce: currentNonce,
        to: wallet.address,
        value: parseEther("0.0"),
        gasLimit: 21000,
        gasPrice: minGasPrice,
      };

      const txResponse = await wallet.sendTransaction(tx);
      console.log("✅ Transaction sent! Hash:", txResponse.hash);

      // Wait for confirmation
      await txResponse.wait();
      console.log("✅ Transaction confirmed!");
    } catch (error) {
      console.error("❌ Transaction failed:", error);
    }
  } else {
    console.log("✅ No stuck transactions. Everything is fine!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
