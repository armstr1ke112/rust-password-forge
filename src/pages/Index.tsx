import { motion } from 'framer-motion';
import { Lock, Shield, Cpu } from 'lucide-react';
import { PasswordGenerator } from '@/components/PasswordGenerator';

const features = [
  {
    icon: Shield,
    title: 'Argon2id',
    description: '64MB memory-hard KDF',
  },
  {
    icon: Lock,
    title: 'Deterministic',
    description: 'Same inputs = same output',
  },
  {
    icon: Cpu,
    title: 'Client-side',
    description: 'Nothing leaves your device',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full border border-border mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground font-mono">Rust-grade security</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            <span className="text-primary text-glow">Insane</span> Password Generator
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Deterministic password derivation using Argon2id. 
            One master password, infinite unique passwords.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-3 px-4 py-2 bg-card/50 rounded-lg border border-border/50"
            >
              <feature.icon className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold text-foreground text-sm">{feature.title}</span>
                <span className="text-muted-foreground text-sm ml-2">{feature.description}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Generator */}
        <PasswordGenerator />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 text-xs text-muted-foreground"
        >
          <p>Built with 🦀 Rust algorithm • Powered by WebCrypto</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
