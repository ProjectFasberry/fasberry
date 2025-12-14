import { getObjectUrl } from "#/helpers/volume"

export type GalleryRow = { url: string }

export const landHelpers = (() => {
  function getLandsUrl(path: string): string {
    return getObjectUrl("lands", path)
  }

  function transformBanner(input?: string | null): string | null {
    if (!input) return null
    return getLandsUrl(input)
  }

  function transformGallery(input: GalleryRow[] = []): string[] {
    return input.map(row => getLandsUrl(row.url))
  }

  return {
    getLandsUrl,
    transformBanner,
    transformGallery,
  }
})()