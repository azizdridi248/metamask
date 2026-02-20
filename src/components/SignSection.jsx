import React from 'react';
import { Loader } from './Loader.jsx';
import { ErrorBanner } from './ErrorBanner.jsx';

export function SignSection({ message, signature, isSigning, error, verified, onSign, onClear, onViewTransactions }) {
    const truncateSig = (sig) => {
        if (!sig) return '';
        return `${sig.slice(0, 20)}...${sig.slice(-16)}`;
    };

    return (
        <section className="card" id="sign-section">
            <div className="card-header">
                <div className="card-icon">✍️</div>
                <div>
                    <h2 className="card-title">Authentication</h2>
                    <p className="card-subtitle">Sign a message to prove wallet ownership</p>
                </div>
            </div>

            <ErrorBanner message={error} onDismiss={onClear} />

            <div className="message-box">
                <span className="message-label">Message to sign</span>
                <code className="message-content">"{message}"</code>
            </div>

            <button
                className="btn btn-primary"
                onClick={onSign}
                disabled={isSigning}
                id="sign-message-btn"
            >
                {isSigning ? (
                    <>
                        <Loader size={16} color="#fff" />
                        <span>Signing...</span>
                    </>
                ) : (
                    <>
                        <span className="btn-icon">🔐</span>
                        <span>Sign Login Message</span>
                    </>
                )}
            </button>

            {signature && (
                <div className="signature-result">
                    <div className="result-header">
                        <span className={`status-badge status-badge--success`}>
                            <span className="badge-dot" />
                            Signature Generated
                        </span>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(signature)} title="Copy full signature">
                            📋 Copy
                        </button>
                    </div>
                    <div className="signature-box">
                        <span className="sig-label">Signature</span>
                        <code className="sig-value" title={signature}>
                            {truncateSig(signature)}
                        </code>
                        <details className="sig-details">
                            <summary>Show full signature</summary>
                            <code className="sig-full">{signature}</code>
                        </details>
                    </div>
                    {verified && (
                        <div className="auth-success">
                            <p className="verify-note">✅ Signature verified — this address controls the wallet.</p>
                            <button
                                className="btn btn-accent"
                                onClick={onViewTransactions}
                                id="view-transactions-btn-sign"
                            >
                                <span className="btn-icon">📋</span>
                                View Transactions →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
