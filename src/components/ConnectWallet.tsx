import { useState } from "react";
import { ethers } from "ethers";

export default function ConnectWallet({ onConnected }: { onConnected: (account: string) => void }) {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Установите MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      onConnected(address);
    } catch (error) {
      console.error("Ошибка подключения:", error);
    }
  };

  return (
    <button onClick={connectWallet} className="p-2 bg-blue-500 text-white rounded">
      {account ? `Подключено: ${account.slice(0, 6)}...` : "Подключить MetaMask"}
    </button>
  );
}
