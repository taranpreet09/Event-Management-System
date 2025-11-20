const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET;

if (!bucketName) {
  console.warn('⚠️ AWS_S3_BUCKET is not set. Image uploads will fail until configured.');
}

function randomKey(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Uploads a file buffer to S3 and returns the public URL.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimetype
 * @returns {Promise<string>} public URL
 */
async function uploadImageToS3(buffer, originalName, mimetype) {
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  const ext = path.extname(originalName) || '.jpg';
  const key = `events/${randomKey()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimetype || 'image/jpeg',
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL || `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  return `${baseUrl}/${key}`;
}

module.exports = { uploadImageToS3 };
