/**
 * Address history component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState, useEffect } from 'react';
import { MdHistory, MdEmail } from 'react-icons/md';
import styles from './AddressHistory.module.scss';

interface Address {
  id: number;
  address: string;
  created_at: number;
  expires_at: number;
  email_count: number;
  last_email_at: number | null;
}

interface Props {
  onSelectAddress: (address: string) => void;
}

/**
 * Format timestamp to relative time
 */
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function AddressHistory({ onSelectAddress }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  /**
   * Fetch addresses from API
   */
  const fetchAddresses = async () => {
    try {
      const limit = showAll ? 100 : 10;
      const response = await fetch(`/api/addresses?limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        setAddresses(result.data.addresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [showAll]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          <MdHistory /> Recent Addresses
        </h3>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          <MdHistory /> Recent Addresses
        </h3>
        <p className={styles.empty}>No addresses created yet</p>
      </div>
    );
  }

  const now = Date.now();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <MdHistory /> Recent Addresses
      </h3>

      <div className={styles.list}>
        {addresses.map((addr) => {
          const isActive = addr.expires_at > now;
          
          return (
            <div
              key={addr.id}
              className={`${styles.item} ${!isActive ? styles.expired : ''}`}
              onClick={() => isActive && onSelectAddress(addr.address)}
            >
              <div className={styles.itemHeader}>
                <MdEmail className={styles.icon} />
                <span className={styles.address}>{addr.address}</span>
              </div>
              <div className={styles.itemMeta}>
                <span className={styles.time}>{formatTime(addr.created_at)}</span>
                <span className={styles.count}>{addr.email_count} email(s)</span>
                {!isActive && <span className={styles.badge}>Expired</span>}
              </div>
            </div>
          );
        })}
      </div>

      {addresses.length >= 10 && !showAll && (
        <button className={styles.showMore} onClick={() => setShowAll(true)}>
          Show more
        </button>
      )}
    </div>
  );
}

