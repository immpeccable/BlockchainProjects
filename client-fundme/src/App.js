import logo from "./logo.svg";
import "./App.css";
import { useState, React } from "react";
import { ethers } from "ethers";
import { abi, contractAddress } from "./constants";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [fundAmount, setFundAmount] = useState("0");

  async function getBalance() {
    if (!window.ethereum) {
      alert("Please install metamask.");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }

  async function connect() {
    if (!window.ethereum) {
      alert("Please install metamask");
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    setIsConnected(true);
  }

  async function fund() {
    console.log(`Funding with ${fundAmount} ...`);
    if (!window.ethereum) {
      alert("Please connect to metamask");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(fundAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done.");
    } catch (error) {
      console.error(error);
    }
  }

  async function withdraw() {
    if (!window.ethereum) {
      alert("Please install metamask.");
      return;
    }
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (e) {
      console.error(e);
    }
  }

  function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash} ...`);
    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations.`
        );
        resolve();
      });
    });
  }

  return (
    <div class="flex-center flex flex-col justify-center gap-4 align-middle">
      <button
        onClick={connect}
        class="border-2 border-yellow-300 bg-red-500 px-4 py-2 font-bold text-white"
      >
        {isConnected ? "Connected" : "Connect"}
      </button>
      <button onClick={getBalance} class="border-2 border-red-200 p-2">
        Get Balance{" "}
      </button>
      <button
        onClick={withdraw}
        class="border-2 border-yellow-200 bg-red-500 px-4 py-2 font-bold text-white"
      >
        Withdraw
      </button>
      <button
        class="border-2 border-yellow-200 bg-red-500 px-4 py-2 font-bold text-white"
        onClick={fund}
      >
        Fund
      </button>
      <label class="text-center" for="fund">
        ETH Amount
      </label>
      <input
        onChange={(e) => {
          setFundAmount(e.target.value);
        }}
        class="border-2 px-2 py-1"
        id="amount"
        placeholder="0"
      />
    </div>
  );
}

export default App;
