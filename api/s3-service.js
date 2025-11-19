/**
 * AWS S3 Image Upload Service
 * 
 * Handles secure file uploads using signed S3 URLs
 * Frontend uploads directly to S3 without exposing AWS credentials
 */

const AWS = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const db = require('./db');

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'vendibook-images';
const AWS_S3_URL = process.env.AWS_S3_URL || `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

// Initialize S3 client
const s3Client = new AWS.S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

// ============================================================================
// S3 HELPERS
// ============================================================================

/**
 * Generate unique S3 key for file
 * @param {string} userId - User ID
 * @param {string} filename - Original filename
 * @returns {string} - S3 key path
 */
function generateS3Key(userId, filename) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const ext = filename.split('.').pop();
  return `listings/${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * Get signed upload URL from S3
 * @param {string} key - S3 key
 * @param {string} contentType - MIME type
 * @param {number} expiresIn - URL expiration in seconds (default 15 minutes)
 * @returns {Promise<string>} - Signed upload URL
 */
async function getSignedUploadUrl(key, contentType, expiresIn = 900) {
  const command = new AWS.PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType
  });

  return AWS.getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get signed download URL for file
 * @param {string} key - S3 key
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {Promise<string>} - Signed download URL
 */
async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const command = new AWS.GetObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key
  });

  return AWS.getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete file from S3
 * @param {string} key - S3 key
 * @returns {Promise<void>}
 */
async function deleteFile(key) {
  const command = new AWS.DeleteObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key
  });

  await s3Client.send(command);
}

/**
 * Get file metadata from S3
 * @param {string} key - S3 key
 * @returns {Promise<object>} - File metadata
 */
async function getFileMetadata(key) {
  try {
    const command = new AWS.HeadObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key
    });

    const response = await s3Client.send(command);
    return {
      size: response.ContentLength,
      mimeType: response.ContentType,
      lastModified: response.LastModified
    };
  } catch (error) {
    if (error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get signed upload URL for user to upload image
 * @param {string} userId - User ID
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type (e.g., 'image/jpeg')
 * @returns {Promise<object>} - { uploadUrl, s3Key, publicUrl }
 */
async function getUploadUrl(userId, filename, contentType) {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(contentType)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
  }

  // Validate filename
  if (filename.length > 255) {
    throw new Error('Filename too long');
  }

  // Generate S3 key
  const s3Key = generateS3Key(userId, filename);

  // Get signed upload URL (15 minutes expiration)
  const uploadUrl = await getSignedUploadUrl(s3Key, contentType, 900);

  // Public URL for accessing the file
  const publicUrl = `${AWS_S3_URL}/${s3Key}`;

  return {
    uploadUrl,
    s3Key,
    publicUrl,
    expiresIn: 900
  };
}

/**
 * Confirm file upload and store metadata
 * @param {string} userId - User ID
 * @param {string} s3Key - S3 key of uploaded file
 * @param {string} filename - Original filename
 * @returns {Promise<object>} - Image asset record from database
 */
async function confirmUpload(userId, s3Key, filename) {
  try {
    // Get file metadata from S3
    const metadata = await getFileMetadata(s3Key);
    if (!metadata) {
      throw new Error('File not found in S3. Upload may have failed.');
    }

    // Store metadata in database
    const imageAsset = await db.imageAssets.create({
      url: `${AWS_S3_URL}/${s3Key}`,
      key: s3Key,
      size: metadata.size,
      mimeType: metadata.mimeType
    });

    return imageAsset;
  } catch (error) {
    // Clean up S3 file if database insert fails
    await deleteFile(s3Key).catch(() => {});
    throw error;
  }
}

/**
 * Delete image and remove from database
 * @param {string} imageId - Image asset ID
 * @returns {Promise<void>}
 */
async function deleteImage(imageId) {
  // Get image from database
  const image = await db.imageAssets.getById(imageId);
  if (!image) {
    throw new Error('Image not found');
  }

  // Delete from S3
  await deleteFile(image.key);

  // Delete from database
  await db.imageAssets.delete(imageId);
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Get public URLs for multiple files
 * @param {string[]} s3Keys - Array of S3 keys
 * @returns {string[]} - Array of public URLs
 */
function getPublicUrls(s3Keys) {
  return s3Keys.map(key => `${AWS_S3_URL}/${key}`);
}

/**
 * Delete multiple files
 * @param {string[]} s3Keys - Array of S3 keys to delete
 * @returns {Promise<void>}
 */
async function deleteFiles(s3Keys) {
  const deletePromises = s3Keys.map(key => deleteFile(key).catch(() => {}));
  await Promise.all(deletePromises);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate file size
 * @param {number} fileSizeBytes - File size in bytes
 * @param {number} maxSizeMb - Maximum allowed size in MB
 * @returns {boolean}
 */
function validateFileSize(fileSizeBytes, maxSizeMb = 10) {
  return fileSizeBytes <= maxSizeMb * 1024 * 1024;
}

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} - File extension
 */
function getExtensionFromMimeType(mimeType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return map[mimeType] || 'jpg';
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Upload operations
  getUploadUrl,
  confirmUpload,
  deleteImage,

  // File operations
  getFileMetadata,
  deleteFile,
  getSignedDownloadUrl,

  // Batch operations
  getPublicUrls,
  deleteFiles,

  // Utilities
  generateS3Key,
  validateFileSize,
  getExtensionFromMimeType,

  // Constants
  AWS_S3_BUCKET,
  AWS_S3_URL,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_FILE_SIZE_MB: 10
};
