import React from 'react';

export function Loader({ size = 20, color = '#7c3aed' }) {
    return (
        <span
            className="loader-spinner"
            style={{ width: size, height: size, borderTopColor: color }}
            aria-label="Loading"
        />
    );
}
