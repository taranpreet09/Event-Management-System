const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for Seeder...');
  } catch (err) {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  }
};

const mockUsers = [
  // Organizers
  { name: 'TechCon Global', email: 'contact@techcon.com', password: 'password123', role: 'organizer' },
  { name: 'MusicFest Planners', email: 'booking@musicfest.com', password: 'password123', role: 'organizer' },
  { name: 'Creative Workshops Inc.', email: 'learn@creative.com', password: 'password123', role: 'organizer' },
  { name: 'Local Food Fairs', email: 'events@localfood.com', password: 'password123', role: 'organizer' },

  // Regular users (12)
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'user' },   // 0
  { name: 'Bob Williams', email: 'bob@example.com', password: 'password123', role: 'user' },      // 1
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', role: 'user' }, // 2
  { name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: 'user' },    // 3
  { name: 'Ethan Hunt', email: 'ethan@example.com', password: 'password123', role: 'user' },      // 4
  { name: 'Fiona Glenanne', email: 'fiona@example.com', password: 'password123', role: 'user' },  // 5
  { name: 'George Costanza', email: 'george@example.com', password: 'password123', role: 'user' },// 6
  { name: 'Hannah Abbott', email: 'hannah@example.com', password: 'password123', role: 'user' },  // 7
  { name: 'Ian Malcolm', email: 'ian@example.com', password: 'password123', role: 'user' },       // 8
  { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user' },       // 9
  { name: 'Kevin Hart', email: 'kevin@example.com', password: 'password123', role: 'user' },      // 10
  { name: 'Laura Palmer', email: 'laura@example.com', password: 'password123', role: 'user' },    // 11
];

