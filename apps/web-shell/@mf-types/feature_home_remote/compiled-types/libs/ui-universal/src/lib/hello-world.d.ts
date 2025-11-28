import React from 'react';
export interface HelloWorldProps {
    title?: string;
    message?: string;
}
/**
 * HelloWorld Component
 *
 * A universal component that works on both web and native platforms.
 * Uses React Native primitives only - no DOM-specific code.
 */
export declare const HelloWorld: React.FC<HelloWorldProps>;
