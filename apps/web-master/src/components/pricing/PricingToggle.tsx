"use client";

interface Props {
  billingPeriod: "monthly" | "annual";
  onToggle: (period: "monthly" | "annual") => void;
}

export function PricingToggle({ billingPeriod, onToggle }: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
        Monthly
      </span>
      <button
        onClick={() => onToggle(billingPeriod === "monthly" ? "annual" : "monthly")}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border ${
          billingPeriod === "annual" ? "bg-accent-red border-accent-red" : "bg-muted border-border"
        }`}
        role="switch"
        aria-checked={billingPeriod === "annual"}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            billingPeriod === "annual" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${billingPeriod === "annual" ? "text-accent-red" : "text-accent-red"}`}>
        Annual
        <span className="ml-1 text-xs text-accent-red">(Save 20%)</span>
      </span>
    </div>
  );
}
