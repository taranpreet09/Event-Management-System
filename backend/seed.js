const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder');
  } catch (err) {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  }
}

function imageUrl() {
  const port = process.env.PORT || 5000;
  const base = process.env.SEED_IMAGE_BASE_URL || `http://localhost:${port}`;
  return `${base}/uploads/image.png`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(10, 0, 0, 0);
  return d;
}

async function importData() {
  try {
    await connectDB();
    await User.deleteMany();
    await Event.deleteMany();

    const salt = await bcrypt.genSalt(10);

    const organizerCount = 12;
    const userCount = 120;
    const categories = ['Workshop', 'Conference', 'Meetup', 'Webinar', 'Other'];
    const cities = ['San Francisco, CA', 'Austin, TX', 'New York, NY', 'Chicago, IL', 'Boston, MA', 'Seattle, WA', 'Los Angeles, CA', 'Napa Valley, CA', 'Sedona, AZ'];

    const organizers = Array.from({ length: organizerCount }).map((_, i) => ({
      name: `Organizer ${i + 1}`,
      email: `organizer${i + 1}@example.com`,
      password: bcrypt.hashSync('password123', salt),
      role: 'organizer',
    }));

    const users = Array.from({ length: userCount }).map((_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: bcrypt.hashSync('password123', salt),
      role: 'user',
    }));

    const created = await User.insertMany([...organizers, ...users]);
    const createdOrganizers = created.filter((u) => u.role === 'organizer');
    const createdUsers = created.filter((u) => u.role === 'user');

    const eventCount = 60;
    const events = [];
    for (let i = 0; i < eventCount; i++) {
      const org = createdOrganizers[i % createdOrganizers.length];
      const date = futureDate(randomInt(10, 180));
      const regDeadline = new Date(date.getTime() - randomInt(2, 7) * 24 * 60 * 60 * 1000);
      const capacity = randomInt(50, 500);
      const attendeePool = createdUsers.sort(() => Math.random() - 0.5).slice(0, Math.min(randomInt(10, 60), capacity));
      const attendees = attendeePool.map((u) => ({ user: u._id, isVerified: true }));
      const type = Math.random() < 0.5 ? 'in_person' : 'online';
      const location = type === 'online' ? 'Online' : randomItem(cities);
      const title = `Event ${i + 1}: ${randomItem(['Global Summit', 'Developer Conference', 'Creative Workshop', 'Music Fest', 'Tech Meetup'])}`;
      const shortDescription = `Short preview for ${title}`.slice(0, 200);
      const description = `Detailed description for ${title}.`;
      const category = randomItem(categories);

      events.push({
        title,
        shortDescription,
        description,
        type,
        category,
        date,
        registrationDeadline: regDeadline,
        location,
        coverImageUrl: imageUrl(),
        capacity,
        organizer: org._id,
        attendees,
      });
    }

    await Event.insertMany(events);
    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

async function destroyData() {
  try {
    await connectDB();
    await User.deleteMany();
    await Event.deleteMany();
    console.log('Data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('Destroy error:', error);
    process.exit(1);
  }
}

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}