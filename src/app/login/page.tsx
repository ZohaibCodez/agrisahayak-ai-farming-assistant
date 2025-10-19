
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';
import LoadingSpinner from '@/components/agrisahayak/loading-spinner';
import { useAuth, useFirebase } from '@/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { upsertProfile } from '@/lib/repositories';

// Extend window for storing the recaptcha verifier instance
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useAuth();
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  

  const setupRecaptcha = useCallback(() => {
    if (!auth || !recaptchaContainerRef.current) return;
    if (window.recaptchaVerifier) window.recaptchaVerifier.clear();

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          setError('reCAPTCHA response expired. Please try again.');
        },
      }
    );
    window.recaptchaVerifier.render().catch(() => {
      setError('Failed to render reCAPTCHA.');
    });
  }, [auth]);

  useEffect(() => {
    if (isClient) {
      setupRecaptcha();
    }
  }, [isClient, setupRecaptcha]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);
    if (!window.recaptchaVerifier) {
      setError("reCAPTCHA not initialized. Please refresh the page.");
      setIsSending(false);
      return;
    }

    try {
      const fullPhone = `+92${phone.replace(/^0/, '')}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setShowOtpForm(true);
      toast({ title: "OTP Sent", description: `An OTP has been sent to ${fullPhone}` });
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      setError(err?.message ?? 'Failed to send OTP. Please check the phone number and try again.');
      // Reset reCAPTCHA
      setupRecaptcha();
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirmationResult) {
      setError("Verification session expired. Please request a new OTP.");
      return;
    };
    setError(null);
    setIsVerifying(true);
    try {
      const cred = await window.confirmationResult.confirm(code);
      const loggedInUser = cred.user;
      
      // Create or update user profile
      await upsertProfile({ uid: loggedInUser.uid, phone: loggedInUser.phoneNumber! });

      toast({ title: "Login Successful!", description: "Welcome to AgriSahayak.", className: "bg-green-100 text-green-800" });
      router.push('/dashboard');
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setError(err?.message ?? 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isClient || isUserLoading) {
    return <div className="flex h-screen w-screen items-center justify-center"><LoadingSpinner message="Loading..." /></div>;
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
          {!showOtpForm ? (
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
              
              {error && (<p className="text-sm text-destructive">{error}</p>)}
              <div className="my-2" ref={recaptchaContainerRef} id="recaptcha-container" />
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
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setShowOtpForm(false); setCode(''); setError(null); }}>
                Use a different number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
