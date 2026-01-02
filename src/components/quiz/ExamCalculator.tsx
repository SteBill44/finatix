import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamCalculatorProps {
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

const ExamCalculator = ({ onClose, initialPosition }: ExamCalculatorProps) => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isRadians, setIsRadians] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  
  // Dragging state
  const [position, setPosition] = useState(initialPosition || { x: 16, y: window.innerHeight - 500 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - (cardRef.current?.offsetWidth || 320);
      const maxY = window.innerHeight - (cardRef.current?.offsetHeight || 500);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.current.x;
      const newY = touch.clientY - dragOffset.current.y;
      
      const maxX = window.innerWidth - (cardRef.current?.offsetWidth || 320);
      const maxY = window.innerHeight - (cardRef.current?.offsetHeight || 500);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

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
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    setIsDragging(true);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const inputPercent = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (left: number, right: number, op: string): number => {
    switch (op) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "×":
        return left * right;
      case "÷":
        return right !== 0 ? left / right : 0;
      case "^":
        return Math.pow(left, right);
      case "yroot":
        return Math.pow(left, 1 / right);
      default:
        return right;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  const scientificFunction = (func: string) => {
    const value = parseFloat(display);
    let result: number;

    switch (func) {
      case "sin":
        result = isRadians ? Math.sin(value) : Math.sin(toRadians(value));
        break;
      case "cos":
        result = isRadians ? Math.cos(value) : Math.cos(toRadians(value));
        break;
      case "tan":
        result = isRadians ? Math.tan(value) : Math.tan(toRadians(value));
        break;
      case "asin":
        result = isRadians ? Math.asin(value) : toDegrees(Math.asin(value));
        break;
      case "acos":
        result = isRadians ? Math.acos(value) : toDegrees(Math.acos(value));
        break;
      case "atan":
        result = isRadians ? Math.atan(value) : toDegrees(Math.atan(value));
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "cbrt":
        result = Math.cbrt(value);
        break;
      case "x2":
        result = value * value;
        break;
      case "x3":
        result = value * value * value;
        break;
      case "1/x":
        result = value !== 0 ? 1 / value : 0;
        break;
      case "exp":
        result = Math.exp(value);
        break;
      case "10x":
        result = Math.pow(10, value);
        break;
      case "abs":
        result = Math.abs(value);
        break;
      case "fact":
        result = factorial(Math.floor(value));
        break;
      default:
        result = value;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const insertConstant = (constant: string) => {
    let value: number;
    switch (constant) {
      case "pi":
        value = Math.PI;
        break;
      case "e":
        value = Math.E;
        break;
      default:
        value = 0;
    }
    setDisplay(String(value));
    setWaitingForOperand(true);
  };

  const memoryOperation = (op: string) => {
    const value = parseFloat(display);
    switch (op) {
      case "MC":
        setMemory(0);
        break;
      case "MR":
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case "M+":
        setMemory(memory + value);
        setWaitingForOperand(true);
        break;
      case "M-":
        setMemory(memory - value);
        setWaitingForOperand(true);
        break;
    }
  };

  const btnBase = "h-9 text-sm font-medium rounded-md transition-colors";
  const btnScientific = cn(btnBase, "text-xs");

  return (
    <Card 
      ref={cardRef}
      className="w-80 p-3 shadow-2xl border-2 border-border bg-card fixed z-50"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Draggable Header */}
      <div 
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">Scientific Calculator</h3>
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

      {/* Mode Toggle */}
      <div className="flex gap-1 mb-2">
        <Button
          variant={isRadians ? "default" : "outline"}
          size="sm"
          className="h-6 text-xs flex-1"
          onClick={() => setIsRadians(true)}
        >
          RAD
        </Button>
        <Button
          variant={!isRadians ? "default" : "outline"}
          size="sm"
          className="h-6 text-xs flex-1"
          onClick={() => setIsRadians(false)}
        >
          DEG
        </Button>
        {memory !== 0 && (
          <span className="text-xs text-muted-foreground px-2 flex items-center">M</span>
        )}
      </div>

      {/* Display */}
      <div className="bg-secondary rounded-lg p-3 mb-2">
        <div className="text-right text-2xl font-mono text-foreground truncate">
          {display}
        </div>
        {operation && previousValue !== null && (
          <div className="text-right text-xs text-muted-foreground mt-1">
            {previousValue} {operation}
          </div>
        )}
      </div>

      {/* Memory Row */}
      <div className="grid grid-cols-4 gap-1 mb-1">
        <Button variant="ghost" className={btnScientific} onClick={() => memoryOperation("MC")}>MC</Button>
        <Button variant="ghost" className={btnScientific} onClick={() => memoryOperation("MR")}>MR</Button>
        <Button variant="ghost" className={btnScientific} onClick={() => memoryOperation("M+")}>M+</Button>
        <Button variant="ghost" className={btnScientific} onClick={() => memoryOperation("M-")}>M-</Button>
      </div>

      {/* Scientific Functions */}
      <div className="grid grid-cols-5 gap-1 mb-1">
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("sin")}>sin</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("cos")}>cos</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("tan")}>tan</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("log")}>log</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("ln")}>ln</Button>

        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("asin")}>sin⁻¹</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("acos")}>cos⁻¹</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("atan")}>tan⁻¹</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("exp")}>eˣ</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("10x")}>10ˣ</Button>

        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("x2")}>x²</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("x3")}>x³</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => performOperation("^")}>xʸ</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("sqrt")}>√</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("cbrt")}>∛</Button>

        <Button variant="secondary" className={btnScientific} onClick={() => insertConstant("pi")}>π</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => insertConstant("e")}>e</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("1/x")}>1/x</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("abs")}>|x|</Button>
        <Button variant="secondary" className={btnScientific} onClick={() => scientificFunction("fact")}>n!</Button>
      </div>

      {/* Standard Calculator Grid */}
      <div className="grid grid-cols-4 gap-1">
        <Button variant="secondary" className={btnBase} onClick={clear}>AC</Button>
        <Button variant="secondary" className={btnBase} onClick={toggleSign}>+/-</Button>
        <Button variant="secondary" className={btnBase} onClick={inputPercent}>%</Button>
        <Button className={cn(btnBase, "bg-primary hover:bg-primary/90")} onClick={() => performOperation("÷")}>÷</Button>

        <Button variant="outline" className={btnBase} onClick={() => inputDigit("7")}>7</Button>
        <Button variant="outline" className={btnBase} onClick={() => inputDigit("8")}>8</Button>
        <Button variant="outline" className={btnBase} onClick={() => inputDigit("9")}>9</Button>
        <Button className={cn(btnBase, "bg-primary hover:bg-primary/90")} onClick={() => performOperation("×")}>×</Button>

        <Button variant="outline" className={btnBase} onClick={() => inputDigit("4")}>4</Button>
        <Button variant="outline" className={btnBase} onClick={() => inputDigit("5")}>5</Button>
        <Button variant="outline" className={btnBase} onClick={() => inputDigit("6")}>6</Button>
        <Button className={cn(btnBase, "bg-primary hover:bg-primary/90")} onClick={() => performOperation("-")}>-</Button>

        <Button variant="outline" className={btnBase} onClick={() => inputDigit("1")}>1</Button>
        <Button variant="outline" className={btnBase} onClick={() => inputDigit("2")}>2</Button>
        <Button variant="outline" className={btnBase} onClick={() => inputDigit("3")}>3</Button>
        <Button className={cn(btnBase, "bg-primary hover:bg-primary/90")} onClick={() => performOperation("+")}>+</Button>

        <Button variant="outline" className={cn(btnBase, "col-span-2")} onClick={() => inputDigit("0")}>0</Button>
        <Button variant="outline" className={btnBase} onClick={inputDecimal}>.</Button>
        <Button className={cn(btnBase, "bg-accent hover:bg-accent/90")} onClick={handleEquals}>=</Button>
      </div>
    </Card>
  );
};

export default ExamCalculator;
