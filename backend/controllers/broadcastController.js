const { redisClient } = require('../config/redis');
const { enqueueNotificationJob } = require('../utils/queue');

exports.createBroadcast = async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ msg: 'Access denied: Organizers only' });
  }

  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ msg: 'Title and text are required' });
  }

  try {
    const payload = {
      id: new Date().getTime(),
      title,
      text,
      organizerId: req.user.id,
    };

    await enqueueNotificationJob({
      type: 'BROADCAST_MESSAGE',
      payload,
    });

    res.json({ msg: 'Broadcast message enqueued successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};