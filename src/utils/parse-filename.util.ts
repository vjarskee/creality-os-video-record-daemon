export function parseFilename(filePath: string) {
  const parts = filePath.split('/')
  const fileName = parts[parts.length - 1]

  if (!fileName) return 'undefined'

  return fileName
}
