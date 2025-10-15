"use client";

interface ProgressBarProps {
  percent: number; // 0 a 100
}

export function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${
          percent < 40
            ? "bg-red-500"
            : percent < 70
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
        style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
      />
    </div>
  );
}
