import { useEffect, useRef, useState } from "react";

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Rasio luas tidak bisa dipakai: bagian yang sangat tinggi (mis. Our Story)
      // tidak pernah mencapai 15% terlihat. Picu saat tepi atas masuk 88% layar.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: visible ? "reveal reveal-visible" : "reveal" };
}
