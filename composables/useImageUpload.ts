/**
 * Composable for handling image uploads to Supabase Storage
 * Provides consistent upload functionality across the application
 */

export type ImageBucket = 'product-images' | 'store-logos' | 'avatars'

export interface UploadOptions {
  bucket: ImageBucket
  folder?: string
  maxSizeMB?: number
  allowedTypes?: string[]
  generateUniqueName?: boolean
}

export interface UploadProgress {
  uploading: boolean
  progress: number
  error: string | null
}

export const useImageUpload = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Default allowed image types
  const defaultAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  // Max file sizes per bucket (in MB)
  const maxSizes: Record<ImageBucket, number> = {
    'product-images': 5,
    'store-logos': 2,
    'avatars': 1,
  }

  /**
   * Validate image file before upload
   */
  const validateFile = (
    file: File,
    options: UploadOptions
  ): { valid: boolean; error: string | null } => {
    const maxSize = options.maxSizeMB || maxSizes[options.bucket]
    const allowedTypes = options.allowedTypes || defaultAllowedTypes

    // Check file size
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`,
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes
          .map((t) => t.split('/')[1])
          .join(', ')}`,
      }
    }

    return { valid: true, error: null }
  }

  /**
   * Generate a unique filename
   */
  const generateFileName = (originalName: string): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }

  /**
   * Get the public URL for an uploaded image
   */
  const getPublicUrl = (bucket: ImageBucket, path: string): string => {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  /**
   * Upload an image file to Supabase Storage
   */
  const uploadImage = async (
    file: File,
    options: UploadOptions
  ): Promise<{ url: string | null; path: string | null; error: string | null }> => {
    try {
      // Validate file
      const validation = validateFile(file, options)
      if (!validation.valid) {
        return { url: null, path: null, error: validation.error }
      }

      // Check authentication
      if (!user.value) {
        return { url: null, path: null, error: 'Usuário não autenticado' }
      }

      // Generate filename
      const fileName = options.generateUniqueName
        ? generateFileName(file.name)
        : file.name

      // Build storage path
      const folder = options.folder || user.value.id
      const filePath = `${folder}/${fileName}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Don't overwrite existing files
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return { url: null, path: null, error: uploadError.message }
      }

      // Get public URL
      const publicUrl = getPublicUrl(options.bucket, filePath)

      return { url: publicUrl, path: filePath, error: null }
    } catch (err) {
      console.error('Unexpected upload error:', err)
      return {
        url: null,
        path: null,
        error: err instanceof Error ? err.message : 'Erro ao fazer upload',
      }
    }
  }

  /**
   * Delete an image from storage
   */
  const deleteImage = async (
    bucket: ImageBucket,
    path: string
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) {
        console.error('Delete error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected delete error:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar imagem',
      }
    }
  }

  /**
   * Replace an existing image (delete old, upload new)
   */
  const replaceImage = async (
    file: File,
    options: UploadOptions,
    oldPath?: string
  ): Promise<{ url: string | null; path: string | null; error: string | null }> => {
    // Upload new image first
    const uploadResult = await uploadImage(file, options)

    // If upload succeeded and there's an old image, delete it
    if (uploadResult.url && oldPath) {
      await deleteImage(options.bucket, oldPath)
    }

    return uploadResult
  }

  /**
   * Extract storage path from a public URL
   */
  const getPathFromUrl = (url: string, bucket: ImageBucket): string | null => {
    try {
      const bucketPath = `/storage/v1/object/public/${bucket}/`
      const index = url.indexOf(bucketPath)
      if (index === -1) return null
      return url.substring(index + bucketPath.length)
    } catch {
      return null
    }
  }

  return {
    uploadImage,
    deleteImage,
    replaceImage,
    getPublicUrl,
    getPathFromUrl,
    validateFile,
    maxSizes,
  }
}
