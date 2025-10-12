// AccountSettings.tsx
import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { Button } from './Button';
import { SettingsForm } from './SettingsForm';
import type { User } from './types';

interface AccountSettingsProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onUpdateProfile
}) => {
  return (
    <SettingsForm user={user} onUpdate={onUpdateProfile} />
  );
};