/**
 * Address generator component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState } from 'react';
import { MdEmail } from 'react-icons/md';
import type { InboxAddress } from '#types/email';
import styles from './AddressGenerator.module.scss';

interface Props {
  onGenerate: (inbox: InboxAddress) => void;
}

export default function AddressGenerator({ onGenerate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [mode, setMode] = useState<'random' | 'custom'>('random');

  /**
   * Generate or create email address
   */
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = mode === 'custom' ? { customAddress: customEmail } : undefined;
      
      const response = await fetch('/api/address', { 
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create address');
      }

      onGenerate(result.data);
      setCustomEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <MdEmail className={styles.icon} />
        <h2 className={styles.title}>Create Temporary Email</h2>
        <p className={styles.description}>
          Create a disposable email address that expires in 1 hour
        </p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'random' ? styles.active : ''}`}
            onClick={() => setMode('random')}
          >
            Random
          </button>
          <button
            className={`${styles.tab} ${mode === 'custom' ? styles.active : ''}`}
            onClick={() => setMode('custom')}
          >
            Custom
          </button>
        </div>

        {mode === 'custom' && (
          <input
            type="text"
            className={styles.input}
            placeholder="username (without @domain)"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            disabled={loading}
          />
        )}

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading || (mode === 'custom' && !customEmail.trim())}
        >
          {loading ? 'Creating...' : mode === 'random' ? 'Generate Random Address' : 'Create Address'}
        </button>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}


