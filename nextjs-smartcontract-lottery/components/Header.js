import { ConnectButton } from "web3uikit";

export const Header = () => {
  return (
    <div className="flex flex-row justify-between items-center border-b-2 border-b-gray-200 p-2">
      <h1 className="p-4 font-blog text-3xl">Decentralized Lottery</h1>
      <ConnectButton moralisAuth={false} />
    </div>
  );
};
