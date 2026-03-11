import React from 'react';

export const VintageCard = ({ children, className = '' }) => {
    return (
        <div className={`bg-black/10 backdrop-blur-[3px] border border-vintage-paper/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-6 relative ${className}`}>
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-vintage-paper -mt-[2px] -ml-[2px]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-vintage-paper -mt-[2px] -mr-[2px]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-vintage-paper -mb-[2px] -ml-[2px]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-vintage-paper -mb-[2px] -mr-[2px]" />
            {children}
        </div>
    );
};
