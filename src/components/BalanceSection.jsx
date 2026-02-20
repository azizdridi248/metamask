import React from 'react';
import { Loader } from './Loader.jsx';
import { TND_PER_ETH } from '../hooks/useTransaction.js';

export function BalanceSection({ balance, isLoading, error, onRefetch, lastUpdated }) {
    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <section className="card" id="balance-section">
            <div className="card-header">
                <div className="card-icon">💎</div>
                <div>
                    <h2 className="card-title">Wallet Balance</h2>
                    <p className="card-subtitle">Balance in Tunisian Dinar (auto-refreshes every 15s)</p>
                </div>
            </div>

            <div className="balance-display">
                {isLoading ? (
                    <div className="balance-loading">
                        <Loader size={28} />
                        <span>Fetching balance...</span>
                    </div>
                ) : error ? (
                    <div className="balance-error">⚠ {error}</div>
                ) : (
                    <>
                        <div className="balance-amount">
                            <span className="balance-value">
                                {balance != null
                                    ? (parseFloat(balance) * TND_PER_ETH).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : '—'}
                            </span>
                            <span className="balance-unit">TND</span>
                        </div>
                        {balance != null && (
                            <div className="balance-tnd">
                                ≈ {balance} ETH
                            </div>
                        )}
                        {lastUpdated && (
                            <span className="balance-updated">Last updated: {formatTime(lastUpdated)}</span>
                        )}
                    </>
                )}
            </div>

            <button
                className="btn btn-secondary"
                onClick={onRefetch}
                disabled={isLoading}
                id="refresh-balance-btn"
            >
                {isLoading ? (
                    <>
                        <Loader size={14} />
                        <span>Refreshing...</span>
                    </>
                ) : (
                    <>
                        <span>↺</span>
                        <span>Refresh Balance</span>
                    </>
                )}
            </button>
        </section>
    );
}
