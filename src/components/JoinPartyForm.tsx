/**
 * Join Party Form Component
 * 
 * Allows users to join parties using invite codes
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Users, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useJoinParty } from '@/lib/api/parties-react-hooks';
import { isValidInviteCode } from '@/lib/utils/party-utils';

export interface JoinPartyFormProps {
  onJoinSuccess?: (party: any) => void;
  onCancel?: () => void;
}

export const JoinPartyForm: React.FC<JoinPartyFormProps> = ({
  onJoinSuccess,
  onCancel
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [userInfo, setUserInfo] = useState({
    username: '',
    displayName: '',
    profilePhotoUrl: ''
  });
  const [validationError, setValidationError] = useState('');
  const [partyPreview, setPartyPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { 
    joinParty, 
    validateJoinCode, 
    getPartyByJoinCode,
    joinedParty,
    loading, 
    error, 
    reset 
  } = useJoinParty();

  const handleJoinCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setJoinCode(upperValue);
    setValidationError('');
    setPartyPreview(null);
    setShowPreview(false);

    // Auto-validate as user types
    if (upperValue.length === 6) {
      validatePartyCode(upperValue);
    }
  };

  const validatePartyCode = async (code: string) => {
    if (!isValidInviteCode(code)) {
      setValidationError('Invalid invite code format');
      return;
    }

    try {
      const result = await validateJoinCode(code);
      if (result?.valid && result.party) {
        setPartyPreview(result.party);
        setShowPreview(true);
        setValidationError('');
      } else {
        setValidationError('Invalid or expired invite code');
        setShowPreview(false);
      }
    } catch (error) {
      setValidationError('Failed to validate invite code');
      setShowPreview(false);
    }
  };

  const handleJoinParty = async () => {
    if (!joinCode || !userInfo.username || !userInfo.displayName) {
      setValidationError('Please fill in all required fields');
      return;
    }

    if (!isValidInviteCode(joinCode)) {
      setValidationError('Invalid invite code format');
      return;
    }

    try {
      const result = await joinParty({
        joinCode,
        userId: `user_${Date.now()}`, // In real app, get from auth
        username: userInfo.username,
        displayName: userInfo.displayName,
        profilePhotoUrl: userInfo.profilePhotoUrl
      });

      if (result?.success) {
        onJoinSuccess?.(result.data?.party);
        reset();
      }
    } catch (error) {
      console.error('Error joining party:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRemainingSlots = (party: any) => {
    return party.maxParticipants - party.currentParticipants;
  };

  return (
    <div className="space-y-6">
      {/* Join Code Input */}
      <Card>
        <CardHeader>
          <CardTitle>Join Party</CardTitle>
          <CardDescription>
            Enter the invite code to join a party
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="joinCode">Invite Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => handleJoinCodeChange(e.target.value)}
                placeholder="Enter 6-character code"
                className="text-center text-lg font-mono tracking-wider"
                maxLength={6}
              />
              {validationError && (
                <p className="text-sm text-red-600 mt-1">{validationError}</p>
              )}
            </div>

            {showPreview && partyPreview && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Valid invite code! You can join this party.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Party Preview */}
      {showPreview && partyPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Party Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{partyPreview.name}</h3>
                <Badge variant={partyPreview.type === 'competitive' ? 'default' : 'secondary'}>
                  {partyPreview.type === 'competitive' ? 'Competitive' : 'Friendly'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Members</div>
                    <div className="text-gray-600">
                      {partyPreview.currentParticipants}/{partyPreview.maxParticipants}
                      {getRemainingSlots(partyPreview) > 0 && (
                        <span className="text-green-600 ml-1">
                          ({getRemainingSlots(partyPreview)} slots left)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-gray-600">
                      {formatDate(partyPreview.startDate)} - {formatDate(partyPreview.endDate)}
                    </div>
                  </div>
                </div>

                {partyPreview.buyIn && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Buy-in</div>
                      <div className="text-gray-600">${partyPreview.buyIn}</div>
                    </div>
                  </div>
                )}
              </div>

              {getRemainingSlots(partyPreview) === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This party is full and cannot accept new members.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Info Form */}
      {showPreview && partyPreview && getRemainingSlots(partyPreview) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Enter your details to join the party
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={userInfo.username}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={userInfo.displayName}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <Label htmlFor="profilePhotoUrl">Profile Photo URL (optional)</Label>
                <Input
                  id="profilePhotoUrl"
                  value={userInfo.profilePhotoUrl}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, profilePhotoUrl: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        
        <Button
          onClick={handleJoinParty}
          disabled={loading || !showPreview || !userInfo.username || !userInfo.displayName || getRemainingSlots(partyPreview) === 0}
          className="flex-1"
        >
          {loading ? 'Joining...' : 'Join Party'}
        </Button>
      </div>
    </div>
  );
};
