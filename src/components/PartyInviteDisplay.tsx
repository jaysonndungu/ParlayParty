/**
 * Party Invite Display Component
 * 
 * Displays invite codes and QR codes for party invitations
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, QrCode, Share, Users, Calendar, DollarSign } from 'lucide-react';
import { generateInviteLink } from '@/lib/utils/party-utils';

export interface PartyInviteDisplayProps {
  party: {
    id: string;
    name: string;
    type: 'friendly' | 'competitive';
    joinCode: string;
    qrCode?: string;
    maxParticipants: number;
    currentParticipants: number;
    buyIn?: number;
    startDate: string;
    endDate: string;
  };
  onClose?: () => void;
}

export const PartyInviteDisplay: React.FC<PartyInviteDisplayProps> = ({
  party,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const inviteLink = generateInviteLink(party.joinCode);
  const remainingSlots = party.maxParticipants - party.currentParticipants;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${party.name}`,
          text: `Join my ${party.type} party on ParlayParty!`,
          url: inviteLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying invite link
      copyToClipboard(inviteLink);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Party Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{party.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant={party.type === 'competitive' ? 'default' : 'secondary'}>
                  {party.type === 'competitive' ? 'Competitive' : 'Friendly'}
                </Badge>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {party.currentParticipants}/{party.maxParticipants} members
                </span>
                {remainingSlots > 0 && (
                  <span className="text-green-600 text-sm">
                    {remainingSlots} slots remaining
                  </span>
                )}
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-gray-600">
                  {formatDate(party.startDate)} - {formatDate(party.endDate)}
                </div>
              </div>
            </div>
            {party.buyIn && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">Buy-in</div>
                  <div className="text-gray-600">${party.buyIn}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite Code</CardTitle>
          <CardDescription>
            Share this code with friends to let them join your party
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={party.joinCode}
                readOnly
                className="text-center text-2xl font-mono font-bold tracking-wider"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(party.joinCode)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                variant="default"
                onClick={shareInvite}
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share Invite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code for Competitive Parties */}
      {party.type === 'competitive' && party.qrCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QR Code</CardTitle>
            <CardDescription>
              Scan this QR code to quickly join the party
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  {showQRCode ? 'Hide' : 'Show'} QR Code
                </Button>
              </div>
              
              {showQRCode && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <img
                      src={party.qrCode}
                      alt="Party QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite Link</CardTitle>
          <CardDescription>
            Direct link to join the party
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(inviteLink)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Join</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Share the invite code or QR code with friends</p>
            <p>2. Friends can enter the code in the "Join Party" section</p>
            <p>3. Or they can scan the QR code with their phone</p>
            <p>4. Party is limited to {party.maxParticipants} members</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
