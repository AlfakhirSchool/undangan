import { useEffect, useState } from "react";

export function useScrollBackground(count: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      const next = Math.min(count - 1, Math.floor(progress * count));
      setIndex(next);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [count]);

  return index;
}
