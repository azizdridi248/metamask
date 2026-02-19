import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

const NETWORK_NAMES = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia Testnet',
  137: 'Polygon Mainnet',
  80001: 'Mumbai Testnet',
  56: 'BNB Smart Chain',
  43114: 'Avalanche C-Chain',
  42161: 'Arbitrum One',
  10: 'Optimism',
};

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [networkName, setNetworkName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSepolia, setIsSepolia] = useState(false);
  const [error, setError] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

  const updateNetwork = useCallback(async (prov) => {
    try {
      const network = await prov.getNetwork();
      const id = Number(network.chainId);
      setChainId(id);
      setNetworkName(NETWORK_NAMES[id] || `Unknown Network (${id})`);
      setIsSepolia(id === SEPOLIA_CHAIN_ID_DECIMAL);
    } catch {
      setNetworkName('Unknown');
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }
    setIsConnecting(true);
    setError('');
    try {
      const prov = new BrowserProvider(window.ethereum);
      await prov.send('eth_requestAccounts', []);
      const sign = await prov.getSigner();
      const addr = await sign.getAddress();
      setProvider(prov);
      setSigner(sign);
      setAddress(addr);
      await updateNetwork(prov);
    } catch (err) {
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the MetaMask request.');
      } else {
        setError(err.message || 'Failed to connect wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [updateNetwork]);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    setIsSwitching(true);
    setError('');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Chain not added to MetaMask — add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          setError('Failed to add Sepolia network: ' + (addError.message || 'Unknown error'));
        }
      } else if (switchError.code !== 4001) {
        setError('Failed to switch network: ' + (switchError.message || 'Unknown error'));
      }
    } finally {
      setIsSwitching(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setChainId(null);
    setNetworkName('');
    setIsSepolia(false);
    setError('');
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (address) {
        const prov = new BrowserProvider(window.ethereum);
        const sign = await prov.getSigner();
        const addr = await sign.getAddress();
        setProvider(prov);
        setSigner(sign);
        setAddress(addr);
      }
    };

    const handleChainChanged = async () => {
      if (address) {
        const prov = new BrowserProvider(window.ethereum);
        const sign = await prov.getSigner();
        setProvider(prov);
        setSigner(sign);
        await updateNetwork(prov);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, disconnect, updateNetwork]);

  return {
    provider,
    signer,
    address,
    chainId,
    networkName,
    isSepolia,
    isConnecting,
    isSwitching,
    error,
    connect,
    disconnect,
    switchToSepolia,
    setError,
  };
}
