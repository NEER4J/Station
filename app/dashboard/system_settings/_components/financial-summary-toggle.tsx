"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinancialSummaryToggleProps {
  initialVisible: boolean;
  onToggle: (visible: boolean) => void;
}

export function FinancialSummaryToggle({
  initialVisible,
  onToggle,
}: FinancialSummaryToggleProps) {
  const [visible, setVisible] = useState(initialVisible);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !visible;
    setVisible(next);
    startTransition(() => {
      onToggle(next);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2"
    >
      {visible ? (
        <>
          <EyeOff className="h-4 w-4" />
          Hide Financial Data
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Show Financial Data
        </>
      )}
    </Button>
  );
}
