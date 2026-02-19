import { useState, useCallback } from 'react';

const LOGIN_MESSAGE = 'Login to Web3 Test App';

export function useSigning(signer) {
    const [signature, setSignature] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);

    const signMessage = useCallback(async () => {
        if (!signer) {
            setError('Wallet not connected.');
            return;
        }
        setIsSigning(true);
        setError('');
        setSignature('');
        setVerified(false);
        try {
            const sig = await signer.signMessage(LOGIN_MESSAGE);
            setSignature(sig);
            setVerified(true);
        } catch (err) {
            if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
                setError('Signature rejected. Please approve the signing request in MetaMask.');
            } else {
                setError(err.message || 'Failed to sign message.');
            }
        } finally {
            setIsSigning(false);
        }
    }, [signer]);

    const clearSignature = useCallback(() => {
        setSignature('');
        setVerified(false);
        setError('');
    }, []);

    return {
        signature,
        isSigning,
        error,
        verified,
        signMessage,
        clearSignature,
        message: LOGIN_MESSAGE,
    };
}
