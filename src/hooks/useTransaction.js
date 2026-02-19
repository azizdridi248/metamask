import { useState, useCallback } from 'react';
import { parseEther, isAddress } from 'ethers';

export const TX_STATUS = {
    IDLE: 'idle',
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
};

export function useTransaction(signer) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState('');
    const [status, setStatus] = useState(TX_STATUS.IDLE);
    const [error, setError] = useState('');
    const [blockNumber, setBlockNumber] = useState(null);

    const sendTransaction = useCallback(async () => {
        if (!signer) {
            setError('Wallet not connected.');
            return;
        }
        if (!isAddress(recipient)) {
            setError('Invalid recipient address.');
            return;
        }
        const amountNum = parseFloat(amount);
        if (!amount || isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid ETH amount greater than 0.');
            return;
        }

        setError('');
        setTxHash('');
        setBlockNumber(null);
        setStatus(TX_STATUS.PENDING);

        try {
            const tx = await signer.sendTransaction({
                to: recipient,
                value: parseEther(amount),
            });
            setTxHash(tx.hash);

            // Wait for 1 confirmation
            const receipt = await tx.wait(1);
            if (receipt && receipt.status === 1) {
                setStatus(TX_STATUS.CONFIRMED);
                setBlockNumber(receipt.blockNumber);
            } else {
                setStatus(TX_STATUS.FAILED);
                setError('Transaction reverted on-chain.');
            }
        } catch (err) {
            setStatus(TX_STATUS.FAILED);
            if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
                setError('Transaction rejected. Please approve the transaction in MetaMask.');
            } else if (err.message?.includes('insufficient funds')) {
                setError('Insufficient funds for this transaction (including gas fees).');
            } else {
                setError(err.message || 'Transaction failed.');
            }
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
    };
}
