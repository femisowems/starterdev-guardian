import { useEffect } from 'react';

/**
 * Hook to persist form state to sessionStorage with lightweight encryption.
 * Note: For production, use Web Crypto API (SubtleCrypto) for advanced security.
 */
export function useEncryptedPersistence(
    name: string,
    values: any,
    onLoad: (values: any) => void
) {
    const storageKey = `gf_persist_${name}`;

    // Simple XOR cipher for "Clearance of Sensitive Data" simulation
    // In a real enterprise app, use AES-GCM via SubtleCrypto
    const encrypt = (text: string) => {
        const key = 42; // Dynamic keying recommended in production
        return btoa(text.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join(''));
    };

    const decrypt = (encoded: string) => {
        const key = 42;
        try {
            const decoded = atob(encoded);
            return decoded.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');
        } catch {
            return null;
        }
    };

    // Load initial state
    useEffect(() => {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
            const decrypted = decrypt(saved);
            if (decrypted) {
                try {
                    onLoad(JSON.parse(decrypted));
                } catch (e) {
                    console.error('Failed to parse persisted state', e);
                }
            }
        }
    }, [storageKey]); // Only on mount

    // Save on changes
    useEffect(() => {
        if (Object.keys(values).length > 0) {
            const encrypted = encrypt(JSON.stringify(values));
            sessionStorage.setItem(storageKey, encrypted);
        }
    }, [values, storageKey]);
}
