/**
 * Client-side image compression utility
 * Reduces file size before uploading to improve performance
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

/**
 * Compress a single image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to compressed File
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (aspectRatio > maxWidth / maxHeight) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Determine best output format
        const isJpeg =
          file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg');
        const mimeType = isJpeg ? 'image/jpeg' : 'image/png';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            // Check if we need further compression
            if (blob.size > maxSizeKB * 1024) {
              // Reduce quality for JPEG
              if (isJpeg) {
                const lowerQuality = Math.max(0.5, quality - 0.2);
                canvas.toBlob(
                  (finalBlob) => {
                    if (!finalBlob) {
                      resolve(new File([blob], file.name, { type: mimeType }));
                      return;
                    }
                    resolve(new File([finalBlob], file.name, { type: mimeType }));
                  },
                  mimeType,
                  lowerQuality
                );
                return;
              }
            }

            resolve(new File([blob], file.name, { type: mimeType }));
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple image files in parallel
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Promise resolving to array of compressed Files
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> => {
  return Promise.all(files.map((file) => compressImage(file, options)));
};

/**
 * Validate if a file is a valid image
 */
export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Convert an image file into a compact Base64 Data URL (max 600px width, JPEG)
 * for storage directly inside database records (Option A).
 */
export const fileToDataUrl = (file: File, maxWidth = 600, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = img.width / img.height;
        const width = Math.min(img.width, maxWidth);
        const height = Math.round(width / ratio);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

