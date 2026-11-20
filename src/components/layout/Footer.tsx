import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import FinatixLogo from "@/components/FinatixLogo";

interface FooterProps {
  className?: string;
}

const COLUMNS = [
  {
    title: "CIMA levels",
    links: [
      { name: "Certificate", path: "/courses?level=certificate" },
      { name: "Operational", path: "/courses?level=operational" },
      { name: "Management", path: "/courses?level=management" },
      { name: "Strategic", path: "/courses?level=strategic" },
    ],
  },
  {
    title: "Study",
    links: [
      { name: "All CIMA exams", path: "/courses" },
      { name: "The platform", path: "/#platform" },
      { name: "Why CIMA?", path: "/why-cima" },
      { name: "Pricing", path: "/pricing" },
    ],
  },
  {
    title: "Finatix",
    links: [
      { name: "About", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "Help centre", path: "/help" },
      { name: "Student dashboard", path: "/dashboard" },
      { name: "My certificates", path: "/certificates" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy policy", path: "/privacy" },
      { name: "Terms of service", path: "/terms" },
      { name: "Cookie policy", path: "/cookies" },
    ],
  },
];

const Footer = ({ className }: FooterProps) => (
  <footer className={cn("border-t border-border bg-card", className)}>
    <div className="container mx-auto px-5 md:px-8 py-14">
      <div className="grid grid-cols-2 gap-10 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
        <div className="col-span-2 max-w-xs lg:col-span-1">
          <FinatixLogo size="sm" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            One connected study platform. All sixteen CIMA exams, from Certificate to Strategic.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-4 text-sm font-semibold text-foreground">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.name}>
                  <Link to={l.path} className="rounded text-sm text-muted-foreground transition-colors hover:text-primary">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Finatix. All rights reserved.</p>
        <p>Not affiliated with, accredited or endorsed by AICPA &amp; CIMA.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
