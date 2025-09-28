"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SharpSportsCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your PrizePicks connection...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Connection failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // In a real implementation, you would send the code to your backend
        // to exchange it for an access token
        // For now, we'll simulate success
        
        setStatus('success');
        setMessage('PrizePicks account connected successfully!');
        
        // Close the popup window after a delay
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'SHARPSPORTS_CONNECTED' }, '*');
            window.close();
          }
        }, 2000);

      } catch (err) {
        setStatus('error');
        setMessage('An error occurred during connection');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[color:var(--ink-950)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[color:var(--steel-700)] bg-[color:var(--slate-900)]">
        <CardHeader className="text-center">
          <CardTitle className="text-[color:var(--text-high)] flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-[color:var(--pp-purple)]" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-[color:var(--mint)]" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-[color:var(--error)]" />}
            PrizePicks Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-[color:var(--text-mid)] mb-4">{message}</p>
          {status === 'success' && (
            <p className="text-xs text-[color:var(--text-low)]">
              You can now close this window and return to the app.
            </p>
          )}
          {status === 'error' && (
            <button 
              onClick={() => window.close()}
              className="text-xs text-[color:var(--pp-purple)] hover:underline"
            >
              Close window
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
