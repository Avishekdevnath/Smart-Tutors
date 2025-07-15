import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  public_id?: string;
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  file: File | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const uploadOptions = {
      folder: options.folder || 'smart-tutors',
      transformation: options.transformation,
      public_id: options.public_id,
    };

    let result;
    
    if (typeof file === 'string') {
      // Upload from URL
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // Upload from file buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      result = await new Promise<UploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadResult);
          }
        ).end(buffer);
      });
    }

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
  } = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  const transformation = [];
  
  if (width || height) {
    transformation.push(`${crop},w_${width || 'auto'},h_${height || 'auto'}`);
  }
  
  transformation.push(`q_${quality}`, `f_${format}`);

  return cloudinary.url(publicId, {
    transformation: transformation.join('/'),
    secure: true
  });
}

/**
 * Generate avatar URL for tutors
 */
export function getAvatarUrl(publicId: string, size: number = 150): string {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 80
  });
}

/**
 * Generate thumbnail URL for tuition images
 */
export function getThumbnailUrl(publicId: string, width: number = 300, height: number = 200): string {
  return getOptimizedImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 85
  });
} 