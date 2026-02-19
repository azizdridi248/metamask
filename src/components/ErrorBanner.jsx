import React from 'react';

export function ErrorBanner({ message, onDismiss }) {
    if (!message) return null;
    return (
        <div className="error-banner" role="alert">
            <span className="error-icon">⚠</span>
            <span className="error-text">{message}</span>
            {onDismiss && (
                <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
                    ✕
                </button>
            )}
        </div>
    );
}
