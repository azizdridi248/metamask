import { useState, useCallback } from 'react';
import { parseEther, isAddress } from 'ethers';

export const TX_STATUS = {
    IDLE: 'idle',
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
};

// Exchange rate: 1 ETH = 1,000,000 TND
export const TND_PER_ETH = 1000000;

export function tndToEth(tnd) {
    return tnd / TND_PER_ETH;
}

export function useTransaction(signer) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState('');
    const [status, setStatus] = useState(TX_STATUS.IDLE);
    const [error, setError] = useState('');
    const [blockNumber, setBlockNumber] = useState(null);

    // History of all sent transactions
    const [history, setHistory] = useState([]);

    const sendTransaction = useCallback(async () => {
        if (!signer) {
            setError('Wallet not connected.');
            return;
        }
        if (!isAddress(recipient)) {
            setError('Invalid recipient address.');
            return;
        }
        const amountTnd = parseFloat(amount);
        if (!amount || isNaN(amountTnd) || amountTnd <= 0) {
            setError('Please enter a valid TND amount greater than 0.');
            return;
        }
        const amountEth = tndToEth(amountTnd);

        setError('');
        setTxHash('');
        setBlockNumber(null);
        setStatus(TX_STATUS.PENDING);

        // Create a new history entry immediately
        const entryId = Date.now();
        const ethString = amountEth.toFixed(18);
        const newEntry = {
            id: entryId,
            recipient,
            amountTnd: amount,
            amount: ethString,
            hash: '',
            status: TX_STATUS.PENDING,
            blockNumber: null,
            timestamp: new Date().toISOString(),
            error: '',
        };
        setHistory((prev) => [newEntry, ...prev]);

        const updateEntry = (patch) =>
            setHistory((prev) =>
                prev.map((e) => (e.id === entryId ? { ...e, ...patch } : e))
            );

        try {
            const tx = await signer.sendTransaction({
                to: recipient,
                value: parseEther(ethString),
            });
            setTxHash(tx.hash);
            updateEntry({ hash: tx.hash });

            // Wait for 1 confirmation
            const receipt = await tx.wait(1);
            if (receipt && receipt.status === 1) {
                setStatus(TX_STATUS.CONFIRMED);
                setBlockNumber(receipt.blockNumber);
                updateEntry({ status: TX_STATUS.CONFIRMED, blockNumber: receipt.blockNumber });
            } else {
                setStatus(TX_STATUS.FAILED);
                setError('Transaction reverted on-chain.');
                updateEntry({ status: TX_STATUS.FAILED, error: 'Transaction reverted on-chain.' });
            }
        } catch (err) {
            setStatus(TX_STATUS.FAILED);
            let msg = err.message || 'Transaction failed.';
            if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
                msg = 'Transaction rejected. Please approve the transaction in MetaMask.';
            } else if (err.message?.includes('insufficient funds')) {
                msg = 'Insufficient funds for this transaction (including gas fees).';
            }
            setError(msg);
            updateEntry({ status: TX_STATUS.FAILED, error: msg });
        }
    }, [signer, recipient, amount]);

    const reset = useCallback(() => {
        setRecipient('');
        setAmount('');
        setTxHash('');
        setStatus(TX_STATUS.IDLE);
        setError('');
        setBlockNumber(null);
    }, []);

    const clearHistory = useCallback(() => setHistory([]), []);

    return {
        recipient,
        setRecipient,
        amount,
        setAmount,
        txHash,
        status,
        error,
        blockNumber,
        sendTransaction,
        reset,
        history,
        clearHistory,
    };
}
