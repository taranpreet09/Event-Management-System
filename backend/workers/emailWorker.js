require('dotenv').config();
const { dequeue, EMAIL_QUEUE_KEY } = require('../utils/queue');
const sendEmail = require('../utils/sendEmail');

async function startEmailWorker() {
  console.log('📧 Email worker started, waiting for jobs...');

  while (true) {
    try {
      const job = await dequeue(EMAIL_QUEUE_KEY, 0); 
      if (!job) continue;

      const { payload } = job;
      if (!payload) {
        console.warn('Email worker received empty payload job');
        continue;
      }

      const { email, subject, html, text } = payload;
      console.log(`📧 Processing email job → ${email} | ${subject}`);

      await sendEmail({ email, subject, html, text });
      console.log('✅ Email sent');
    } catch (err) {
      console.error('❌ Email worker error:', err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

startEmailWorker().catch((err) => {
  console.error('Fatal email worker error:', err);
  process.exit(1);
});
