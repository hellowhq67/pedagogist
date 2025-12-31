import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="py-12 bg-card border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="PedagogistsPTE" className="h-8 w-auto" />
              <span className="text-lg font-bold text-foreground">PedagogistsPTE</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Master PTE Academic with AI-powered practice and instant scoring.
            </p>
          </div>

          {/* Practice */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Practice</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Speaking</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Writing</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Reading</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Listening</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tips & Tricks</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Score Calculator</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PedagogistsPTE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
