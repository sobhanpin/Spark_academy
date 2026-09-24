/**
 * Compresses an image file in the browser before upload, to save Supabase
 * Storage space and bandwidth. Resizes down to maxWidth and re-encodes as
 * JPEG at the given quality. Non-image files (PDFs, etc.) pass through
 * unchanged. If compression fails or doesn't actually shrink the file,
 * the original file is returned untouched — this never blocks an upload.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch {
    return file
  }
      }
