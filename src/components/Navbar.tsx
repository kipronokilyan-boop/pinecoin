import { BarChart3 } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">Pinecoin Paid Surveys</span>
        </div>
        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          Features
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