const toAttendees = (users) =>
  users
    .filter(Boolean) // remove any undefined entries just in case
    .map((u) => ({
      user: u._id,
      isVerified: true,
      verificationToken: undefined,
      verificationTokenExpires: undefined,
    }));

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Event.deleteMany();
    console.log('🗑️  Old users and events destroyed...');

    const salt = await bcrypt.genSalt(10);
    const usersToInsert = mockUsers.map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, salt),
    }));

    const createdUsers = await User.insertMany(usersToInsert);
    console.log('✅ Users imported...');

    const organizers = createdUsers.filter((u) => u.role === 'organizer');
    const regularUsers = createdUsers.filter((u) => u.role === 'user');

    console.log(`Organizers: ${organizers.length}, Regular users: ${regularUsers.length}`);

    if (organizers.length < 4) {
      throw new Error(`Expected 4 organizers, got ${organizers.length}`);
    }

    const [techCon, musicFest, creative, foodFest] = organizers;

    const mockEvents = [
      {
        title: 'Global AI Summit 2025',
        description:
          'Join the brightest minds in AI to discuss the future of technology. Full-day event with keynotes, workshops, and networking opportunities.',
        date: new Date('2025-10-22T09:00:00'),
        location: 'San Francisco, CA',
        organizer: techCon._id,
        attendees: toAttendees([regularUsers[0], regularUsers[2], regularUsers[3], regularUsers[4]]),
      },
      {
        title: 'Indie Rock Fest',
        description:
          'A 3-day outdoor festival featuring the best indie rock bands from around the world. Food trucks, art installations, and more.',
        date: new Date('2025-11-15T12:00:00'),
        location: 'Austin, TX',
        organizer: musicFest._id,
        attendees: toAttendees([regularUsers[1], regularUsers[3], regularUsers[4], regularUsers[5], regularUsers[6]]),
      },
      {
        title: 'Web Dev Workshop: Advanced React',
        description:
          'A hands-on workshop covering advanced React patterns, state management, and performance optimization.',
        date: new Date('2025-12-05T10:00:00'),
        location: 'Online',
        organizer: techCon._id,
        attendees: toAttendees([regularUsers[0], regularUsers[1], regularUsers[7]]),
      },
      {
        title: 'Watercolor Painting for Beginners',
        description:
          'Unleash your inner artist! A relaxing and fun introduction to watercolor painting techniques. All art supplies provided.',
        date: new Date('2025-09-30T14:00:00'),
        location: 'New York, NY',
        organizer: creative._id,
        attendees: toAttendees([regularUsers[5], regularUsers[6], regularUsers[8], regularUsers[9]]),
      },
      {
        title: 'Downtown Food Truck Festival',
        description:
          'Experience the best local food on wheels! A delicious event for the whole family, featuring over 30 food trucks.',
        date: new Date('2025-10-04T11:00:00'),
        location: 'Chicago, IL',
        organizer: foodFest._id,
        attendees: toAttendees([
          regularUsers[0],
          regularUsers[1],
          regularUsers[2],
          regularUsers[3],
          regularUsers[4],
          regularUsers[10],
        ]),
      },
      {
        title: 'Introduction to Python Coding',
        description:
          'Start your journey into programming with this beginner-friendly coding bootcamp. Learn the basics of Python for data science and web apps.',
        date: new Date('2025-11-08T09:30:00'),
        location: 'Online',
        organizer: techCon._id,
        attendees: toAttendees([regularUsers[7], regularUsers[9], regularUsers[11]]),
      },
      {
        title: 'Summer Marketing Conference',
        description:
          'A deep dive into the biggest trends in digital marketing. Great networking for marketing professionals.',
        date: new Date('2025-08-10T11:00:00'),
        location: 'Boston, MA',
        organizer: techCon._id,
        attendees: toAttendees([regularUsers[2], regularUsers[5], regularUsers[8]]),
      },
      {
        title: 'Artisan Cheese & Wine Tasting',
        description:
          'An evening of sophisticated flavors. Sample a curated selection of artisan cheeses paired with fine wines.',
        date: new Date('2025-07-20T19:00:00'),
        location: 'Napa Valley, CA',
        organizer: foodFest._id,
        attendees: toAttendees([regularUsers[6], regularUsers[7], regularUsers[9], regularUsers[11]]),
      },
      {
        title: 'Beginner Yoga Retreat',
        description:
          'A weekend retreat focused on mindfulness, yoga basics, and relaxation techniques for busy professionals.',
        date: new Date('2025-09-05T08:00:00'),
        location: 'Sedona, AZ',
        organizer: creative._id,
        attendees: toAttendees([regularUsers[3], regularUsers[4], regularUsers[10], regularUsers[11]]),
      },
      {
        title: 'Street Food Night Market',
        description:
          'A vibrant night market with street food from around the world, live music, and local artisans.',
        date: new Date('2025-10-18T18:00:00'),
        location: 'Los Angeles, CA',
        organizer: foodFest._id,
        attendees: toAttendees([regularUsers[1], regularUsers[2], regularUsers[5], regularUsers[6], regularUsers[7]]),
      },
      {
        title: 'JavaScript Performance Deep Dive',
        description:
          'Advanced workshop on profiling, optimizing, and debugging JavaScript performance issues.',
        date: new Date('2025-11-25T10:00:00'),
        location: 'Online',
        organizer: techCon._id,
        attendees: toAttendees([regularUsers[0], regularUsers[8], regularUsers[9], regularUsers[10]]),
      },
      {
        title: 'Acoustic Evening Live',
        description:
          'An intimate acoustic evening with emerging singer-songwriters. Limited seating for a cozy experience.',
        date: new Date('2025-12-12T20:00:00'),
        location: 'Seattle, WA',
        organizer: musicFest._id,
        attendees: toAttendees([regularUsers[4], regularUsers[7], regularUsers[9], regularUsers[11]]),
      },
    ];

    await Event.insertMany(mockEvents);
    console.log('✅ Events imported...');

    console.log('🎉 Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Event.deleteMany();
    console.log('🧹 Data successfully destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error with data destruction: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}