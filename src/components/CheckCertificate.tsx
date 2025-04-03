import { useState } from "react";
import { getCertificate } from "../api/CertificateAPI";
import { ethers } from "ethers";

export default function CheckCertificate({ provider }: { provider: ethers.Provider | null }) {
  const [certId, setCertId] = useState("");
  const [certificate, setCertificate] = useState<any>(null);

  const checkCertificate = async () => {
    if (!provider) return alert("Подключите MetaMask");
    if (!certId) return alert("Введите ID сертификата");

    try {
      const cert = await getCertificate(Number(certId), provider);
      setCertificate(cert);
    } catch (error) {
      console.error(error);
      alert("Сертификат не найден");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-bold mb-2">Проверить сертификат</h2>
      <input
        type="number"
        placeholder="Введите ID"
        value={certId}
        onChange={(e) => setCertId(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button onClick={checkCertificate} className="p-2 bg-blue-500 text-white rounded">
        🔍 Проверить
      </button>

      {certificate && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <p><strong>ID:</strong> {certificate[0].toString()}</p>
          <p><strong>Выдан:</strong> {certificate[1]}</p>
          <p><strong>IPFS Hash:</strong> {certificate[2]}</p>
          <p><strong>Дата выдачи:</strong> {new Date(Number(certificate[3]) * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
