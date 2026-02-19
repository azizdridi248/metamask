import { useState, useEffect, useCallback } from 'react';
import { formatEther } from 'ethers';

export function useBalance(provider, address) {
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchBalance = useCallback(async () => {
        if (!provider || !address) return;
        setIsLoading(true);
        setError('');
        try {
            const raw = await provider.getBalance(address);
            setBalance(parseFloat(formatEther(raw)).toFixed(6));
            setLastUpdated(new Date());
        } catch (err) {
            setError('Failed to fetch balance: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [provider, address]);

    // Fetch on mount and when provider/address change
    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // Auto-refresh every 15 seconds
    useEffect(() => {
        if (!provider || !address) return;
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, [provider, address, fetchBalance]);

    return { balance, isLoading, error, refetch: fetchBalance, lastUpdated };
}
