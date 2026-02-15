import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, Loader2, Shield, Zap, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { derivePassword, generateMicrosoftPassword, getPasswordStrength } from '@/lib/passwordGenerator';
import { useToast } from '@/hooks/use-toast';

export function PasswordGenerator() {
  const [masterPassword, setMasterPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [length, setLength] = useState(32);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMaster, setShowMaster] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (!masterPassword.trim() || !domain.trim()) {
      toast({
        title: "Missing inputs",
        description: "Please enter both master password and domain",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const password = await derivePassword(masterPassword, domain.toLowerCase().trim(), length);
      setGeneratedPassword(password);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [masterPassword, domain, length, toast]);

  const handleCopy = useCallback(async () => {
    if (!generatedPassword) return;
    
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  }, [generatedPassword, toast]);

  const strength = generatedPassword ? getPasswordStrength(generatedPassword) : null;

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border border-border rounded-lg p-6 md:p-8 glow-primary"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Generate Password</h2>
            <p className="text-sm text-muted-foreground">Argon2id • Deterministic • Secure</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Master Password */}
          <div className="space-y-2">
            <Label htmlFor="master" className="text-foreground">Master Password</Label>
            <div className="relative">
              <Input
                id="master"
                type={showMaster ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Your secret master password"
                className="pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground font-mono"
              />
              <button
                type="button"
                onClick={() => setShowMaster(!showMaster)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showMaster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain" className="text-foreground">Domain / Site</Label>
            <Input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono"
            />
          </div>

          {/* Length Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Password Length</Label>
              <span className="text-sm font-mono text-primary">{length} chars</span>
            </div>
            <Slider
              value={[length]}
              onValueChange={(v) => setLength(v[0])}
              min={16}
              max={128}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>16</span>
              <span>128</span>
            </div>
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !masterPassword || !domain}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base glow-primary transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Deriving...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Derive
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                try {
                  const pw = generateMicrosoftPassword(length);
                  setGeneratedPassword(pw);
                } catch (error) {
                  toast({
                    title: "Generation failed",
                    description: error instanceof Error ? error.message : "Unknown error",
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              className="h-12 px-4 border-border hover:border-primary hover:text-primary transition-all"
              title="Random Microsoft-compatible password"
            >
              <Shuffle className="w-5 h-5 mr-1" />
              <span className="text-sm font-semibold">MS</span>
            </Button>
          </div>

          {/* Generated Password */}
          <AnimatePresence mode="wait">
            {generatedPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Generated Password</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-sm break-all text-foreground">
                    {showPassword 
                      ? generatedPassword 
                      : '•'.repeat(Math.min(generatedPassword.length, 40)) + (generatedPassword.length > 40 ? '...' : '')
                    }
                  </div>
                </div>

                {/* Strength Indicator */}
                {strength && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Strength</span>
                      <span className="font-semibold text-primary text-glow">{strength.label}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength.score / 8) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-primary rounded-full"
                        style={{
                          boxShadow: '0 0 10px hsl(175 80% 50% / 0.6)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        Same inputs always produce the same password. Nothing is stored.
      </motion.p>
    </div>
  );
}
