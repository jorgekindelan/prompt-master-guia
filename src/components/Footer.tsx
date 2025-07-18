import { Button } from "@/components/ui/button";
import { Heart, Brain, Github, Twitter, Mail, ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    producto: [
      { label: "Guía de Prompting", href: "#guia" },
      { label: "Builder Interactivo", href: "#builder" },
      { label: "Explorar Prompts", href: "#explorar" },
      { label: "Recursos", href: "#recursos" }
    ],
    comunidad: [
      { label: "Únete a la Comunidad", href: "#comunidad" },
      { label: "Contribuir", href: "#comunidad" },
      { label: "Top Colaboradores", href: "#comunidad" },
      { label: "Normas", href: "#comunidad" }
    ],
    recursos: [
      { label: "Documentación", href: "#recursos" },
      { label: "Tutoriales", href: "#guia" },
      { label: "Herramientas", href: "#recursos" },
      { label: "Glosario", href: "#recursos" }
    ],
    soporte: [
      { label: "Centro de Ayuda", href: "#" },
      { label: "Contacto", href: "mailto:info@promptguide.com" },
      { label: "Reportar Bug", href: "#" },
      { label: "Sugerencias", href: "#comunidad" }
    ]
  };

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Prompt<span className="text-primary">Guide</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              La guía más completa para dominar el arte del prompting. 
              Aprende, practica y comparte con una comunidad activa.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-2">
              {footerLinks.producto.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Comunidad</h4>
            <ul className="space-y-2">
              {footerLinks.comunidad.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
            <ul className="space-y-2">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-card rounded-xl p-8 mb-12 border border-border/50">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Mantente al día con las últimas técnicas
            </h3>
            <p className="text-muted-foreground mb-6">
              Recibe prompts exclusivos, técnicas avanzadas y novedades de IA directamente en tu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 px-6">
                Suscribirse
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Sin spam. Solo contenido valioso. Cancela cuando quieras.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
            <p>© 2024 PromptGuide. Todos los derechos reservados.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
              <a href="#" className="hover:text-primary transition-colors">Términos</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <p className="text-sm text-muted-foreground flex items-center space-x-1">
              <span>Hecho con</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>para la comunidad IA</span>
            </p>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={scrollToTop}
              className="hover:bg-primary/10"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;