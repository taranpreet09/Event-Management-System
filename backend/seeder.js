const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const mockUsers = [
  { name: 'TechCon Global', email: 'contact@techcon.com', password: 'password123', role: 'organizer' },
  { name: 'MusicFest Planners', email: 'booking@musicfest.com', password: 'password123', role: 'organizer' },

  { name: 'Creative Workshops Inc.', email: 'learn@creative.com', password: 'password123', role: 'organizer' },
  { name: 'Local Food Fairs', email: 'events@localfood.com', password: 'password123', role: 'organizer' },

  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'user' },
  { name: 'Bob Williams', email: 'bob@example.com', password: 'password123', role: 'user' },
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', role: 'user' },
  { name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: 'user' },
  { name: 'Ethan Hunt', email: 'ethan@example.com', password: 'password123', role: 'user' },

  { name: 'Fiona Glenanne', email: 'fiona@example.com', password: 'password123', role: 'user' },
  { name: 'George Costanza', email: 'george@example.com', password: 'password123', role: 'user' },
  { name: 'Hannah Abbott', email: 'hannah@example.com', password: 'password123', role: 'user' },
  { name: 'Ian Malcolm', email: 'ian@example.com', password: 'password123', role: 'user' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user' },
];

const importData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();
    await Event.deleteMany();
    console.log('Old data destroyed...');

    const salt = await bcrypt.genSalt(10);
    const usersToInsert = mockUsers.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, salt),
    }));
    
    const createdUsers = await User.insertMany(usersToInsert);
    console.log('Users imported...');

    const organizers = createdUsers.filter(u => u.role === 'organizer');
    const regularUsers = createdUsers.filter(u => u.role === 'user');

    const techConId = organizers[0]._id;
    const musicFestId = organizers[1]._id;
    const creativeId = organizers[2]._id;
    const foodFestId = organizers[3]._id;

    const toAttendees = (users) =>
      users.map((u) => ({
        user: u._id,
        isVerified: true,
        verificationToken: undefined,
        verificationTokenExpires: undefined,
      }));

    const mockEvents = [
      {
        title: 'Global AI Summit 2025',
        description: 'Join the brightest minds in AI to discuss the future of technology. Full-day event with keynotes, workshops, and networking opportunities.',
        date: new Date('2025-10-22T09:00:00'),
        location: 'San Francisco, CA',
        organizer: techConId,
        attendees: toAttendees([regularUsers[0], regularUsers[2], regularUsers[3]]),
      },
      {
        title: 'Indie Rock Fest',
        description: 'A 3-day outdoor festival featuring the best indie rock bands from around the world. Food trucks, art installations, and more.',
        date: new Date('2025-11-15T12:00:00'),
        location: 'Austin, TX',
        organizer: musicFestId,
        attendees: toAttendees([regularUsers[1], regularUsers[3], regularUsers[4]]),
      },
      {
        title: 'Web Dev Workshop: Advanced React',
        description: 'A hands-on workshop covering advanced React patterns, state management with Zustand, and performance optimization.',
        date: new Date('2025-12-05T10:00:00'),
        location: 'Online',
        organizer: techConId,
        attendees: toAttendees([regularUsers[0], regularUsers[1]]),
      },
      {
        title: 'Watercolor Painting for Beginners',
        description: 'Unleash your inner artist! This is a relaxing and fun introduction to watercolor painting techniques. All art supplies provided.',
        date: new Date('2025-09-30T14:00:00'),
        location: 'New York, NY',
        organizer: creativeId,
        attendees: toAttendees([regularUsers[5], regularUsers[6], regularUsers[8]]),
      },
      {
        title: 'Downtown Food Truck Festival',
        description: 'Experience the best local food on wheels! A delicious event for the whole family, featuring over 30 food trucks.',
        date: new Date('2025-10-04T11:00:00'),
        location: 'Chicago, IL',
        organizer: foodFestId,
        attendees: toAttendees([regularUsers[0], regularUsers[1], regularUsers[2], regularUsers[3], regularUsers[4]]),
      },
      {
        title: 'Introduction to Python Coding',
        description: 'Start your journey into programming with this beginner-friendly coding bootcamp. Learn the basics of Python for data science and web apps.',
        date: new Date('2025-11-08T09:30:00'),
        location: 'Online',
        organizer: techConId,
        attendees: toAttendees([regularUsers[7], regularUsers[9]]),
      },
      {
        title: 'Summer Marketing Conference',
        description: 'A look back at the biggest trends in digital marketing from the summer. A great networking event for marketing professionals.',
        date: new Date('2025-08-10T11:00:00'),
        location: 'Boston, MA',
        organizer: techConId,
        attendees: toAttendees([regularUsers[2], regularUsers[5]]),
      },
      {
        title: 'Artisan Cheese & Wine Tasting',
        description: 'An evening of sophisticated flavors. Sample a curated selection of artisan cheeses paired with fine wines. A very popular past event!',
        date: new Date('2025-07-20T19:00:00'),
        location: 'Napa Valley, CA',
        organizer: foodFestId,
        attendees: toAttendees([regularUsers[6], regularUsers[7], regularUsers[9]]),
      },
    ];

    await Event.insertMany(mockEvents);
    console.log('Events imported...');

    console.log('✅ Data Successfully Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Event.deleteMany();
    console.log('✅ Data Successfully Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}