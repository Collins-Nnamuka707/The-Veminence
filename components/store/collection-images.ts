import type { StaticImageData } from "next/image";
import type { CollectionKey } from "@/lib/collections";
import straightImage from "@/public/images/textures/straight.webp";
import wavyImage from "@/public/images/textures/wavy.webp";
import curlyImage from "@/public/images/textures/curly.webp";
import kinkyImage from "@/public/images/textures/kinky.webp";
import laceFrontImage from "@/public/images/textures/lace-front.webp";
import wigsImage from "@/public/images/types/wigs.webp";
import bundlesImage from "@/public/images/types/bundles.webp";
import closuresFrontalsImage from "@/public/images/types/closures-frontals.webp";

/**
 * The owner's photo for each collection: shown on the home page tiles and behind the title of the
 * collection page. A collection without one (New in, Best sellers) keeps the plain dark banner.
 */
export const COLLECTION_IMAGES: Partial<Record<CollectionKey, StaticImageData>> = {
  wigs: wigsImage,
  bundles: bundlesImage,
  "closures-frontals": closuresFrontalsImage,
  straight: straightImage,
  wavy: wavyImage,
  curly: curlyImage,
  kinky: kinkyImage,
  "lace-front": laceFrontImage,
};

/** Photo for a texture slug from the database, if there is one. */
export function textureImage(slug: string): StaticImageData | undefined {
  return COLLECTION_IMAGES[slug as CollectionKey];
}
