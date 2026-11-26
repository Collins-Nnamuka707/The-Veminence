import Image from "next/image";
import { productImageUrl } from "@/lib/supabase/public";
import { cn } from "@/lib/utils";

/** Small square product photo, or the first letter on a stone tile when there is no photo yet. */
export function ProductThumb({
  imagePath,
  name,
  size = 44,
  className,
}: {
  imagePath: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#efede8] ring-1 ring-foreground/5", className)}
      style={{ width: size, height: size }}
    >
      {imagePath ? (
        <Image src={productImageUrl(imagePath)} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="text-sm font-bold text-muted-foreground uppercase" aria-hidden="true">
          {name.charAt(0)}
        </span>
      )}
    </span>
  );
}
