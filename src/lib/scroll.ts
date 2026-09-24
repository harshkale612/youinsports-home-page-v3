export function scrollToSection(id: string) {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
