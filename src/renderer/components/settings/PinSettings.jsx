import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, Lock, Unlock } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';

export function PinSettings({ toast }) {
  const [isProtected, setIsProtected] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    try {
      const protectedState = await ipcClient.isPinProtected();
      setIsProtected(Boolean(protectedState));
    } catch (e) {
      setIsProtected(false);
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      toast('error', 'New PIN and Confirm PIN do not match.');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      toast('error', 'PIN must be exactly 4 numeric digits.');
      return;
    }

    setIsLoading(true);
    try {
      await ipcClient.setSecurityPin(oldPin, newPin);
      toast('success', 'Security PIN saved successfully!');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      checkPinStatus();
    } catch (err) {
      toast('error', err.message || 'Failed to update PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisablePin = async () => {
    if (!oldPin) {
      toast('error', 'Please enter your current PIN to disable security.');
      return;
    }
    setIsLoading(true);
    try {
      await ipcClient.disableSecurityPin(oldPin);
      toast('success', 'Security PIN lock disabled.');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      checkPinStatus();
    } catch (err) {
      toast('error', err.message || 'Failed to disable PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">4-Digit Security PIN Lock</h3>
          <p className="text-xs text-slate-400">Protect application startup with a 4-digit security PIN hash.</p>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-bold ${isProtected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
          {isProtected ? 'PIN Protection Active' : 'No PIN Set'}
        </span>
      </div>

      <form onSubmit={handleSavePin} className="space-y-4 max-w-md pt-2">
        {isProtected && (
          <Input
            label="Current 4-Digit PIN"
            type="password"
            maxLength={4}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            required
          />
        )}

        <Input
          label={isProtected ? 'New 4-Digit PIN' : 'Set 4-Digit PIN'}
          type="password"
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          required
        />

        <Input
          label="Confirm 4-Digit PIN"
          type="password"
          maxLength={4}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          required
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" icon={KeyRound} isLoading={isLoading}>
            {isProtected ? 'Update Security PIN' : 'Enable Security PIN'}
          </Button>

          {isProtected && (
            <Button type="button" variant="danger" icon={Unlock} onClick={handleDisablePin} isLoading={isLoading}>
              Disable Security PIN
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
