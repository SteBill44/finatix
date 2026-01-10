import { Link } from "react-router-dom";
import { Linkedin, Twitter, Youtube, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    courses: [
      { name: "Operational Level", path: "/courses?level=operational" },
      { name: "Management Level", path: "/courses?level=management" },
      { name: "Strategic Level", path: "/courses?level=strategic" },
      { name: "Case Study", path: "/courses?level=case-study" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Pricing", path: "/pricing" },
    ],
    support: [
      { name: "Contact Us", path: "/contact" },
      { name: "FAQ", path: "/contact#faq" },
      { name: "Student Dashboard", path: "/dashboard" },
      { name: "Help Center", path: "/help" },
    ],
    legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  return (
    <footer className={cn("bg-charcoal text-background", className)}>
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-teal-500/40">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-5 h-5"
                  fill="none"
                >
                  <path
                    d="M25 20 L70 20 L70 32 L45 32 L45 45 L65 45 L65 57 L45 57 L45 80 L33 80 L33 32 L25 32 L25 20 Z"
                    fill="white"
                  />
                  <path
                    d="M60 20 L70 20 L70 30 Z"
                    fill="rgba(255,255,255,0.6)"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">
                Fin<span className="text-primary">atix</span>
              </span>
            </Link>
            <p className="text-background/60 text-sm mb-6">
              Smarter CIMA study. Modern tools. Real insights.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-bold text-base uppercase tracking-wide mb-4 text-white">Courses</h4>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-background/60 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-base uppercase tracking-wide mb-4 text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-background/60 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-base uppercase tracking-wide mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-background/60 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-base uppercase tracking-wide mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-background/60 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 text-center">
          <p className="text-sm text-background/40">
            © {currentYear} Finatix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;