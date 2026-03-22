import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { PrismaClient } from '../src/generated/prisma/client';

type SeedUser = {
  email: string;
  name: string;
  password: string;
};

type SeedMessage = {
  senderEmail: string;
  content: string;
  timestamp: Date;
};

type SeedChat = {
  title: string;
  participantEmails: string[];
  messages: SeedMessage[];
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed user data');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

const seedUsers: SeedUser[] = [
  {
    email: 'alice@example.com',
    name: 'Alice Nguyen',
    password: '123456',
  },
  {
    email: 'bob@example.com',
    name: 'Bob Tran',
    password: '123456',
  },
  {
    email: 'carol@example.com',
    name: 'Carol Pham',
    password: '123456',
  },
  {
    email: 'david@example.com',
    name: 'David Le',
    password: '123456',
  },
];

const seedChats: SeedChat[] = [
  {
    title: 'Alice & Bob Workspace',
    participantEmails: ['alice@example.com', 'bob@example.com'],
    messages: [
      {
        senderEmail: 'alice@example.com',
        content: 'Chao Bob, hom nay ban ranh khong?',
        timestamp: new Date('2026-03-20T08:30:00.000Z'),
      },
      {
        senderEmail: 'bob@example.com',
        content: 'Co, toi dang online day. Minh ban ve feature chat nhe.',
        timestamp: new Date('2026-03-20T08:31:00.000Z'),
      },
      {
        senderEmail: 'alice@example.com',
        content: 'Ok, toi se tao ticket va gui thong tin cho ban.',
        timestamp: new Date('2026-03-20T08:32:00.000Z'),
      },
    ],
  },
  {
    title: 'Product Sync Group',
    participantEmails: [
      'alice@example.com',
      'carol@example.com',
      'david@example.com',
    ],
    messages: [
      {
        senderEmail: 'carol@example.com',
        content: 'Nhom minh can thong nhat UI cho man hinh chat.',
        timestamp: new Date('2026-03-21T02:00:00.000Z'),
      },
      {
        senderEmail: 'david@example.com',
        content: 'Toi se chot layout trong chieu nay.',
        timestamp: new Date('2026-03-21T02:05:00.000Z'),
      },
      {
        senderEmail: 'alice@example.com',
        content: 'Khi xong nho gui link de toi test socket luon.',
        timestamp: new Date('2026-03-21T02:06:00.000Z'),
      },
    ],
  },
];

async function seedPostgresUsers() {
  const usersByEmail = new Map<string, { id: number; email: string; name: string }>();

  for (const user of seedUsers) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);

    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: hashedPassword,
      },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    usersByEmail.set(savedUser.email, savedUser);
  }

  return usersByEmail;
}

async function seedMongoChats(
  usersByEmail: Map<string, { id: number; email: string; name: string }>,
) {
  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error('MONGODB_URL is required to seed chat data');
  }

  await mongoose.connect(mongoUrl);
  const chatsCollection = mongoose.connection.collection('chats');

  for (const chat of seedChats) {
    const participantIds = chat.participantEmails
      .map((email) => usersByEmail.get(email)?.id)
      .filter((id): id is number => typeof id === 'number')
      .sort((a, b) => a - b);

    if (participantIds.length !== chat.participantEmails.length) {
      throw new Error(`Missing seeded users for chat: ${chat.participantEmails.join(', ')}`);
    }

    await chatsCollection.deleteOne({
      participants: {
        $all: participantIds,
        $size: participantIds.length,
      },
    });

    await chatsCollection.insertOne({
      title: chat.title,
      participants: participantIds,
      messages: chat.messages.map((message) => {
        const sender = usersByEmail.get(message.senderEmail);

        if (!sender) {
          throw new Error(`Missing sender for message: ${message.senderEmail}`);
        }

        return {
          sender: sender.id,
          content: message.content,
          timestamp: message.timestamp,
        };
      }),
    });
  }
}

async function main() {
  const usersByEmail = await seedPostgresUsers();
  await seedMongoChats(usersByEmail);

  console.log('Seed completed.');
  console.log('Sample accounts:');
  for (const user of seedUsers) {
    console.log(`- ${user.email} / ${user.password}`);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
