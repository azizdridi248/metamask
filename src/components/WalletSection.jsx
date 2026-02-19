import React from 'react';
import { Loader } from './Loader.jsx';
import { ErrorBanner } from './ErrorBanner.jsx';

function truncateAddress(addr) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletSection({
    address,
    networkName,
    isSepolia,
    isConnecting,
    isSwitching,
    error,
    onConnect,
    onDisconnect,
    onSwitchToSepolia,
    onClearError,
}) {
    const isConnected = Boolean(address);

    return (
        <section className="card" id="wallet-section">
            <div className="card-header">
                <div className="card-icon">🦊</div>
                <div>
                    <h2 className="card-title">Wallet Connection</h2>
                    <p className="card-subtitle">Connect your MetaMask wallet to get started</p>
                </div>
            </div>

            <ErrorBanner message={error} onDismiss={onClearError} />

            {!isConnected ? (
                <button
                    className="btn btn-primary"
                    onClick={onConnect}
                    disabled={isConnecting}
                    id="connect-wallet-btn"
                >
                    {isConnecting ? (
                        <>
                            <Loader size={16} color="#fff" />
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <>
                            <span className="btn-icon">🔗</span>
                            <span>Connect Wallet</span>
                        </>
                    )}
                </button>
            ) : (
                <>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Wallet Address</span>
                            <div className="info-value-row">
                                <span className="info-value address-value" title={address}>
                                    {truncateAddress(address)}
                                </span>
                                <button
                                    className="copy-btn"
                                    onClick={() => navigator.clipboard.writeText(address)}
                                    title="Copy full address"
                                    aria-label="Copy address"
                                >
                                    📋
                                </button>
                            </div>
                            <span className="info-sub">{address}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Network</span>
                            <div className="info-value-row">
                                <span
                                    className={`network-badge ${isSepolia ? 'network-badge--ok' : 'network-badge--warn'}`}
                                >
                                    <span className="badge-dot" />
                                    {networkName || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {!isSepolia && (
                        <div className="warning-box">
                            <span className="warning-icon">⚡</span>
                            <div className="warning-content">
                                <strong>Wrong Network</strong>
                                <p>This app requires the Sepolia testnet. Please switch your network.</p>
                            </div>
                            <button
                                className="btn btn-warning"
                                onClick={onSwitchToSepolia}
                                disabled={isSwitching}
                                id="switch-network-btn"
                            >
                                {isSwitching ? (
                                    <>
                                        <Loader size={14} color="#fff" />
                                        <span>Switching...</span>
                                    </>
                                ) : (
                                    'Switch to Sepolia'
                                )}
                            </button>
                        </div>
                    )}

                    <button className="btn btn-ghost" onClick={onDisconnect} id="disconnect-btn">
                        Disconnect
                    </button>
                </>
            )}
        </section>
    );
}
