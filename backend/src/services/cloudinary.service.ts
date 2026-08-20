export class CloudinaryService {
  /**
   * Upload an in-memory buffer to Cloudinary using upload_stream
   */
  async uploadBuffer(buffer: Buffer, folder: string = 'leetverse'): Promise<{ url: string; secureUrl: string; publicId: string }> {
    // TODO: Step 1 - Create upload stream via cloudinary.uploader.upload_stream({ folder, resource_type: 'image' })
    // TODO: Step 2 - Pipe/end buffer into stream
    // TODO: Step 3 - Resolve with { url, secureUrl: result.secure_url, publicId: result.public_id }
    // TODO: Step 4 - Reject with AppError(500, UPLOAD_FAILED) on error
    throw new Error(`[TODO] uploadBuffer not implemented for folder: ${folder}`);
  }

  /**
   * Upload multiple image buffers concurrently
   */
  async uploadMultipleBuffers(files: Express.Multer.File[], folder: string = 'leetverse'): Promise<string[]> {
    // TODO: Run Promise.all on this.uploadBuffer for all files
    // TODO: Return array of secure URLs
    throw new Error(`[TODO] uploadMultipleBuffers not implemented for ${files.length} files`);
  }
}

export const cloudinaryService = new CloudinaryService();
