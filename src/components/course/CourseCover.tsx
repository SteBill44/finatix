interface CourseCoverProps { level: string; code: string; className?: string; }
/** Token-driven exam artwork; one visual identity for every exam. */
const CourseCover = ({ level, code, className }: CourseCoverProps) => <svg viewBox="0 0 320 180" className={className} role="img" aria-label={`${level} exam ${code}`}>
  <rect width="320" height="180" fill="hsl(var(--secondary))" />
  <path d="M236 30h54v54M30 100v50h50" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
  <path d="M225 85h65M225 100h65M225 115h65" stroke="hsl(var(--border))" />
  <text x="30" y="48" fill="hsl(var(--muted-foreground))" fontSize="12" className="font-sans">{level.charAt(0).toUpperCase() + level.slice(1)} / Finatix</text>
  <text x="30" y="130" fill="hsl(var(--foreground))" fontSize="52" fontWeight="500" className="font-display">{code}</text>
</svg>;
export default CourseCover;
