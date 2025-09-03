import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, Zap } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
  discount?: string;
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (packageId: string) => void;
  isLoading?: boolean;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'credits_5',
    name: '5 Magic Credits',
    credits: 5,
    price: 7,
    description: 'Perfect for creating 1 full adventure + extras'
  },
  {
    id: 'credits_15',
    name: '15 Magic Credits',
    credits: 15,
    price: 19,
    description: 'Great value pack for multiple adventures',
    popular: true,
    discount: '10% off'
  },
  {
    id: 'credits_30',
    name: '30 Magic Credits',
    credits: 30,
    price: 35,
    description: 'Best value for power users',
    discount: '17% off'
  }
];

const whatYouCanCreate = [
  { item: 'Full Adventure', credits: 3, description: 'Complete adventure with encounters, NPCs, and story' },
  { item: 'Individual Monster', credits: 1, description: 'Custom monster with stat block and lore' },
  { item: 'Individual NPC', credits: 1, description: 'Detailed NPC with personality and background' },
  { item: 'Magic Item', credits: 1, description: 'Unique magic item with properties and history' },
  { item: 'Puzzle', credits: 1, description: 'Creative puzzle or challenge for your adventure' },
  { item: 'Regenerate Section', credits: 1, description: 'Improve or modify existing content' }
];

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  isLoading = false
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = () => {
    if (selectedPackage) {
      onPurchase(selectedPackage);
    }
  };

  const getExampleCreations = (credits: number) => {
    const examples = [];
    const fullAdventures = Math.floor(credits / 3);
    const remainingCredits = credits % 3;
    
    if (fullAdventures > 0) {
      examples.push(`${fullAdventures} Full Adventure${fullAdventures > 1 ? 's' : ''}`);
    }
    
    if (remainingCredits > 0) {
      examples.push(`${remainingCredits} Individual Component${remainingCredits > 1 ? 's' : ''}`);
    }
    
    if (examples.length === 0) {
      examples.push(`${credits} Individual Components`);
    }
    
    return examples.join(' + ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Purchase Magic Credits</span>
          </DialogTitle>
          <DialogDescription>
            Expand your creative power with additional Magic Credits. Credits never expire and can be used for any creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Credit Packages */}
          <div className="grid md:grid-cols-3 gap-4">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                } ${pkg.popular ? 'ring-2 ring-primary/30' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                {pkg.discount && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 bg-green-500/90 text-white">
                    {pkg.discount}
                  </Badge>
                )}

                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-primary">
                    {pkg.credits} ✨
                  </div>
                  
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  
                  <div className="text-2xl font-bold">
                    €{pkg.price}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                  
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <strong>You can create:</strong><br />
                    {getExampleCreations(pkg.credits)}
                  </div>
                </div>

                {selectedPackage === pkg.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* What You Can Create Reference */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="font-semibold mb-3 flex items-center text-foreground">
              <Zap className="w-4 h-4 mr-2 text-primary" />
              Credit Cost Reference
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {whatYouCanCreate.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {item.credits} ✨
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{item.item}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Benefits */}
          <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
            <h4 className="font-semibold mb-2 text-accent">✨ Credit Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Credits never expire - use them whenever you need</li>
              <li>• Mix and match creations based on your campaign needs</li>
              <li>• All creations include high-quality content and formatting</li>
              <li>• Instant access - credits are added immediately after purchase</li>
              <li>• Secure payment processing through Stripe</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            
            <div className="flex items-center space-x-3">
              {selectedPackage && (
                <div className="text-sm text-muted-foreground">
                  Selected: {creditPackages.find(p => p.id === selectedPackage)?.name}
                </div>
              )}
              
              <Button
                onClick={handlePurchase}
                disabled={!selectedPackage || isLoading}
                className=""
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Purchase Credits
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditPurchaseModal;