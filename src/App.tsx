import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import UploadCertificate from "./components/UploadCertificate";
import CheckCertificate from "./components/CheckCertificate";
import { ethers } from "ethers";

export default function App() {
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  return (
    <div className="p-6 min-h-screen flex flex-col items-center bg-gray-100">
      <ConnectWallet
        onConnected={async (address) => {
          setAccount(address);

          if (!window.ethereum) {
            alert("MetaMask не установлен");
            return;
          }

          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);

            const signer = await provider.getSigner(); // Исправлено: добавлен `await`
            setSigner(signer);
          } catch (error) {
            console.error("Ошибка подключения:", error);
          }
        }}
      />
      {account && (
        <>
          <UploadCertificate signer={signer} />
          <CheckCertificate provider={provider} />
        </>
      )}
    </div>
  );
}
