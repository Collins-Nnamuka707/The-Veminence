"use client";

import { ImageIcon, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { addProductImage, removeProductImage } from "@/app/admin/(panel)/products/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { productImageUrl } from "@/lib/supabase/public";
import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket's limit

type Props = {
  productId: string;
  productName: string;
  images: { id: string; storagePath: string; altEn: string }[];
};

/**
 * Photos go from the browser straight to Supabase Storage (only admins may upload to the
 * product-images bucket), then a server action records them on the product.
 */
export function PhotoManager({ productId, productName, images }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  async function upload(files: FileList) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return setProblems(["Supabase is not configured."]);
    setBusy(true);
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      const extension = TYPES[file.type];
      if (!extension) {
        errors.push(`${file.name}: use a JPG, PNG, WebP or AVIF photo.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name}: photos can be at most 10 MB.`);
        continue;
      }
      const path = `${productId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (error) {
        errors.push(`${file.name}: upload failed (${error.message}).`);
        continue;
      }
      const saved = await addProductImage(productId, path, productName);
      if (saved.error) errors.push(`${file.name}: ${saved.error}`);
    }

    setProblems(errors);
    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  async function remove(imageId: string) {
    setBusy(true);
    const result = await removeProductImage(imageId);
    setProblems(result.error ? [result.error] : []);
    setBusy(false);
    router.refresh();
  }

  return (
    <Panel title="Photos" icon={ImageIcon} description="The first photo is the main one in the shop.">
      <div className="grid gap-4">
        {problems.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              {problems.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {images.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 lg:grid-cols-2">
            {images.map((image, index) => (
              <li key={image.id} className="group relative overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                <div className="relative aspect-square">
                  <Image src={productImageUrl(image.storagePath)} alt={image.altEn} fill sizes="(min-width: 1024px) 150px, 33vw" className="object-cover" />
                </div>
                {index === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-gold uppercase">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(image.id)}
                  aria-label={`Remove photo ${index + 1}`}
                  title="Remove photo"
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={input}
          type="file"
          accept={Object.keys(TYPES).join(",")}
          multiple
          className="peer sr-only"
          id="photo-upload"
          onChange={(e) => e.target.files?.length && upload(e.target.files)}
        />
        <label
          htmlFor="photo-upload"
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-input px-4 py-6 text-center transition-colors hover:border-gold-dark hover:bg-gold-tint/40 peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
            busy && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus className="size-6 text-[#6b5e3f]" aria-hidden="true" />
          <span className="text-sm font-semibold">{busy ? "Uploading…" : images.length > 0 ? "Add more photos" : "Add photos"}</span>
          <span className="text-xs text-muted-foreground">JPG, PNG, WebP or AVIF, up to 10 MB each</span>
        </label>
      </div>
    </Panel>
  );
}
