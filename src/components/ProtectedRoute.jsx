import React from 'react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ verified, children }) {
    if (!verified) {
        return <Navigate to="/" replace />;
    }
    return children;
}
