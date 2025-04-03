import { ethers } from "ethers";
import contractABI from "../Certificates.json";

const CONTRACT_ADDRESS = "0x76C5A81876f9f00bf7A69888509c95F9B59B9aC7";
const API_URL = "http://localhost:5000/api/certificates"; // Укажи актуальный URL

// Получаем доступ к контракту
export async function getBlockchain() {
    if (!window.ethereum) {
        alert("MetaMask не установлен!");
        return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Запрашиваем доступ к кошельку

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

    return { signer, contract, provider };
}

// Функция загрузки сертификата в блокчейн и БД
// Если известна структура metadata, можно создать интерфейс, например:
export interface Metadata {
    // Определите необходимые поля
    [key: string]: any;
  }

  export async function issueCertificate(ipfsHash: string, metadata: Metadata): Promise<void> {
    const blockchain = await getBlockchain();
    if (!blockchain) {
      throw new Error("Не удалось подключиться к блокчейну");
    }
    const { signer, contract } = blockchain;
    try {
      const address = await signer.getAddress();
      const tx = await contract.issueCertificate(address, ipfsHash);
      await tx.wait();

      const blockchainHash = tx.hash;
      const ownerId = address;

      // Отправляем данные в API C#
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          blockchainHash,
          ipfsHash,
          metadata
        })
      });
      if (!response.ok) {
        throw new Error("Ошибка сохранения сертификата в БД");
      }
    } catch (error) {
      console.error("Ошибка загрузки сертификата:", error);
    }
  }
// Функция получения сертификата из БД или блокчейна
export async function getCertificate(certId: number, provider?: any) {
    try {
      // Сначала пытаемся получить данные из БД
      const response = await fetch(`${API_URL}/${certId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Ошибка при получении из БД, пробуем блокчейн:", error);
    }

    // Если provider не передан, получаем его из getBlockchain()
    if (!provider) {
      const blockchain = await getBlockchain();
      if (!blockchain) {
        throw new Error("Проблема с подключением к блокчейну");
      }
      provider = blockchain.provider;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
    try {
      const certificate = await contract.getCertificate(certId);
      return {
        issuedTo: certificate.issuedTo,
        issuer: certificate.issuer,
        ipfsHash: certificate.ipfsHash,
        issueDate: new Date(certificate.issueDate * 1000)
      };
    } catch (error) {
      throw new Error("Сертификат не найден в блокчейне и БД");
    }
  }

  