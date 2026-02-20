import React from 'react';
import { Loader } from './Loader.jsx';
import { ErrorBanner } from './ErrorBanner.jsx';
import { TX_STATUS, tndToEth, TND_PER_ETH } from '../hooks/useTransaction.js';

const ETHERSCAN_BASE = 'https://sepolia.etherscan.io/tx/';

function StatusBadge({ status }) {
    const configs = {
        [TX_STATUS.PENDING]: { label: 'Pending', className: 'status-badge--pending', icon: '⏳' },
        [TX_STATUS.CONFIRMED]: { label: 'Confirmed', className: 'status-badge--success', icon: '✅' },
        [TX_STATUS.FAILED]: { label: 'Failed', className: 'status-badge--error', icon: '❌' },
    };
    const config = configs[status];
    if (!config) return null;
    return (
        <span className={`status-badge ${config.className}`}>
            <span className="badge-dot" />
            {config.icon} {config.label}
        </span>
    );
}

export function TransactionSection({
    recipient,
    setRecipient,
    amount,
    setAmount,
    txHash,
    status,
    error,
    blockNumber,
    onSend,
    onReset,
}) {
    const isPending = status === TX_STATUS.PENDING;
    const isDone = status === TX_STATUS.CONFIRMED || status === TX_STATUS.FAILED;

    return (
        <section className="card" id="transaction-section">
            <div className="card-header">
                <div className="card-icon">⚡</div>
                <div>
                    <h2 className="card-title">Send Transaction</h2>
                    <p className="card-subtitle">Enter amount in Tunisian Dinar (TND) — converts to Sepolia ETH</p>
                </div>
            </div>

            <ErrorBanner message={error} onDismiss={onReset} />

            <div className="form-group">
                <label className="form-label" htmlFor="recipient-input">
                    Recipient Address
                </label>
                <input
                    id="recipient-input"
                    className="form-input"
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={isPending}
                    autoComplete="off"
                    spellCheck="false"
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="amount-input">
                    Amount (TND)
                </label>
                <div className="input-with-suffix">
                    <input
                        id="amount-input"
                        className="form-input"
                        type="number"
                        placeholder="10"
                        step="1"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isPending}
                    />
                    <span className="input-suffix">TND</span>
                </div>
                {amount && parseFloat(amount) > 0 && (
                    <p className="form-hint">
                        ≈ {tndToEth(parseFloat(amount)).toFixed(6)} ETH
                        <span style={{ opacity: 0.6, marginLeft: '8px' }}>(1 ETH = {TND_PER_ETH.toLocaleString()} TND)</span>
                    </p>
                )}
            </div>

            <div className="btn-row">
                <button
                    className="btn btn-primary"
                    onClick={onSend}
                    disabled={isPending}
                    id="send-tx-btn"
                >
                    {isPending ? (
                        <>
                            <Loader size={16} color="#fff" />
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <span className="btn-icon">🚀</span>
                            <span>Send Transaction</span>
                        </>
                    )}
                </button>

                {isDone && (
                    <button className="btn btn-ghost" onClick={onReset} id="reset-tx-btn">
                        New Transaction
                    </button>
                )}
            </div>

            {(txHash || isPending) && (
                <div className="tx-result">
                    <div className="result-header">
                        <StatusBadge status={status} />
                    </div>

                    {txHash && (
                        <div className="tx-hash-box">
                            <span className="tx-label">Transaction Hash</span>
                            <div className="tx-hash-row">
                                <code className="tx-hash" title={txHash}>
                                    {txHash.slice(0, 12)}...{txHash.slice(-10)}
                                </code>
                                <div className="tx-actions">
                                    <button
                                        className="copy-btn"
                                        onClick={() => navigator.clipboard.writeText(txHash)}
                                        title="Copy tx hash"
                                    >
                                        📋
                                    </button>
                                    <a
                                        className="etherscan-link"
                                        href={`${ETHERSCAN_BASE}${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="View on Sepolia Etherscan"
                                    >
                                        🔍 Etherscan
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {blockNumber && (
                        <p className="tx-block">Confirmed in block #{blockNumber}</p>
                    )}

                    {isPending && !txHash && (
                        <p className="tx-waiting">Waiting for MetaMask approval...</p>
                    )}

                    {isPending && txHash && (
                        <p className="tx-waiting">Transaction broadcast — waiting for confirmation...</p>
                    )}
                </div>
            )}
        </section>
    );
}
