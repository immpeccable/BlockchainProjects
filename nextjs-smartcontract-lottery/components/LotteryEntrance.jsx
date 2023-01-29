import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "@/constans";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export const LotteryEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const [entranceFee, setEntranceFee] = useState(0);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const [numPlayers, setNumPlayers] = useState();
  const [recentWinner, setRecentWinner] = useState();
  const dispatch = useNotification();

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });
  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const { runContractFunction: getInterval } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getInterval",
    params: {},
  });

  async function updateUI() {
    const interval = (await getInterval()).toString();
    console.log("interval: ", interval);

    const entranceFee = (
      await getEntranceFee({
        onError: (e) => {
          console.log(e);
        },
      })
    ).toString();
    const recentWinner = await getRecentWinner({
      onError: (e) => {
        console.log(e);
      },
    });
    const numberOfPlayers = await getNumberOfPlayers({
      onError: (e) => {
        console.log(e);
      },
    });

    setEntranceFee(entranceFee);
    setRecentWinner(recentWinner.toString());
    setNumPlayers(numberOfPlayers.toString());
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUI();
  };

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div className="p-5">
      Hi from lottery entrance!
      {raffleAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 px-4 py-2 text-white font-semibold rounded-md"
            disabled={isLoading || isFetching}
            onClick={async () => {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (err) => {
                  console.log(err);
                },
              });
            }}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-6 w-6 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <div>
            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </div>
          <div>Number of Players: {numPlayers}</div>
          <div>Recent Winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No raffle address is detected</div>
      )}
    </div>
  );
};
