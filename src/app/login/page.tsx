
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import LoadingSpinner from '@/components/agrisahayak/loading-spinner';
import { getFirebaseAuth } from '@/lib/firebase';
import { upsertProfile } from '@/lib/repositories';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

declare global {
  // Extend window for storing the recaptcha verifier instance
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const auth = getFirebaseAuth();
    if (!window.recaptchaVerifier && recaptchaContainerRef.current) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'normal',
      });
      // Render to ensure the widget is initialized
      void window.recaptchaVerifier.render();
    }
  }, [isClient]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);
    try {
      const auth = getFirebaseAuth();
      const verifier = window.recaptchaVerifier!;
      const fullPhone = `+92${phone.replace(/^0/, '')}`;
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      setConfirmation(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    setError(null);
    setIsVerifying(true);
    try {
      const cred = await confirmation.confirm(code);
      const user = cred.user;
      try {
        await upsertProfile({ uid: user.uid, phone: user.phoneNumber ?? '' });
      } catch {}
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to AgriSahayak</CardTitle>
          <CardDescription>Secure sign-in with your phone number.</CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmation ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-secondary-foreground text-sm">
                    +92
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="321 0777102"
                    required
                    className="rounded-l-none"
                    value={phone}
                    onChange={handlePhoneChange}
                    pattern="\d{10}"
                    title="Please enter a 10-digit phone number."
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Preferred Language</Label>
                <RadioGroup defaultValue="english" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="english" id="english" />
                    <Label htmlFor="english">English</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urdu" id="urdu" />
                    <Label htmlFor="urdu">اردو</Label>
                  </div>
                </RadioGroup>
              </div>
              {error && (<p className="text-sm text-destructive">{error}</p>)}
              <div ref={recaptchaContainerRef} id="recaptcha-container" className="flex justify-center" />
              <Button type="submit" className="w-full" disabled={isSending || phone.length < 10}>
                {isSending ? <LoadingSpinner message="Sending OTP..." /> : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Enter OTP</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
              {error && (<p className="text-sm text-destructive">{error}</p>)}
              <Button type="submit" className="w-full" disabled={isVerifying || code.length < 6}>
                {isVerifying ? <LoadingSpinner message="Verifying..." /> : 'Verify & Continue'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setConfirmation(null); setCode(''); }}>
                Use a different number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
