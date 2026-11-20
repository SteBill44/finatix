const PILLARS = [
  { code: "E", name: "Enterprise", text: "Strategy, organisations and people: how businesses are run and changed.", papers: "E1 · E2 · E3" },
  { code: "P", name: "Performance", text: "Management accounting, costing, risk and decisions that shape results.", papers: "P1 · P2 · P3" },
  { code: "F", name: "Financial", text: "Financial reporting, tax and the funding decisions behind the numbers.", papers: "F1 · F2 · F3" },
];

export default function CimaPillars() {
  return (
    <section id="pillars" aria-labelledby="pillars-title" className="section-space border-t border-border bg-background scroll-mt-24">
      <div className="container px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">How CIMA is built</p>
          <h2 id="pillars-title" className="section-title">Three pillars. One case study per level.</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            After the Certificate, each level has three subject exams, one from each pillar. The case study exam then brings them together.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.code} className="bg-card p-7">
              <span className="font-mono text-4xl font-bold text-primary">{p.code}</span>
              <h3 className="mt-4 text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{p.papers}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-lg border border-primary/40 bg-primary/5 p-5 text-sm">
          <strong className="text-foreground">Case studies:</strong>{" "}
          <span className="text-muted-foreground">OCS, MCS and SCS combine all three pillars at the Operational, Management and Strategic levels.</span>
        </p>
      </div>
    </section>
  );
}
