import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Bot, Languages, ArrowRight, CheckCircle, Users, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Enhanced Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold font-headline text-gray-900">AgriSahayak</span>
              <p className="text-xs text-muted-foreground -mt-1">AI-Powered Agriculture</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Enhanced Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Powered by AI Technology
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Simple Steps to Healthier Crops
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 leading-relaxed">
              Transform your farming with AI-powered crop diagnosis, personalized treatment plans, and real-time weather alerts designed specifically for Pakistani farmers.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                <Link href="/login">
                  Get Your First Diagnosis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="p-3 bg-green-100 rounded-full mb-3">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">10,000+</h3>
                <p className="text-gray-600">Happy Farmers</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 bg-blue-100 rounded-full mb-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">95%</h3>
                <p className="text-gray-600">Accuracy Rate</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-3 bg-purple-100 rounded-full mb-3">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
                <p className="text-gray-600">AI Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="bg-white/80 backdrop-blur-sm py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-headline text-gray-900 mb-6">
                Everything You Need for Smart Farming
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform combines AI technology with local expertise to provide you with the best agricultural solutions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <EnhancedFeatureCard
                icon={<Bot className="h-12 w-12 text-primary" />}
                title="AI-Powered Diagnosis"
                description="Upload a photo of your crop and get instant, accurate disease identification with confidence scores and detailed analysis."
                features={["Instant Results", "95% Accuracy", "Multiple Languages"]}
                gradient="from-blue-500 to-cyan-500"
              />
              <EnhancedFeatureCard
                icon={<Leaf className="h-12 w-12 text-primary" />}
                title="Personalized Treatment Plans"
                description="Receive step-by-step treatment protocols with local product names, cost estimates in PKR, and safety guidelines."
                features={["Local Products", "Cost Estimates", "Safety Guidelines"]}
                gradient="from-green-500 to-emerald-500"
              />
              <EnhancedFeatureCard
                icon={<Languages className="h-12 w-12 text-primary" />}
                title="Weather & Marketplace"
                description="Get proactive weather alerts and connect with nearby suppliers for all your agricultural needs."
                features={["Weather Alerts", "Local Suppliers", "Real-time Updates"]}
                gradient="from-purple-500 to-pink-500"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-headline text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started in just 3 simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                step={1}
                title="Upload & Describe"
                description="Take a photo of your crop and describe the symptoms you've observed."
                icon={<Bot className="h-8 w-8" />}
              />
              <StepCard
                step={2}
                title="AI Analysis"
                description="Our AI analyzes your image and symptoms to provide an accurate diagnosis."
                icon={<Zap className="h-8 w-8" />}
              />
              <StepCard
                step={3}
                title="Get Treatment Plan"
                description="Receive a personalized treatment plan with local products and cost estimates."
                icon={<CheckCircle className="h-8 w-8" />}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold">AgriSahayak</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering Pakistani farmers with AI technology for better crop health and higher yields.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-800">
                  Get Started
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Learn More
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Diagnosis</li>
                <li>Treatment Plans</li>
                <li>Weather Alerts</li>
                <li>Marketplace</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} AgriSahayak. All rights reserved.</p>
            <p className="text-sm mt-2">Empowering farmers with AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EnhancedFeatureCard({ 
  icon, 
  title, 
  description, 
  features, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[];
  gradient: string;
}) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto bg-gradient-to-r ${gradient} rounded-2xl p-4 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 mb-3">{title}</CardTitle>
        <CardDescription className="text-gray-600 leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function StepCard({ 
  step, 
  title, 
  description, 
  icon 
}: { 
  step: number; 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center group">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-emerald-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
          {step}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
