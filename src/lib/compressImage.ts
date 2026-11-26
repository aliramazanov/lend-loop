/*
 * compressImage: scales a photo down and converts it to WebP before upload, so listings
 * load fast and stay within the size limit.
 */

import { PHOTO_COMPRESSION } from "./config";

const { maxDimensionPx, webpQuality, outputType } = PHOTO_COMPRESSION;

function scaleToFit(width: number, height: number): number {
  return Math.min(1, maxDimensionPx / Math.max(width, height));
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, outputType, webpQuality),
  );
}

export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = scaleToFit(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");

  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await canvasToBlob(canvas);

  if (!blob || blob.size >= file.size) return file;

  const name = file.name.replace(/\.\w+$/, ".webp");

  return new File([blob], name, { type: outputType });
}
