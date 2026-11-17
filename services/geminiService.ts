import { puter } from "@heyputer/puter.js";
import { TransformationConfig, RoomTheme } from "../types";

// ─── Auth ──────────────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  (window as any).puter = puter;
}

export interface PuterUser {
  username?: string;
  uuid?: string;
}

export async function getPuterUser(): Promise<PuterUser | null> {
  try {
    if (puter.auth.isSignedIn()) {
      const user = await puter.auth.getUser();
      return user;
    }
  } catch {
    // User not signed in or session expired
  }
  return null;
}

export async function signInPuter(): Promise<PuterUser | null> {
  await puter.auth.signIn({ request_auth: true });
  return getPuterUser();
}

export function signOutPuter(): void {
  puter.auth.signOut();
}

export async function switchPuterAccount(): Promise<PuterUser | null> {
  puter.auth.signOut();
  await puter.auth.signIn({ request_auth: true });
  return getPuterUser();
}

async function ensureSignedIn(): Promise<void> {
  if (!puter.auth.isSignedIn()) {
    await puter.auth.signIn();
  }
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

const THEME_PALETTES: Record<RoomTheme, string> = {
  [RoomTheme.CORPORATE_OFFICE]: "Professional slate blue, white, cool grey, and maple wood accents",
  [RoomTheme.MODERN]: "Monochromatic grey, charcoal, warm beige, and matte black accents",
  [RoomTheme.MINIMAL]: "Pure white, soft cream, light oak, and minimalist black outlines",
  [RoomTheme.MEDIEVAL]: "Stone grey, dark walnut wood, antique gold, and deep crimson accents",
  [RoomTheme.LUXURY]: "Rich cream, champagne gold, polished white marble, and deep navy velvet accents",
  [RoomTheme.SCANDINAVIAN]: "Light ash wood, muted grey, soft off-whites, and sage green accents",
  [RoomTheme.INDUSTRIAL]: "Raw concrete grey, exposed red brick, charcoal black metal, and weathered tan leather",
  [RoomTheme.BOHEMIAN]: "Warm terracotta, olive green, cream, mustard yellow, and natural jute/rattan textures",
  [RoomTheme.JAPANDI]: "Warm beige, soft whites, light oak, charcoal grey, and elements of natural clay",
};

function buildPrompt(config: TransformationConfig, multiView = false): string {
  const designStyle = config.theme;
  const colorPalette = THEME_PALETTES[config.theme] || "Harmonious palette that fits the selected style";
  
  let userRequirements = `Intensity: ${config.intensity}%.`;
  let strictPreservationPrompt = "";

  if (config.preserveLayout) {
    userRequirements += " CRITICAL: STRICTLY PRESERVE THE ORIGINAL ARCHITECTURE, WALLS, CEILING, FLOOR, AND FURNITURE LAYOUT. Lock all positions.";
    strictPreservationPrompt = `
* THE EXACT 1:1 COORDINATES, BOUNDARIES, OUTLINES, AND POSITIONS of all existing furniture, tables, desks, seating, and fixtures in the source image.
* DO NOT change the ceiling design. Keep the original ceiling flat and simple as in the source image. Do not add decorative wooden beams, coffered ceilings, or new architectural ceiling structures.
* DO NOT change the flooring structure. Keep the original floor tiles, perspective lines, and flooring layout exactly as is.
* DO NOT alter, move, or add structural columns, pillars, or wall boundaries.
* The structure, outlines, and placements of every wall, window, door, column, and furniture piece must align 100% perfectly with the original image. Only transform their colors, textures, and styles.`;
  } else {
    userRequirements += " Permission granted to rearrange or swap furniture layouts to best fit the style.";
    strictPreservationPrompt = `
* The original camera position, perspective, framing, and viewing angle.
* Realistic proportions and spatial relationships.
* Any structural columns, walls, ceilings, doors, and windows.`;
  }

  if (config.addOns && config.addOns.length > 0) {
    userRequirements += ` Add customization elements: ${config.addOns.join(", ")}.`;
  }
  if (config.customInstructions && config.customInstructions.trim().length > 0) {
    userRequirements += ` Custom user directives: ${config.customInstructions.trim()}.`;
  }
  if (multiView) {
    userRequirements += " This is a multi-view redesign. Keep style, color schemes, materials, and lighting identical and consistent across all views.";
  }

  return `You are an expert interior designer and photorealistic architectural visualization artist.

Transform the uploaded SOURCE ROOM into a professionally redesigned version according to:

Design style: ${designStyle}
Color palette: ${colorPalette}
Requirements: ${userRequirements}

PRESERVE:${strictPreservationPrompt}
* The same room architecture, dimensions, walls, ceiling, floor, doors, windows, columns, beams, and structural boundaries.
* The original camera position, perspective, framing, and viewing angle.

TRANSFORM:

* The surface appearance, materials, textures, paint, finishes, and colors of the furniture, walls, flooring, lighting, and decor according to the selected design style.
* Choose a cohesive color scheme that naturally complements the selected style.
* Keep furniture realistic in size, correctly positioned on the floor, and properly spaced.
* Add tasteful decorations appropriate to the style without cluttering the room.
* Use realistic materials, textures, reflections, shadows, and lighting.
* Maintain a cohesive, functional, and professional interior-design aesthetic.

IMPORTANT:

* DO NOT change the architecture, room layout, or spatial geometry.
* DO NOT move, add, or resize doors and windows.
* DO NOT distort the room's geometry or camera perspective.
* DO NOT create floating, duplicated, malformed, or physically impossible objects.
* DO NOT shift the location of any existing furniture if layout preservation is active. Only change their materials/styles.
* If a requested change conflicts with the existing architecture, choose the most realistic solution while preserving the original structure.

PHOTOREALISM:
Create a highly detailed, photorealistic interior photograph with natural lighting, realistic materials, accurate perspective, believable proportions, and professional interior photography quality.

The output must look like the EXACT SAME ROOM after a realistic professional interior renovation, not a newly invented room.`;
}

// ─── Error helper ──────────────────────────────────────────────────────────────

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (typeof e.error === "string") return e.error;
    try { return JSON.stringify(err); } catch { /* ignore */ }
  }
  return String(err);
}

// ─── Core helper ───────────────────────────────────────────────────────────────

async function generateImage(prompt: string, dataUrl: string): Promise<string> {
  await ensureSignedIn();

  try {
    const imgEl = await (puter.ai as any).txt2img(prompt, {
      provider: "gemini",
      model: "gemini-3.1-flash-image-preview",
      input_image: dataUrl,          // data-URI: "data:<mime>;base64,<data>"
    });

    if (!imgEl || !imgEl.src) {
      throw new Error("Puter.js returned no image. Please try again.");
    }

    return imgEl.src;
  } catch (raw) {
    throw new Error(extractMessage(raw));
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const transformRoomImage = async (
  imageBase64: string,
  mimeType: string,
  config: TransformationConfig
): Promise<string> => {
  const prompt = buildPrompt(config);
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  return generateImage(prompt, dataUrl);
};

export const transformMultiViewImages = async (
  images: { base64: string; mimeType: string }[],
  config: TransformationConfig
): Promise<string[]> => {
  const prompt = buildPrompt(config, true);
  return Promise.all(
    images.map((img) =>
      generateImage(prompt, `data:${img.mimeType};base64,${img.base64}`)
    )
  );
};
