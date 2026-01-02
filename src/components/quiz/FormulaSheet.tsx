import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, GripHorizontal, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormulaSheetProps {
  onClose: () => void;
  examLevel: "BA1" | "BA2" | "BA3" | "BA4" | "P1" | "P2" | "P3" | "F2" | "F3";
}

const FormulaSheet = ({ onClose, examLevel }: FormulaSheetProps) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 520, y: 80 });
  const [size, setSize] = useState({ width: 500, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const prevState = useRef({ position: { x: 0, y: 0 }, size: { width: 500, height: 500 } });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;
        setSize({
          width: Math.max(350, Math.min(resizeStart.current.width + deltaX, window.innerWidth - position.x)),
          height: Math.max(300, Math.min(resizeStart.current.height + deltaY, window.innerHeight - position.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (isDragging && !isMaximized) {
        const newX = touch.clientX - dragOffset.current.x;
        const newY = touch.clientY - dragOffset.current.y;
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
      if (isResizing) {
        const deltaX = touch.clientX - resizeStart.current.x;
        const deltaY = touch.clientY - resizeStart.current.y;
        setSize({
          width: Math.max(350, Math.min(resizeStart.current.width + deltaX, window.innerWidth - position.x)),
          height: Math.max(300, Math.min(resizeStart.current.height + deltaY, window.innerHeight - position.y)),
        });
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing, size.width, size.height, position.x, position.y, isMaximized]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMaximized) return;
    const touch = e.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    setIsDragging(true);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStart.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height };
    setIsResizing(true);
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    resizeStart.current = { x: touch.clientX, y: touch.clientY, width: size.width, height: size.height };
    setIsResizing(true);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setPosition(prevState.current.position);
      setSize(prevState.current.size);
    } else {
      prevState.current = { position, size };
      setPosition({ x: 10, y: 70 });
      setSize({ width: window.innerWidth - 20, height: window.innerHeight - 80 });
    }
    setIsMaximized(!isMaximized);
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
      className="shadow-2xl border-2 border-border bg-card fixed z-50 flex flex-col"
      style={{ 
        left: position.x, 
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Draggable Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b border-border select-none flex-shrink-0",
          !isMaximized && "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">{examLevel} Formula Sheet</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleMaximize}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
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
      </div>

      <Tabs defaultValue="formulae" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b flex-shrink-0">
          <TabsTrigger value="formulae" className="flex-1">Formulae</TabsTrigger>
          <TabsTrigger value="pv" className="flex-1">PV Table</TabsTrigger>
          <TabsTrigger value="cpv" className="flex-1">Cumulative PV</TabsTrigger>
          {["BA2", "P1", "P2", "F2"].includes(examLevel) && (
            <TabsTrigger value="normal" className="flex-1">Normal Dist.</TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="formulae" className="mt-0 h-full">
            {examLevel === "BA1" && <BA1Formulae />}
            {examLevel === "BA2" && <BA2Formulae />}
            {examLevel === "P1" && <P1Formulae />}
            {examLevel === "P2" && <P2Formulae />}
            {examLevel === "F2" && <F2Formulae />}
            {examLevel === "F3" && <F3Formulae />}
            {examLevel === "P3" && <P3Formulae />}
          </TabsContent>

          <TabsContent value="pv" className="mt-0 h-full">
            <PresentValueTable />
          </TabsContent>

          <TabsContent value="cpv" className="mt-0 h-full">
            <CumulativePVTable />
          </TabsContent>

          <TabsContent value="normal" className="mt-0 h-full">
            <NormalDistributionTable />
          </TabsContent>
        </div>
      </Tabs>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeTouchStart}
        >
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
          </svg>
        </div>
      )}
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
            {["0.00", "0.01", "0.02", "0.03", "0.04", "0.05", "0.06", "0.07", "0.08", "0.09"].map((d) => (
              <th key={d} className="border border-border p-1">{d}</th>
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
  { z: 0.0, values: ["0.0000", "0.0040", "0.0080", "0.0120", "0.0160", "0.0199", "0.0239", "0.0279", "0.0319", "0.0359"] },
  { z: 0.1, values: ["0.0398", "0.0438", "0.0478", "0.0517", "0.0557", "0.0596", "0.0636", "0.0675", "0.0714", "0.0753"] },
  { z: 0.2, values: ["0.0793", "0.0832", "0.0871", "0.0910", "0.0948", "0.0987", "0.1026", "0.1064", "0.1103", "0.1141"] },
  { z: 0.3, values: ["0.1179", "0.1217", "0.1255", "0.1293", "0.1331", "0.1368", "0.1406", "0.1443", "0.1480", "0.1517"] },
  { z: 0.4, values: ["0.1554", "0.1591", "0.1628", "0.1664", "0.1700", "0.1736", "0.1772", "0.1808", "0.1844", "0.1879"] },
  { z: 0.5, values: ["0.1915", "0.1950", "0.1985", "0.2019", "0.2054", "0.2088", "0.2123", "0.2157", "0.2190", "0.2224"] },
  { z: 0.6, values: ["0.2257", "0.2291", "0.2324", "0.2357", "0.2389", "0.2422", "0.2454", "0.2486", "0.2518", "0.2549"] },
  { z: 0.7, values: ["0.2580", "0.2611", "0.2642", "0.2673", "0.2704", "0.2734", "0.2764", "0.2794", "0.2823", "0.2852"] },
  { z: 0.8, values: ["0.2881", "0.2910", "0.2939", "0.2967", "0.2995", "0.3023", "0.3051", "0.3078", "0.3106", "0.3133"] },
  { z: 0.9, values: ["0.3159", "0.3186", "0.3212", "0.3238", "0.3264", "0.3289", "0.3315", "0.3340", "0.3365", "0.3389"] },
  { z: 1.0, values: ["0.3413", "0.3438", "0.3461", "0.3485", "0.3508", "0.3531", "0.3554", "0.3577", "0.3599", "0.3621"] },
  { z: 1.1, values: ["0.3643", "0.3665", "0.3686", "0.3708", "0.3729", "0.3749", "0.3770", "0.3790", "0.3810", "0.3830"] },
  { z: 1.2, values: ["0.3849", "0.3869", "0.3888", "0.3907", "0.3925", "0.3944", "0.3962", "0.3980", "0.3997", "0.4015"] },
  { z: 1.3, values: ["0.4032", "0.4049", "0.4066", "0.4082", "0.4099", "0.4115", "0.4131", "0.4147", "0.4162", "0.4177"] },
  { z: 1.4, values: ["0.4192", "0.4207", "0.4222", "0.4236", "0.4251", "0.4265", "0.4279", "0.4292", "0.4306", "0.4319"] },
  { z: 1.5, values: ["0.4332", "0.4345", "0.4357", "0.4370", "0.4382", "0.4394", "0.4406", "0.4418", "0.4429", "0.4441"] },
  { z: 1.6, values: ["0.4452", "0.4463", "0.4474", "0.4484", "0.4495", "0.4505", "0.4515", "0.4525", "0.4535", "0.4545"] },
  { z: 1.7, values: ["0.4554", "0.4564", "0.4573", "0.4582", "0.4591", "0.4599", "0.4608", "0.4616", "0.4625", "0.4633"] },
  { z: 1.8, values: ["0.4641", "0.4649", "0.4656", "0.4664", "0.4671", "0.4678", "0.4686", "0.4693", "0.4699", "0.4706"] },
  { z: 1.9, values: ["0.4713", "0.4719", "0.4726", "0.4732", "0.4738", "0.4744", "0.4750", "0.4756", "0.4761", "0.4767"] },
  { z: 2.0, values: ["0.4772", "0.4778", "0.4783", "0.4788", "0.4793", "0.4798", "0.4803", "0.4808", "0.4812", "0.4817"] },
  { z: 2.1, values: ["0.4821", "0.4826", "0.4830", "0.4834", "0.4838", "0.4842", "0.4846", "0.4850", "0.4854", "0.4857"] },
  { z: 2.2, values: ["0.4861", "0.4864", "0.4868", "0.4871", "0.4875", "0.4878", "0.4881", "0.4884", "0.4887", "0.4890"] },
  { z: 2.3, values: ["0.4893", "0.4896", "0.4898", "0.4901", "0.4904", "0.4906", "0.4909", "0.4911", "0.4913", "0.4916"] },
  { z: 2.4, values: ["0.4918", "0.4920", "0.4922", "0.4925", "0.4927", "0.4929", "0.4931", "0.4932", "0.4934", "0.4936"] },
  { z: 2.5, values: ["0.4938", "0.4940", "0.4941", "0.4943", "0.4945", "0.4946", "0.4948", "0.4949", "0.4951", "0.4952"] },
  { z: 2.6, values: ["0.4953", "0.4955", "0.4956", "0.4957", "0.4959", "0.4960", "0.4961", "0.4962", "0.4963", "0.4964"] },
  { z: 2.7, values: ["0.4965", "0.4966", "0.4967", "0.4968", "0.4969", "0.4970", "0.4971", "0.4972", "0.4973", "0.4974"] },
  { z: 2.8, values: ["0.4974", "0.4975", "0.4976", "0.4977", "0.4977", "0.4978", "0.4979", "0.4979", "0.4980", "0.4981"] },
  { z: 2.9, values: ["0.4981", "0.4982", "0.4982", "0.4983", "0.4984", "0.4984", "0.4985", "0.4985", "0.4986", "0.4986"] },
  { z: 3.0, values: ["0.4987", "0.4987", "0.4987", "0.4988", "0.4988", "0.4989", "0.4989", "0.4989", "0.4990", "0.4990"] },
  { z: 3.1, values: ["0.4990", "0.4991", "0.4991", "0.4991", "0.4992", "0.4992", "0.4992", "0.4992", "0.4993", "0.4993"] },
  { z: 3.2, values: ["0.4993", "0.4993", "0.4994", "0.4994", "0.4994", "0.4994", "0.4994", "0.4995", "0.4995", "0.4995"] },
  { z: 3.3, values: ["0.4995", "0.4995", "0.4995", "0.4996", "0.4996", "0.4996", "0.4996", "0.4996", "0.4996", "0.4997"] },
  { z: 3.4, values: ["0.4997", "0.4997", "0.4997", "0.4997", "0.4997", "0.4997", "0.4997", "0.4997", "0.4998", "0.4998"] },
];

export default FormulaSheet;