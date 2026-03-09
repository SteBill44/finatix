import { Link } from "react-router-dom";
import { Linkedin, Twitter, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import FinatixLogo from "@/components/FinatixLogo";

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
      { name: "Why CIMA?", path: "/why-cima" },
      { name: "About Us", path: "/about" },
      { name: "Pricing", path: "/pricing" },
      { name: "My Certificates", path: "/certificates" },
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

  // Social links - update these with actual URLs when available
  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/finatix", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/finatix", label: "Twitter" },
    { icon: Youtube, href: "https://youtube.com/@finatix", label: "YouTube" },
  ];

  return (
    <footer className={cn("bg-charcoal text-background", className)}>
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <FinatixLogo size="sm" lightFin />
            </div>
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
            <h4 className="font-bold text-base uppercase tracking-wide mb-4 text-white dark:text-black dark:text-black">Courses</h4>
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
            <h4 className="font-bold text-base uppercase tracking-wide dark:text-black mb-4 text-white">Company</h4>
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