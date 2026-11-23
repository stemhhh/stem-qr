export type SaveFilePayload = {
  defaultName: string
  mime: string
  base64: string
  locale?: string
}

export type SaveFileResult = {
  saved: boolean
  filePath?: string
}

declare global {
  interface Window {
    qrDesktop?: {
      isDesktop: boolean
      saveFile: (payload: SaveFilePayload) => Promise<SaveFileResult>
      showItemInFolder?: (filePath: string) => Promise<{ ok: boolean }>
      getLastExportDir?: () => Promise<string | null>
      onMenuAction?: (callback: (action: string) => void) => () => void
    }
  }
}

export {}
