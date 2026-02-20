import React from 'react';
import { Link } from 'react-router-dom';
import { TX_STATUS } from '../hooks/useTransaction.js';
import { TransactionSection } from '../components/TransactionSection.jsx';

const ETHERSCAN_BASE = 'https://sepolia.etherscan.io/tx/';

function formatTimestamp(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function truncateAddress(addr) {
    if (!addr) return '—';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function truncateHash(hash) {
    if (!hash) return null;
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function StatusBadge({ status }) {
    const map = {
        [TX_STATUS.PENDING]: { label: 'Pending', cls: 'tx-badge--pending', icon: '⏳' },
        [TX_STATUS.CONFIRMED]: { label: 'Confirmed', cls: 'tx-badge--confirmed', icon: '✅' },
        [TX_STATUS.FAILED]: { label: 'Failed', cls: 'tx-badge--failed', icon: '❌' },
    };
    const cfg = map[status];
    if (!cfg) return null;
    return (
        <span className={`tx-badge ${cfg.cls}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

export function TransactionsPage({
    history,
    onClearHistory,
    walletAddress,
    // TransactionSection props
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
    return (
        <div className="tx-page">
            {/* Page header */}
            <header className="app-header">
                <div className="header-content">
                    <Link to="/" className="tx-back-link">
                        <span>←</span> Back
                    </Link>
                    <div className="logo">
                        <span className="logo-icon">⬡</span>
                        <div className="logo-text">
                            <span className="logo-title">Transactions</span>
                            <span className="logo-sub">Sepolia Testnet</span>
                        </div>
                    </div>
                    {walletAddress && (
                        <span className="tx-wallet-pill">
                            {truncateAddress(walletAddress)}
                        </span>
                    )}
                </div>
            </header>

            <main className="tx-page-main">
                {/* ── Send Transaction form ─────────────────────────── */}
                <TransactionSection
                    recipient={recipient}
                    setRecipient={setRecipient}
                    amount={amount}
                    setAmount={setAmount}
                    txHash={txHash}
                    status={status}
                    error={error}
                    blockNumber={blockNumber}
                    onSend={onSend}
                    onReset={onReset}
                />

                {/* ── Transaction History ───────────────────────────── */}
                <div className="tx-history-section">
                    <div className="tx-history-heading">
                        <h2 className="tx-history-title">📋 History</h2>
                        {history.length > 0 && (
                            <button className="btn btn-ghost btn-sm" onClick={onClearHistory}>
                                Clear
                            </button>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <div className="tx-empty tx-empty--compact">
                            <div className="tx-empty-icon" style={{ fontSize: '36px' }}>📭</div>
                            <p>No transactions sent yet. Use the form above.</p>
                        </div>
                    ) : (
                        <div className="tx-cards">
                            {history.map((tx) => (
                                <div key={tx.id} className={`tx-card tx-card--${tx.status}`}>
                                    <div className="tx-card-top">
                                        <StatusBadge status={tx.status} />
                                        <span className="tx-timestamp">{formatTimestamp(tx.timestamp)}</span>
                                    </div>

                                    <div className="tx-card-body">
                                        <div className="tx-detail-row">
                                            <span className="tx-detail-label">To</span>
                                            <code className="tx-detail-value" title={tx.recipient}>
                                                {truncateAddress(tx.recipient)}
                                            </code>
                                        </div>
                                        <div className="tx-detail-row">
                                            <span className="tx-detail-label">Amount</span>
                                            <span className="tx-detail-value tx-amount">{tx.amount} ETH</span>
                                        </div>
                                        {tx.hash && (
                                            <div className="tx-detail-row">
                                                <span className="tx-detail-label">Hash</span>
                                                <div className="tx-hash-group">
                                                    <code className="tx-detail-value" title={tx.hash}>
                                                        {truncateHash(tx.hash)}
                                                    </code>
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() => navigator.clipboard.writeText(tx.hash)}
                                                        title="Copy hash"
                                                    >📋</button>
                                                    <a
                                                        className="etherscan-link"
                                                        href={`${ETHERSCAN_BASE}${tx.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        🔍 Etherscan
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {tx.blockNumber && (
                                            <div className="tx-detail-row">
                                                <span className="tx-detail-label">Block</span>
                                                <span className="tx-detail-value">#{tx.blockNumber}</span>
                                            </div>
                                        )}
                                        {tx.status === TX_STATUS.FAILED && tx.error && (
                                            <div className="tx-error-note">⚠️ {tx.error}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
