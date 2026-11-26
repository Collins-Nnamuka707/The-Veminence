"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { addProductImage, removeProductImage } from "@/app/admin/(panel)/products/actions";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { productImageUrl } from "@/lib/supabase/public";

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
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>The first photo is the main one in the shop. JPG, PNG, WebP or AVIF, up to 10 MB each.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {problems.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              {problems.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <li key={image.id} className="relative overflow-hidden rounded-lg border">
                <div className="relative aspect-[4/5] bg-muted">
                  <Image src={productImageUrl(image.storagePath)} alt={image.altEn} fill sizes="200px" className="object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2 p-2 text-xs">
                  <span className="text-muted-foreground">{index === 0 ? "Main photo" : `Photo ${index + 1}`}</span>
                  <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => remove(image.id)} aria-label={`Remove photo ${index + 1}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No photos yet. The shop shows a pattern placeholder until you add one.</p>
        )}

        <div>
          <input
            ref={input}
            type="file"
            accept={Object.keys(TYPES).join(",")}
            multiple
            className="sr-only"
            id="photo-upload"
            onChange={(e) => e.target.files?.length && upload(e.target.files)}
          />
          <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
            <ImagePlus className="size-4" />
            {busy ? "Working…" : "Add photos"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
