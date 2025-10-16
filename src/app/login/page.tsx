
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import LoadingSpinner from '@/components/agrisahayak/loading-spinner';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call and bypass OTP
    console.log(`Bypassing OTP for +92${phone.replace(/^0/, '')}`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  }

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
          <CardDescription>Enter your phone number to begin.</CardDescription>
        </CardHeader>
        <CardContent>
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
              <Button type="submit" className="w-full" disabled={isLoading || phone.length < 10}>
                {isLoading ? <LoadingSpinner message="Signing In..." /> : 'Sign In'}
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
