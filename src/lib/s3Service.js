import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { supabase } from './supabase'

// Service temporarily disabled/mocked
export class S3Service {
  static async getS3Client() {
    console.warn('S3Service.getS3Client called but S3 is disabled')
    return null
  }

  // Upload file to S3 storage
  static async uploadFile(bucketName, filePath, file, contentType) {
    console.log('Mocking S3 upload for:', filePath)
    return {
        success: true,
        result: { Mock: 'Upload' },
        filePath
    }
  }

  // Get file from S3 storage
  static async getFile(bucketName, filePath) {
    console.log('Mocking S3 getFile for:', filePath)
    return null
  }

  // Get public URL for file
  static getPublicUrl(bucketName, filePath) {
     return ''
  }

  // Delete file from S3
  static async deleteFile(bucketName, filePath) {
    return { success: true }
  }
}
