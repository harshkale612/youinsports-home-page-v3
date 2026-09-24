import { cn } from "@/lib/utils";

export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("relative w-full py-24 md:py-32 lg:py-40", className)}
      {...props}
    />
  );
}
