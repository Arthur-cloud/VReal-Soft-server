/**
 * Type definitions for file uploads
 */

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}
