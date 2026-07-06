import 'react-native-url-polyfill/auto';

// Polyfill global WebSocket with a dummy class for Node.js (compilation/SSR) environments.
// This prevents Supabase from crashing during initialization, without needing to import
// the node-only 'ws' package, avoiding mobile build errors.
if (typeof WebSocket === 'undefined') {
  (global as any).WebSocket = class DummyWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    readyState = 3;
    addEventListener() {}
    removeEventListener() {}
    close() {}
    send() {}
  };
}

// This file is no longer used, Supabase has been removed.
export const supabase = {} as any;
