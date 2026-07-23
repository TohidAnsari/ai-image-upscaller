import Link from 'next/link';
import { Image as ImageIcon, Sparkles, User, Settings } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="w-full border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span>Limina<span className="text-primary">AI</span></span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/tools" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              AI Tools
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
