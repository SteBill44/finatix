import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamCalculatorProps {
  onClose: () => void;
}

const ExamCalculator = ({ onClose }: ExamCalculatorProps) => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

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

  const buttonClass =
    "h-12 text-lg font-medium rounded-lg transition-colors";

  return (
    <Card className="w-72 p-4 shadow-2xl border-2 border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Calculator</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Display */}
      <div className="bg-secondary rounded-lg p-4 mb-4">
        <div className="text-right text-3xl font-mono text-foreground truncate">
          {display}
        </div>
        {operation && previousValue !== null && (
          <div className="text-right text-sm text-muted-foreground mt-1">
            {previousValue} {operation}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <Button
          variant="secondary"
          className={buttonClass}
          onClick={clear}
        >
          AC
        </Button>
        <Button
          variant="secondary"
          className={buttonClass}
          onClick={toggleSign}
        >
          +/-
        </Button>
        <Button
          variant="secondary"
          className={buttonClass}
          onClick={inputPercent}
        >
          %
        </Button>
        <Button
          className={cn(buttonClass, "bg-primary hover:bg-primary/90")}
          onClick={() => performOperation("÷")}
        >
          ÷
        </Button>

        {/* Row 2 */}
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("7")}
        >
          7
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("8")}
        >
          8
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("9")}
        >
          9
        </Button>
        <Button
          className={cn(buttonClass, "bg-primary hover:bg-primary/90")}
          onClick={() => performOperation("×")}
        >
          ×
        </Button>

        {/* Row 3 */}
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("4")}
        >
          4
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("5")}
        >
          5
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("6")}
        >
          6
        </Button>
        <Button
          className={cn(buttonClass, "bg-primary hover:bg-primary/90")}
          onClick={() => performOperation("-")}
        >
          -
        </Button>

        {/* Row 4 */}
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("1")}
        >
          1
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("2")}
        >
          2
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => inputDigit("3")}
        >
          3
        </Button>
        <Button
          className={cn(buttonClass, "bg-primary hover:bg-primary/90")}
          onClick={() => performOperation("+")}
        >
          +
        </Button>

        {/* Row 5 */}
        <Button
          variant="outline"
          className={cn(buttonClass, "col-span-2")}
          onClick={() => inputDigit("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={inputDecimal}
        >
          .
        </Button>
        <Button
          className={cn(buttonClass, "bg-accent hover:bg-accent/90")}
          onClick={handleEquals}
        >
          =
        </Button>
      </div>
    </Card>
  );
};

export default ExamCalculator;
