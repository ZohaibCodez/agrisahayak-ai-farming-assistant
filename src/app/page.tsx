import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Bot, Languages } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">AgriSahayak</span>
          </div>
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            Simple Steps to Healthier Crops
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            We make modern agricultural advice accessible and easy for every farmer in Pakistan.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/login">Get Your First Diagnosis</Link>
            </Button>
          </div>
        </section>

        <section className="bg-white/50 dark:bg-black/20 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Bot className="h-10 w-10 text-primary" />}
                title="Snap & Diagnose"
                description="Instantly identify crop diseases and pests by simply uploading a photo. Our AI provides a fast and accurate diagnosis."
              />
              <FeatureCard
                icon={<Leaf className="h-10 w-10 text-primary" />}
                title="Actionable Plans"
                description="Receive step-by-step treatment plans tailored to your needs, including local product names and cost estimates in PKR."
              />
              <FeatureCard
                icon={<Languages className="h-10 w-10 text-primary" />}
                title="Multi-Language Support"
                description="Our platform is designed for you, with full support for both English and Urdu to ensure clarity and ease of use."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} AgriSahayak. All rights reserved.</p>
          <p className="text-sm mt-2">Empowering farmers with AI technology.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center bg-background shadow-lg">
      <CardHeader>
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
          {icon}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription className="pt-2">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
