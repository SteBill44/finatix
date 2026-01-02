import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, GripHorizontal, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormulaSheetProps {
  onClose: () => void;
  examLevel: "BA1" | "BA2" | "BA3" | "BA4" | "P1" | "P2" | "P3" | "F2" | "F3";
}

const FormulaSheet = ({ onClose, examLevel }: FormulaSheetProps) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const maxX = window.innerWidth - (cardRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (cardRef.current?.offsetHeight || 500);
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.current.x;
      const newY = touch.clientY - dragOffset.current.y;
      const maxX = window.innerWidth - (cardRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (cardRef.current?.offsetHeight || 500);
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    setIsDragging(true);
  };

  // Check if this exam level has formulae
  const hasFormulae = !["BA3", "BA4"].includes(examLevel);

  if (!hasFormulae) {
    return (
      <Card
        ref={cardRef}
        className="w-80 p-4 shadow-2xl border-2 border-border bg-card fixed z-50"
        style={{ left: position.x, top: position.y }}
      >
        <div
          className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleTouchStart}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Formula Sheet</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-3 h-3" />
          </Button>
        </div>
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No formula sheets are provided for {examLevel} exams.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      ref={cardRef}
      className="w-[400px] shadow-2xl border-2 border-border bg-card fixed z-50"
      style={{ left: position.x, top: position.y }}
    >
      {/* Draggable Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-border cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">{examLevel} Formula Sheet</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <Tabs defaultValue="formulae" className="w-full">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="formulae" className="flex-1">Formulae</TabsTrigger>
          <TabsTrigger value="pv" className="flex-1">PV Table</TabsTrigger>
          <TabsTrigger value="cpv" className="flex-1">Cumulative PV</TabsTrigger>
          {["BA2", "P1", "P2", "F2"].includes(examLevel) && (
            <TabsTrigger value="normal" className="flex-1">Normal Dist.</TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="h-[400px]">
          <TabsContent value="formulae" className="p-4 mt-0">
            {examLevel === "BA1" && <BA1Formulae />}
            {examLevel === "BA2" && <BA2Formulae />}
            {examLevel === "P1" && <P1Formulae />}
            {examLevel === "P2" && <P2Formulae />}
            {examLevel === "F2" && <F2Formulae />}
            {examLevel === "F3" && <F3Formulae />}
            {examLevel === "P3" && <P3Formulae />}
          </TabsContent>

          <TabsContent value="pv" className="p-4 mt-0">
            <PresentValueTable />
          </TabsContent>

          <TabsContent value="cpv" className="p-4 mt-0">
            <CumulativePVTable />
          </TabsContent>

          <TabsContent value="normal" className="p-4 mt-0">
            <NormalDistributionTable />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

// BA1 Formulae
const BA1Formulae = () => (
  <div className="space-y-4 text-sm">
    <FormulaSection title="Internal Rate of Return (IRR)">
      <p className="font-mono bg-secondary/50 p-2 rounded">
        IRR = r₁ + [(NPV₁ / (NPV₁ - NPV₂)) × (r₂ - r₁)]
      </p>
    </FormulaSection>

    <FormulaSection title="Least-Squares Regression">
      <p className="text-muted-foreground mb-2">Y = a + bx</p>
      <div className="space-y-1 font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>b = [nΣXY - (ΣX)(ΣY)] / [nΣX² - (ΣX)²]</p>
        <p>a = Ȳ - bX̄</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Coefficient of Correlation">
      <div className="font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>r = [nΣXY - (ΣX)(ΣY)] / √[(nΣX² - (ΣX)²)(nΣY² - (ΣY)²)]</p>
        <p className="mt-2">R(rank) = 1 - [6Σd² / n(n² - 1)]</p>
      </div>
    </FormulaSection>
  </div>
);

// BA2 Formulae
const BA2Formulae = () => (
  <div className="space-y-4 text-sm">
    <FormulaSection title="Linear Regression">
      <p className="text-muted-foreground mb-2">Y = a + bX</p>
      <div className="space-y-1 font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>b = Covariance(XY) / Variance(X)</p>
        <p>a = Ȳ - bX̄</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Probability">
      <div className="space-y-2 font-mono bg-secondary/50 p-2 rounded text-xs">
        <p><strong>Mutually exclusive:</strong> P(A∪B) = P(A) + P(B)</p>
        <p><strong>Not mutually exclusive:</strong> P(A∪B) = P(A) + P(B) - P(A∩B)</p>
        <p><strong>Independent:</strong> P(A∩B) = P(A) × P(B)</p>
        <p><strong>Not independent:</strong> P(A∩B) = P(A) × P(B|A)</p>
        <p className="mt-2">E(X) = Σ(probability × payoff)</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Descriptive Statistics">
      <div className="space-y-1 font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>Mean: x̄ = Σx/n or Σfx/Σf</p>
        <p>SD = √[Σ(x - x̄)²/n]</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Index Numbers">
      <div className="space-y-1 font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>Price relative = 100 × P₁/P₀</p>
        <p>Quantity relative = 100 × Q₁/Q₀</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Time Series">
      <div className="space-y-1 font-mono bg-secondary/50 p-2 rounded text-xs">
        <p><strong>Additive:</strong> Y = T + S + R</p>
        <p><strong>Multiplicative:</strong> Y = T × S × R</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Financial Mathematics">
      <div className="space-y-1 font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>Future Value: S = X(1 + r)ⁿ</p>
        <p>Annuity PV: PV = (1/r)[1 - (1+r)⁻ⁿ]</p>
        <p>Perpetuity PV: PV = 1/r</p>
      </div>
    </FormulaSection>
  </div>
);

// P1 Formulae (placeholder - similar structure)
const P1Formulae = () => (
  <div className="space-y-4 text-sm">
    <FormulaSection title="P1 Management Accounting">
      <p className="text-muted-foreground">
        Standard P1 formulae for management accounting including variance analysis,
        budgeting, and cost management.
      </p>
    </FormulaSection>
  </div>
);

// P2 Formulae
const P2Formulae = () => (
  <div className="space-y-4 text-sm">
    <FormulaSection title="P2 Advanced Management Accounting">
      <p className="text-muted-foreground">
        Advanced formulae for decision making, risk management, and performance evaluation.
      </p>
    </FormulaSection>
  </div>
);

// F2 Formulae
const F2Formulae = () => (
  <div className="space-y-4 text-sm">
    <FormulaSection title="F2 Advanced Financial Reporting">
      <p className="text-muted-foreground">
        Formulae for group accounts, financial instruments, and complex reporting scenarios.
      </p>
    </FormulaSection>
  </div>
);

// F3 Formulae
const F3Formulae = () => (
  <div className="space-y-4 text-sm">
    <FormulaSection title="Dividend Valuation Model (DVM)">
      <div className="font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>P₀ = d₁ / (kₑ - g)</p>
        <p>kₑ = (d₁/P₀) + g</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Capital Asset Pricing Model (CAPM)">
      <div className="font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>k = Rf + β(Rm - Rf)</p>
        <p>βᵤ = βₑ × [VE / (VE + VD(1-t))]</p>
      </div>
    </FormulaSection>

    <FormulaSection title="WACC">
      <div className="font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>WACC = kₑ(VE/V) + kd(1-t)(VD/V)</p>
        <p>V = VE + VD + TB</p>
      </div>
    </FormulaSection>

    <FormulaSection title="FX & Interest Rates">
      <div className="font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>F₀ = S₀ × (1 + rbase)</p>
        <p>S₁ = S₀ × (1 + rvar) / (1 + rbase)</p>
        <p>(1 + rnom) = (1 + rreal) × (1 + inflation)</p>
      </div>
    </FormulaSection>

    <FormulaSection title="TERP (Theoretical Ex-Rights Price)">
      <div className="font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>TERP = [(N × cum rights price) + issue price] / (N + 1)</p>
      </div>
    </FormulaSection>

    <FormulaSection title="Value at Risk (VaR)">
      <div className="font-mono bg-secondary/50 p-2 rounded text-xs">
        <p>VaR = confidence interval × standard deviation</p>
      </div>
    </FormulaSection>
  </div>
);

// P3 Formulae
const P3Formulae = () => (
  <div className="space-y-4 text-sm">
    <FormulaSection title="P3 Risk Management">
      <p className="text-muted-foreground">
        No specific formulae provided - tables only for P3 exams.
      </p>
    </FormulaSection>
  </div>
);

// Present Value Table Component
const PresentValueTable = () => (
  <div className="text-xs">
    <h4 className="font-semibold mb-2">Present Value of $1 = (1+r)⁻ⁿ</h4>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary">
            <th className="border border-border p-1">n</th>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
              <th key={r} className="border border-border p-1">{r}%</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pvTableData.map((row) => (
            <tr key={row.n}>
              <td className="border border-border p-1 font-semibold bg-secondary">{row.n}</td>
              {row.values.map((v, i) => (
                <td key={i} className="border border-border p-1 text-center">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Cumulative PV Table Component
const CumulativePVTable = () => (
  <div className="text-xs">
    <h4 className="font-semibold mb-2">Cumulative PV of $1 per annum</h4>
    <p className="text-muted-foreground mb-2 text-[10px]">[1-(1+r)⁻ⁿ]/r</p>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary">
            <th className="border border-border p-1">n</th>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
              <th key={r} className="border border-border p-1">{r}%</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cpvTableData.map((row) => (
            <tr key={row.n}>
              <td className="border border-border p-1 font-semibold bg-secondary">{row.n}</td>
              {row.values.map((v, i) => (
                <td key={i} className="border border-border p-1 text-center">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Normal Distribution Table Component
const NormalDistributionTable = () => (
  <div className="text-xs">
    <h4 className="font-semibold mb-2">Area Under Normal Curve</h4>
    <p className="text-muted-foreground mb-2 text-[10px]">z = (x - μ) / σ</p>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary">
            <th className="border border-border p-1">z</th>
            {[0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09].map((d) => (
              <th key={d} className="border border-border p-1">.0{(d * 100).toString().padStart(1, "0")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {normalTableData.map((row) => (
            <tr key={row.z}>
              <td className="border border-border p-1 font-semibold bg-secondary">{row.z.toFixed(1)}</td>
              {row.values.map((v, i) => (
                <td key={i} className="border border-border p-1 text-center">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Helper component
const FormulaSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="font-semibold text-foreground mb-2">{title}</h4>
    {children}
  </div>
);

// Table data (subset for display)
const pvTableData = [
  { n: 1, values: [".990", ".980", ".971", ".962", ".952", ".943", ".935", ".926", ".917", ".909"] },
  { n: 2, values: [".980", ".961", ".943", ".925", ".907", ".890", ".873", ".857", ".842", ".826"] },
  { n: 3, values: [".971", ".942", ".915", ".889", ".864", ".840", ".816", ".794", ".772", ".751"] },
  { n: 4, values: [".961", ".924", ".888", ".855", ".823", ".792", ".763", ".735", ".708", ".683"] },
  { n: 5, values: [".951", ".906", ".863", ".822", ".784", ".747", ".713", ".681", ".650", ".621"] },
  { n: 6, values: [".942", ".888", ".837", ".790", ".746", ".705", ".666", ".630", ".596", ".564"] },
  { n: 7, values: [".933", ".871", ".813", ".760", ".711", ".665", ".623", ".583", ".547", ".513"] },
  { n: 8, values: [".923", ".853", ".789", ".731", ".677", ".627", ".582", ".540", ".502", ".467"] },
  { n: 9, values: [".914", ".837", ".766", ".703", ".645", ".592", ".544", ".500", ".460", ".424"] },
  { n: 10, values: [".905", ".820", ".744", ".676", ".614", ".558", ".508", ".463", ".422", ".386"] },
];

const cpvTableData = [
  { n: 1, values: [".990", ".980", ".971", ".962", ".952", ".943", ".935", ".926", ".917", ".909"] },
  { n: 2, values: ["1.970", "1.942", "1.913", "1.886", "1.859", "1.833", "1.808", "1.783", "1.759", "1.736"] },
  { n: 3, values: ["2.941", "2.884", "2.829", "2.775", "2.723", "2.673", "2.624", "2.577", "2.531", "2.487"] },
  { n: 4, values: ["3.902", "3.808", "3.717", "3.630", "3.546", "3.465", "3.387", "3.312", "3.240", "3.170"] },
  { n: 5, values: ["4.853", "4.713", "4.580", "4.452", "4.329", "4.212", "4.100", "3.993", "3.890", "3.791"] },
  { n: 6, values: ["5.795", "5.601", "5.417", "5.242", "5.076", "4.917", "4.767", "4.623", "4.486", "4.355"] },
  { n: 7, values: ["6.728", "6.472", "6.230", "6.002", "5.786", "5.582", "5.389", "5.206", "5.033", "4.868"] },
  { n: 8, values: ["7.652", "7.325", "7.020", "6.733", "6.463", "6.210", "5.971", "5.747", "5.535", "5.335"] },
  { n: 9, values: ["8.566", "8.162", "7.786", "7.435", "7.108", "6.802", "6.515", "6.247", "5.995", "5.759"] },
  { n: 10, values: ["9.471", "8.983", "8.530", "8.111", "7.722", "7.360", "7.024", "6.710", "6.418", "6.145"] },
];

const normalTableData = [
  { z: 0.0, values: [".0000", ".0040", ".0080", ".0120", ".0160", ".0199", ".0239", ".0279", ".0319", ".0359"] },
  { z: 0.5, values: [".1915", ".1950", ".1985", ".2019", ".2054", ".2088", ".2123", ".2157", ".2190", ".2224"] },
  { z: 1.0, values: [".3413", ".3438", ".3461", ".3485", ".3508", ".3531", ".3554", ".3577", ".3599", ".3621"] },
  { z: 1.5, values: [".4332", ".4345", ".4357", ".4370", ".4382", ".4394", ".4406", ".4418", ".4429", ".4441"] },
  { z: 2.0, values: [".4772", ".4778", ".4783", ".4788", ".4793", ".4798", ".4803", ".4808", ".4812", ".4817"] },
  { z: 2.5, values: [".4938", ".4940", ".4941", ".4943", ".4945", ".4946", ".4948", ".4949", ".4951", ".4952"] },
  { z: 3.0, values: [".4987", ".4987", ".4987", ".4988", ".4988", ".4989", ".4989", ".4989", ".4990", ".4990"] },
];

export default FormulaSheet;