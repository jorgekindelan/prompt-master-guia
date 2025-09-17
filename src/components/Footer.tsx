import { Brain } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/20 border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              IA <span className="text-primary">Transformers</span>
            </span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p>© 2024 IA Transformers. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;