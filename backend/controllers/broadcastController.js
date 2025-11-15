const { redisClient } = require('../config/redis');

exports.createBroadcast = async (req, res) => {
  // 1. Check for permission (organizer only)
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ msg: 'Access denied: Organizers only' });
  }

  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ msg: 'Title and text are required' });
  }

  try {
    const channel = 'notifications'; // A new channel, just for this!
    const message = JSON.stringify({
      type: 'BROADCAST_MESSAGE',
      payload: {
        id: new Date().getTime(), // Simple unique ID
        title,
        text,
      },
    });

    // 2. Publish the broadcast
    await redisClient.publish(channel, message);
    console.log(`🚀 [Pub/Sub] PUBLISHED message to '${channel}'`);

    res.json({ msg: 'Broadcast message sent successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};