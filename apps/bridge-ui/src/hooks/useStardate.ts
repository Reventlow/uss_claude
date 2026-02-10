import { useState, useEffect } from "react";
import { calculateStardate } from "@uss-claude/shared";

/** Hook that updates the stardate display every minute */
export function useStardate(): string {
  const [stardate, setStardate] = useState(() => calculateStardate());

  useEffect(() => {
    const interval = setInterval(() => {
      setStardate(calculateStardate());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return stardate;
}
