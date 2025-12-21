// 🔹 env variables FIRST
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';

// 🔹 mock AWS SDK v3
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({
      send: jest.fn().mockResolvedValue({})
    })),
    PutObjectCommand: jest.fn()
  };
});

// 🔹 import after mocks
const { uploadImageToS3 } = require('../../../utils/s3Uploader');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

describe('S3 Uploader - Unit Test', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return a valid S3 URL with a random key', async () => {
    const buffer = Buffer.from('fake-image-data');
    const originalName = 'profile.jpg';
    const mimetype = 'image/jpeg';

    const url = await uploadImageToS3(buffer, originalName, mimetype);

    // ✅ URL assertions
    expect(url).toContain('test-bucket.s3.us-east-1.amazonaws.com/events/');
    expect(url).toContain('.jpg');

    // ✅ behavior assertions (CORRECT WAY)
    expect(PutObjectCommand).toHaveBeenCalledTimes(1);
    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'test-bucket',
        ContentType: 'image/jpeg'
      })
    );
  });
});
