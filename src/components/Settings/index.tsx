/**
 * Settings panel component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState, useEffect } from 'react';
import { MdSettings, MdSave } from 'react-icons/md';
import styles from './Settings.module.scss';

/**
 * Convert seconds to days/hours/minutes
 */
function secondsToUnits(seconds: number): { days: number; hours: number; minutes: number } {
  const days = Math.floor(seconds / 86400);
  const remainingAfterDays = seconds % 86400;
  const hours = Math.floor(remainingAfterDays / 3600);
  const remainingAfterHours = remainingAfterDays % 3600;
  const minutes = Math.floor(remainingAfterHours / 60);
  
  return { days, hours, minutes };
}

/**
 * Convert days/hours/minutes to seconds
 */
function unitsToSeconds(days: number, hours: number, minutes: number): number {
  return days * 86400 + hours * 3600 + minutes * 60;
}

export default function Settings() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current settings
   */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const result = await response.json();

        if (result.success && result.data.email_retention) {
          const seconds = parseInt(result.data.email_retention, 10);
          const units = secondsToUnits(seconds);
          setDays(units.days);
          setHours(units.hours);
          setMinutes(units.minutes);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };

    fetchSettings();
  }, []);

  /**
   * Save settings
   */
  const handleSave = async () => {
    const totalSeconds = unitsToSeconds(days, hours, minutes);
    
    // Validation
    if (totalSeconds < 60) {
      setError('Minimum retention is 1 minute');
      return;
    }
    if (totalSeconds > 31536000) {
      setError('Maximum retention is 365 days');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_retention: totalSeconds.toString() }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const totalSeconds = unitsToSeconds(days, hours, minutes);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <MdSettings /> Settings
      </h3>

      <div className={styles.field}>
        <label className={styles.label}>
          Email Retention
          <span className={styles.hint}>
            = {totalSeconds}s
          </span>
        </label>

        <div className={styles.timeInputs}>
          <div className={styles.timeUnit}>
            <label className={styles.unitLabel}>Days</label>
            <input
              type="number"
              className={styles.timeInput}
              value={days}
              onChange={(e) => setDays(Math.max(0, Math.min(365, parseInt(e.target.value) || 0)))}
              min="0"
              max="365"
              disabled={loading}
            />
          </div>

          <div className={styles.timeUnit}>
            <label className={styles.unitLabel}>Hours</label>
            <input
              type="number"
              className={styles.timeInput}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              min="0"
              max="23"
              disabled={loading}
            />
          </div>

          <div className={styles.timeUnit}>
            <label className={styles.unitLabel}>Minutes</label>
            <input
              type="number"
              className={styles.timeInput}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              min="0"
              max="59"
              disabled={loading}
            />
          </div>
        </div>

        <p className={styles.help}>
          Min: 1 minute - Max: 365 days (1 year)
        </p>
      </div>

      <button
        className={styles.button}
        onClick={handleSave}
        disabled={loading}
      >
        <MdSave />
        {loading ? 'Saving...' : 'Save Settings'}
      </button>

      {success && (
        <div className={styles.success}>
          Settings saved successfully!
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}

