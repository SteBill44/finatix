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
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-secondary">
            <th className="border border-border p-1 sticky left-0 bg-secondary z-10">n</th>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((r) => (
              <th key={r} className="border border-border p-1 whitespace-nowrap">{r}%</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pvTableData.map((row) => (
            <tr key={row.n}>
              <td className="border border-border p-1 font-semibold bg-secondary sticky left-0 z-10">{row.n}</td>
              {row.values.map((v, i) => (
                <td key={i} className="border border-border p-1 text-center whitespace-nowrap">{v}</td>
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
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-secondary">
            <th className="border border-border p-1 sticky left-0 bg-secondary z-10">n</th>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((r) => (
              <th key={r} className="border border-border p-1 whitespace-nowrap">{r}%</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cpvTableData.map((row) => (
            <tr key={row.n}>
              <td className="border border-border p-1 font-semibold bg-secondary sticky left-0 z-10">{row.n}</td>
              {row.values.map((v, i) => (
                <td key={i} className="border border-border p-1 text-center whitespace-nowrap">{v}</td>
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

// Full PV Table data (1-20% interest, periods 1-20)
const pvTableData = [
  { n: 1, values: [".990", ".980", ".971", ".962", ".952", ".943", ".935", ".926", ".917", ".909", ".901", ".893", ".885", ".877", ".870", ".862", ".855", ".847", ".840", ".833"] },
  { n: 2, values: [".980", ".961", ".943", ".925", ".907", ".890", ".873", ".857", ".842", ".826", ".812", ".797", ".783", ".769", ".756", ".743", ".731", ".718", ".706", ".694"] },
  { n: 3, values: [".971", ".942", ".915", ".889", ".864", ".840", ".816", ".794", ".772", ".751", ".731", ".712", ".693", ".675", ".658", ".641", ".624", ".609", ".593", ".579"] },
  { n: 4, values: [".961", ".924", ".888", ".855", ".823", ".792", ".763", ".735", ".708", ".683", ".659", ".636", ".613", ".592", ".572", ".552", ".534", ".516", ".499", ".482"] },
  { n: 5, values: [".951", ".906", ".863", ".822", ".784", ".747", ".713", ".681", ".650", ".621", ".593", ".567", ".543", ".519", ".497", ".476", ".456", ".437", ".419", ".402"] },
  { n: 6, values: [".942", ".888", ".837", ".790", ".746", ".705", ".666", ".630", ".596", ".564", ".535", ".507", ".480", ".456", ".432", ".410", ".390", ".370", ".352", ".335"] },
  { n: 7, values: [".933", ".871", ".813", ".760", ".711", ".665", ".623", ".583", ".547", ".513", ".482", ".452", ".425", ".400", ".376", ".354", ".333", ".314", ".296", ".279"] },
  { n: 8, values: [".923", ".853", ".789", ".731", ".677", ".627", ".582", ".540", ".502", ".467", ".434", ".404", ".376", ".351", ".327", ".305", ".285", ".266", ".249", ".233"] },
  { n: 9, values: [".914", ".837", ".766", ".703", ".645", ".592", ".544", ".500", ".460", ".424", ".391", ".361", ".333", ".308", ".284", ".263", ".243", ".225", ".209", ".194"] },
  { n: 10, values: [".905", ".820", ".744", ".676", ".614", ".558", ".508", ".463", ".422", ".386", ".352", ".322", ".295", ".270", ".247", ".227", ".208", ".191", ".176", ".162"] },
  { n: 11, values: [".896", ".804", ".722", ".650", ".585", ".527", ".475", ".429", ".388", ".350", ".317", ".287", ".261", ".237", ".215", ".195", ".178", ".162", ".148", ".135"] },
  { n: 12, values: [".887", ".788", ".701", ".625", ".557", ".497", ".444", ".397", ".356", ".319", ".286", ".257", ".231", ".208", ".187", ".168", ".152", ".137", ".124", ".112"] },
  { n: 13, values: [".879", ".773", ".681", ".601", ".530", ".469", ".415", ".368", ".326", ".290", ".258", ".229", ".204", ".182", ".163", ".145", ".130", ".116", ".104", ".093"] },
  { n: 14, values: [".870", ".758", ".661", ".577", ".505", ".442", ".388", ".340", ".299", ".263", ".232", ".205", ".181", ".160", ".141", ".125", ".111", ".099", ".088", ".078"] },
  { n: 15, values: [".861", ".743", ".642", ".555", ".481", ".417", ".362", ".315", ".275", ".239", ".209", ".183", ".160", ".140", ".123", ".108", ".095", ".084", ".074", ".065"] },
  { n: 16, values: [".853", ".728", ".623", ".534", ".458", ".394", ".339", ".292", ".252", ".218", ".188", ".163", ".141", ".123", ".107", ".093", ".081", ".071", ".062", ".054"] },
  { n: 17, values: [".844", ".714", ".605", ".513", ".436", ".371", ".317", ".270", ".231", ".198", ".170", ".146", ".125", ".108", ".093", ".080", ".069", ".060", ".052", ".045"] },
  { n: 18, values: [".836", ".700", ".587", ".494", ".416", ".350", ".296", ".250", ".212", ".180", ".153", ".130", ".111", ".095", ".081", ".069", ".059", ".051", ".044", ".038"] },
  { n: 19, values: [".828", ".686", ".570", ".475", ".396", ".331", ".277", ".232", ".194", ".164", ".138", ".116", ".098", ".083", ".070", ".060", ".051", ".043", ".037", ".031"] },
  { n: 20, values: [".820", ".673", ".554", ".456", ".377", ".312", ".258", ".215", ".178", ".149", ".124", ".104", ".087", ".073", ".061", ".051", ".043", ".037", ".031", ".026"] },
];

// Full Cumulative PV Table data (1-20% interest, periods 1-20)
const cpvTableData = [
  { n: 1, values: [".990", ".980", ".971", ".962", ".952", ".943", ".935", ".926", ".917", ".909", ".901", ".893", ".885", ".877", ".870", ".862", ".855", ".847", ".840", ".833"] },
  { n: 2, values: ["1.970", "1.942", "1.913", "1.886", "1.859", "1.833", "1.808", "1.783", "1.759", "1.736", "1.713", "1.690", "1.668", "1.647", "1.626", "1.605", "1.585", "1.566", "1.547", "1.528"] },
  { n: 3, values: ["2.941", "2.884", "2.829", "2.775", "2.723", "2.673", "2.624", "2.577", "2.531", "2.487", "2.444", "2.402", "2.361", "2.322", "2.283", "2.246", "2.210", "2.174", "2.140", "2.106"] },
  { n: 4, values: ["3.902", "3.808", "3.717", "3.630", "3.546", "3.465", "3.387", "3.312", "3.240", "3.170", "3.102", "3.037", "2.974", "2.914", "2.855", "2.798", "2.743", "2.690", "2.639", "2.589"] },
  { n: 5, values: ["4.853", "4.713", "4.580", "4.452", "4.329", "4.212", "4.100", "3.993", "3.890", "3.791", "3.696", "3.605", "3.517", "3.433", "3.352", "3.274", "3.199", "3.127", "3.058", "2.991"] },
  { n: 6, values: ["5.795", "5.601", "5.417", "5.242", "5.076", "4.917", "4.767", "4.623", "4.486", "4.355", "4.231", "4.111", "3.998", "3.889", "3.784", "3.685", "3.589", "3.498", "3.410", "3.326"] },
  { n: 7, values: ["6.728", "6.472", "6.230", "6.002", "5.786", "5.582", "5.389", "5.206", "5.033", "4.868", "4.712", "4.564", "4.423", "4.288", "4.160", "4.039", "3.922", "3.812", "3.706", "3.605"] },
  { n: 8, values: ["7.652", "7.325", "7.020", "6.733", "6.463", "6.210", "5.971", "5.747", "5.535", "5.335", "5.146", "4.968", "4.799", "4.639", "4.487", "4.344", "4.207", "4.078", "3.954", "3.837"] },
  { n: 9, values: ["8.566", "8.162", "7.786", "7.435", "7.108", "6.802", "6.515", "6.247", "5.995", "5.759", "5.537", "5.328", "5.132", "4.946", "4.772", "4.607", "4.451", "4.303", "4.163", "4.031"] },
  { n: 10, values: ["9.471", "8.983", "8.530", "8.111", "7.722", "7.360", "7.024", "6.710", "6.418", "6.145", "5.889", "5.650", "5.426", "5.216", "5.019", "4.833", "4.659", "4.494", "4.339", "4.192"] },
  { n: 11, values: ["10.368", "9.787", "9.253", "8.760", "8.306", "7.887", "7.499", "7.139", "6.805", "6.495", "6.207", "5.938", "5.687", "5.453", "5.234", "5.029", "4.836", "4.656", "4.486", "4.327"] },
  { n: 12, values: ["11.255", "10.575", "9.954", "9.385", "8.863", "8.384", "7.943", "7.536", "7.161", "6.814", "6.492", "6.194", "5.918", "5.660", "5.421", "5.197", "4.988", "4.793", "4.611", "4.439"] },
  { n: 13, values: ["12.134", "11.348", "10.635", "9.986", "9.394", "8.853", "8.358", "7.904", "7.487", "7.103", "6.750", "6.424", "6.122", "5.842", "5.583", "5.342", "5.118", "4.910", "4.715", "4.533"] },
  { n: 14, values: ["13.004", "12.106", "11.296", "10.563", "9.899", "9.295", "8.745", "8.244", "7.786", "7.367", "6.982", "6.628", "6.302", "6.002", "5.724", "5.468", "5.229", "5.008", "4.802", "4.611"] },
  { n: 15, values: ["13.865", "12.849", "11.938", "11.118", "10.380", "9.712", "9.108", "8.559", "8.061", "7.606", "7.191", "6.811", "6.462", "6.142", "5.847", "5.575", "5.324", "5.092", "4.876", "4.675"] },
  { n: 16, values: ["14.718", "13.578", "12.561", "11.652", "10.838", "10.106", "9.447", "8.851", "8.313", "7.824", "7.379", "6.974", "6.604", "6.265", "5.954", "5.668", "5.405", "5.162", "4.938", "4.730"] },
  { n: 17, values: ["15.562", "14.292", "13.166", "12.166", "11.274", "10.477", "9.763", "9.122", "8.544", "8.022", "7.549", "7.120", "6.729", "6.373", "6.047", "5.749", "5.475", "5.222", "4.990", "4.775"] },
  { n: 18, values: ["16.398", "14.992", "13.754", "12.659", "11.690", "10.828", "10.059", "9.372", "8.756", "8.201", "7.702", "7.250", "6.840", "6.467", "6.128", "5.818", "5.534", "5.273", "5.033", "4.812"] },
  { n: 19, values: ["17.226", "15.679", "14.324", "13.134", "12.085", "11.158", "10.336", "9.604", "8.950", "8.365", "7.839", "7.366", "6.938", "6.550", "6.198", "5.877", "5.584", "5.316", "5.070", "4.843"] },
  { n: 20, values: ["18.046", "16.351", "14.878", "13.590", "12.462", "11.470", "10.594", "9.818", "9.129", "8.514", "7.963", "7.469", "7.025", "6.623", "6.259", "5.929", "5.628", "5.353", "5.101", "4.870"] },
];

const normalTableData = [
  { z: 0.0, values: [".0000", ".0040", ".0080", ".0120", ".0160", ".0199", ".0239", ".0279", ".0319", ".0359"] },
  { z: 0.1, values: [".0398", ".0438", ".0478", ".0517", ".0557", ".0596", ".0636", ".0675", ".0714", ".0753"] },
  { z: 0.2, values: [".0793", ".0832", ".0871", ".0910", ".0948", ".0987", ".1026", ".1064", ".1103", ".1141"] },
  { z: 0.3, values: [".1179", ".1217", ".1255", ".1293", ".1331", ".1368", ".1406", ".1443", ".1480", ".1517"] },
  { z: 0.4, values: [".1554", ".1591", ".1628", ".1664", ".1700", ".1736", ".1772", ".1808", ".1844", ".1879"] },
  { z: 0.5, values: [".1915", ".1950", ".1985", ".2019", ".2054", ".2088", ".2123", ".2157", ".2190", ".2224"] },
  { z: 0.6, values: [".2257", ".2291", ".2324", ".2357", ".2389", ".2422", ".2454", ".2486", ".2518", ".2549"] },
  { z: 0.7, values: [".2580", ".2611", ".2642", ".2673", ".2704", ".2734", ".2764", ".2794", ".2823", ".2852"] },
  { z: 0.8, values: [".2881", ".2910", ".2939", ".2967", ".2995", ".3023", ".3051", ".3078", ".3106", ".3133"] },
  { z: 0.9, values: [".3159", ".3186", ".3212", ".3238", ".3264", ".3289", ".3315", ".3340", ".3365", ".3389"] },
  { z: 1.0, values: [".3413", ".3438", ".3461", ".3485", ".3508", ".3531", ".3554", ".3577", ".3599", ".3621"] },
  { z: 1.1, values: [".3643", ".3665", ".3686", ".3708", ".3729", ".3749", ".3770", ".3790", ".3810", ".3830"] },
  { z: 1.2, values: [".3849", ".3869", ".3888", ".3907", ".3925", ".3944", ".3962", ".3980", ".3997", ".4015"] },
  { z: 1.3, values: [".4032", ".4049", ".4066", ".4082", ".4099", ".4115", ".4131", ".4147", ".4162", ".4177"] },
  { z: 1.4, values: [".4192", ".4207", ".4222", ".4236", ".4251", ".4265", ".4279", ".4292", ".4306", ".4319"] },
  { z: 1.5, values: [".4332", ".4345", ".4357", ".4370", ".4382", ".4394", ".4406", ".4418", ".4429", ".4441"] },
  { z: 1.6, values: [".4452", ".4463", ".4474", ".4484", ".4495", ".4505", ".4515", ".4525", ".4535", ".4545"] },
  { z: 1.7, values: [".4554", ".4564", ".4573", ".4582", ".4591", ".4599", ".4608", ".4616", ".4625", ".4633"] },
  { z: 1.8, values: [".4641", ".4649", ".4656", ".4664", ".4671", ".4678", ".4686", ".4693", ".4699", ".4706"] },
  { z: 1.9, values: [".4713", ".4719", ".4726", ".4732", ".4738", ".4744", ".4750", ".4756", ".4761", ".4767"] },
  { z: 2.0, values: [".4772", ".4778", ".4783", ".4788", ".4793", ".4798", ".4803", ".4808", ".4812", ".4817"] },
  { z: 2.1, values: [".4821", ".4826", ".4830", ".4834", ".4838", ".4842", ".4846", ".4850", ".4854", ".4857"] },
  { z: 2.2, values: [".4861", ".4864", ".4868", ".4871", ".4875", ".4878", ".4881", ".4884", ".4887", ".4890"] },
  { z: 2.3, values: [".4893", ".4896", ".4898", ".4901", ".4904", ".4906", ".4909", ".4911", ".4913", ".4916"] },
  { z: 2.4, values: [".4918", ".4920", ".4922", ".4925", ".4927", ".4929", ".4931", ".4932", ".4934", ".4936"] },
  { z: 2.5, values: [".4938", ".4940", ".4941", ".4943", ".4945", ".4946", ".4948", ".4949", ".4951", ".4952"] },
  { z: 2.6, values: [".4953", ".4955", ".4956", ".4957", ".4959", ".4960", ".4961", ".4962", ".4963", ".4964"] },
  { z: 2.7, values: [".4965", ".4966", ".4967", ".4968", ".4969", ".4970", ".4971", ".4972", ".4973", ".4974"] },
  { z: 2.8, values: [".4974", ".4975", ".4976", ".4977", ".4977", ".4978", ".4979", ".4979", ".4980", ".4981"] },
  { z: 2.9, values: [".4981", ".4982", ".4982", ".4983", ".4984", ".4984", ".4985", ".4985", ".4986", ".4986"] },
  { z: 3.0, values: [".4987", ".4987", ".4987", ".4988", ".4988", ".4989", ".4989", ".4989", ".4990", ".4990"] },
];

export default FormulaSheet;