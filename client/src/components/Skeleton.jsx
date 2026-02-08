import React from 'react';

const Skeleton = ({ width, height, borderRadius = '4px', style }) => {
    return (
        <div
            className="skeleton-shimmer"
            style={{
                width: width,
                height: height,
                borderRadius: borderRadius,
                ...style
            }}
        />
    );
};

export default Skeleton;
