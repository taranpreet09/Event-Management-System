
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

// 1. Initialize the S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET;

// Safety check for the Infrastructure
if (!bucketName) {
  console.warn('⚠️ AWS_S3_BUCKET is not set. Image uploads will fail until configured.');
}

/**
 * Generates a random hex string to ensure unique filenames.
 */
function randomKey(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Uploads a file buffer to S3 and returns the public URL.
 * @param {Buffer} buffer - The image data
 * @param {string} originalName - Original filename (to extract extension)
 * @param {string} mimetype - e.g., 'image/jpeg'
 * @returns {Promise<string>} The public URL of the uploaded image
 */
async function uploadImageToS3(buffer, originalName, mimetype) {
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  // 2. Prepare the File Key (Path)
  const ext = path.extname(originalName) || '.jpg';
  const key = `events/${randomKey()}${ext}`;

  // 3. Create the Upload Command
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimetype || 'image/jpeg',
    ACL: 'public-read', // Makes the image viewable by users
  });

  // 4. Send to AWS
  await s3Client.send(command);

  // 5. Construct the Public URL
  const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL || `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  return `${baseUrl}/${key}`;
}

module.exports = { uploadImageToS3 };