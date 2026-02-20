import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useWallet } from './hooks/useWallet.js';
import { useBalance } from './hooks/useBalance.js';
import { useSigning } from './hooks/useSigning.js';
import { useTransaction } from './hooks/useTransaction.js';
import { WalletSection } from './components/WalletSection.jsx';
import { BalanceSection } from './components/BalanceSection.jsx';
import { SignSection } from './components/SignSection.jsx';

import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { TransactionsPage } from './pages/TransactionsPage.jsx';

// ── Inner app that has access to router context ──────────────────────────────
function AppContent() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const balance = useBalance(wallet.provider, wallet.address);
  const signing = useSigning(wallet.signer);
  const transaction = useTransaction(wallet.signer);

  const isConnected = Boolean(wallet.address);

  return (
    <Routes>
      {/* ── Home page ─────────────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <div className="app">
            {/* Header */}
            <header className="app-header">
              <div className="header-content">
                <div className="logo">
                  <span className="logo-icon">⬡</span>
                  <div className="logo-text">
                    <span className="logo-title">Web3 Test App</span>
                    <span className="logo-sub">MetaMask · Sepolia Testnet</span>
                  </div>
                </div>
                {isConnected && (
                  <div className="header-status">
                    <span className={`network-pill ${wallet.isSepolia ? 'network-pill--ok' : 'network-pill--warn'}`}>
                      <span className="pill-dot" />
                      {wallet.networkName}
                    </span>
                    {signing.verified && (
                      <button
                        className="btn btn-sm btn-accent"
                        onClick={() => navigate('/transactions')}
                        id="view-transactions-btn"
                      >
                        📋 Transactions
                        {transaction.history.length > 0 && (
                          <span className="tx-count-badge">{transaction.history.length}</span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </header>

            {/* Main content */}
            <main className="app-main">
              <div className="page-intro">
                <h1 className="page-title">Web3 Integration Testing</h1>
                <p className="page-desc">
                  Test your MetaMask wallet connection, message signing, and ETH transactions on the Sepolia testnet.
                </p>
              </div>

              {/* Wallet Connection — always visible */}
              <WalletSection
                address={wallet.address}
                networkName={wallet.networkName}
                isSepolia={wallet.isSepolia}
                isConnecting={wallet.isConnecting}
                isSwitching={wallet.isSwitching}
                error={wallet.error}
                onConnect={wallet.connect}
                onDisconnect={wallet.disconnect}
                onSwitchToSepolia={wallet.switchToSepolia}
                onClearError={() => wallet.setError('')}
              />

              {/* Sections only visible when connected */}
              {isConnected && (
                <div className="sections-grid">
                  <BalanceSection
                    balance={balance.balance}
                    isLoading={balance.isLoading}
                    error={balance.error}
                    onRefetch={balance.refetch}
                    lastUpdated={balance.lastUpdated}
                  />

                  <SignSection
                    message={signing.message}
                    signature={signing.signature}
                    isSigning={signing.isSigning}
                    error={signing.error}
                    verified={signing.verified}
                    onSign={signing.signMessage}
                    onClear={signing.clearSignature}
                    onViewTransactions={() => navigate('/transactions')}
                  />


                </div>
              )}

              {!isConnected && (
                <div className="connect-prompt">
                  <div className="prompt-icon">🔒</div>
                  <p>Connect your MetaMask wallet to access all features.</p>
                </div>
              )}
            </main>

            {/* Footer */}
            <footer className="app-footer">
              <p>
                Built with{' '}
                <a href="https://ethers.org" target="_blank" rel="noopener noreferrer">
                  ethers.js v6
                </a>{' '}
                &{' '}
                <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
                  Vite + React
                </a>{' '}
                · Targeting{' '}
                <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer">
                  Sepolia Testnet
                </a>
              </p>
            </footer>
          </div>
        }
      />

      {/* ── Transactions page (protected) ──────────────────────────────────── */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute verified={signing.verified}>
            <TransactionsPage
              history={transaction.history}
              onClearHistory={transaction.clearHistory}
              walletAddress={wallet.address}
              recipient={transaction.recipient}
              setRecipient={transaction.setRecipient}
              amount={transaction.amount}
              setAmount={transaction.setAmount}
              txHash={transaction.txHash}
              status={transaction.status}
              error={transaction.error}
              blockNumber={transaction.blockNumber}
              onSend={transaction.sendTransaction}
              onReset={transaction.reset}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
