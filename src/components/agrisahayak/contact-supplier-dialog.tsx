"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Supplier } from '@/lib/models';
import { generateNegotiationMessage, sendMessageToSupplier } from '@/lib/actions/marketplace-actions';

interface ContactSupplierDialogProps {
  supplier: Supplier;
  userId?: string;
  defaultProducts?: string[];
}

export default function ContactSupplierDialog({ supplier, userId, defaultProducts = [] }: ContactSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(defaultProducts);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleGenerateMessage = async () => {
    setGenerating(true);
    try {
      const products = selectedProducts.length > 0 ? selectedProducts : supplier.products.slice(0, 3);
      const generatedMessage = await generateNegotiationMessage(
        supplier.name,
        products,
        quantity || undefined,
        budget || undefined
      );
      setMessage(generatedMessage);
      toast({
        title: 'Message Generated',
        description: 'AI has generated a professional message for you.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate message. Please write your own.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to contact suppliers.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const success = await sendMessageToSupplier(userId, supplier.id, message, 'whatsapp');
      
      if (success) {
        toast({
          title: 'Message Sent',
          description: 'Your inquiry has been recorded. Contact the supplier via WhatsApp.',
        });
        
        // Open WhatsApp
        const whatsappNumber = supplier.contact.whatsapp || supplier.contact.phone;
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        setOpen(false);
        setMessage('');
        setQuantity('');
        setBudget('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: 'Send Failed',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact {supplier.name}</DialogTitle>
          <DialogDescription>
            Send an inquiry about products and pricing. Our AI can help draft a professional message.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="products">Products Interested In</Label>
            <Select
              value={selectedProducts[0] || ''}
              onValueChange={(value) => setSelectedProducts([value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select products..." />
              </SelectTrigger>
              <SelectContent>
                {supplier.products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Optional)</Label>
            <Input
              id="quantity"
              placeholder="e.g., 50 kg, 10 bags"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range (Optional)</Label>
            <Input
              id="budget"
              placeholder="e.g., 5,000 - 10,000 PKR"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Your Message</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateMessage}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>✨ AI Generate</>
                )}
              </Button>
            </div>
            <Textarea
              id="message"
              placeholder="Enter your message or use AI to generate one..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="flex-1"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
