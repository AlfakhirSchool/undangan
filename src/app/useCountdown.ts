import { useEffect, useState } from "react";

export function useCountdown(targetISO: string) {
  const [remaining, setRemaining] = useState(() => diff(targetISO));

  useEffect(() => {
    const id = setInterval(() => setRemaining(diff(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  return remaining;
}

function diff(targetISO: string) {
  const ms = Math.max(0, new Date(targetISO).getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}
