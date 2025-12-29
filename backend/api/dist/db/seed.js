"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./connection"));
const password_1 = require("../utils/password");
const testUsers = [
    {
        name: 'Test User',
        email: 'test@studycollab.com',
        password: 'Test1234!',
        role: 'user',
    },
    {
        name: 'Admin User',
        email: 'admin@studycollab.com',
        password: 'Admin1234!',
        role: 'admin',
    },
    {
        name: 'Student User',
        email: 'student@studycollab.com',
        password: 'Student1234!',
        role: 'user',
    },
    {
        name: 'Alice Johnson',
        email: 'alice@studycollab.com',
        password: 'Demo1234!',
        role: 'user',
    },
    {
        name: 'Bob Smith',
        email: 'bob@studycollab.com',
        password: 'Demo1234!',
        role: 'user',
    },
];
const demoTopics = [
    {
        title: 'Calculus I',
        description: 'Limits, derivatives, and integrals. Join for homework help and study sessions!',
        subject: 'Math',
        difficulty: 'Intermediate',
        tags: ['Calculus', 'Math', 'Derivatives'],
    },
    {
        title: 'Physics: Mechanics',
        description: 'Newtonian mechanics, work, energy, and power. Let\'s solve problems together!',
        subject: 'Physics',
        difficulty: 'Intermediate',
        tags: ['Physics', 'Mechanics', 'Science'],
    },
    {
        title: 'Intro to Computer Science',
        description: 'Algorithms, data structures, and Python basics. Perfect for beginners!',
        subject: 'Computer Science',
        difficulty: 'Beginner',
        tags: ['CS', 'Programming', 'Python', 'Algorithms'],
    },
    {
        title: 'Organic Chemistry',
        description: 'Structure, properties, and reactions of organic compounds. Study group for organic chem!',
        subject: 'Chemistry',
        difficulty: 'Advanced',
        tags: ['Chemistry', 'Organic', 'Science'],
    },
    {
        title: 'Cell Biology',
        description: 'Cell structure, function, and molecular biology fundamentals.',
        subject: 'Biology',
        difficulty: 'Intermediate',
        tags: ['Biology', 'Cells', 'Science'],
    },
    {
        title: 'Statistics and Probability',
        description: 'Probability distributions, statistical inference, and data analysis.',
        subject: 'Math',
        difficulty: 'Intermediate',
        tags: ['Math', 'Statistics', 'Probability'],
    },
];
const demoMessages = [
    { content: 'Welcome to the study group! Feel free to ask questions.' },
    { content: 'Has anyone solved problem 3 from chapter 5?' },
    { content: 'I think you need to use the chain rule for that derivative.' },
    { content: 'Can someone explain the concept of limits?' },
    { content: 'Great explanation! That makes sense now.' },
];
async function seedUsers() {
    const client = await connection_1.default.connect();
    try {
        console.log('🌱 Seeding test users...');
        const userIds = {};
        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [userData.email]);
            if (existingUser.rows.length > 0) {
                console.log(`⏭️  User ${userData.email} already exists, skipping...`);
                userIds[userData.email] = existingUser.rows[0].id;
                continue;
            }
            // Hash password
            const passwordHash = await (0, password_1.hashPassword)(userData.password);
            // Insert user
            const result = await client.query(`INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`, [userData.name, userData.email, passwordHash, userData.role || 'user']);
            userIds[userData.email] = result.rows[0].id;
            console.log(`✅ Created user: ${userData.email}`);
        }
        return userIds;
    }
    catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    }
    finally {
        client.release();
    }
}
async function seedTopics(userIds) {
    const client = await connection_1.default.connect();
    const testUserId = userIds['test@studycollab.com'];
    try {
        console.log('🌱 Seeding demo topics...');
        const topicIds = [];
        for (const topicData of demoTopics) {
            // Check if topic already exists
            const existingTopic = await client.query('SELECT id FROM topics WHERE title = $1', [topicData.title]);
            if (existingTopic.rows.length > 0) {
                console.log(`⏭️  Topic "${topicData.title}" already exists, skipping...`);
                topicIds.push(existingTopic.rows[0].id);
                continue;
            }
            // Insert topic
            const result = await client.query(`INSERT INTO topics (title, description, subject, difficulty, tags, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`, [
                topicData.title,
                topicData.description,
                topicData.subject,
                topicData.difficulty,
                topicData.tags,
                testUserId,
            ]);
            const topicId = result.rows[0].id;
            topicIds.push(topicId);
            // Add creator as member
            await client.query(`INSERT INTO topic_members (topic_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`, [topicId, testUserId]);
            console.log(`✅ Created topic: ${topicData.title}`);
        }
        return topicIds;
    }
    catch (error) {
        console.error('❌ Error seeding topics:', error);
        throw error;
    }
    finally {
        client.release();
    }
}
async function seedMessages(topicIds, userIds) {
    const client = await connection_1.default.connect();
    try {
        console.log('🌱 Seeding demo messages...');
        // Use first topic for demo messages
        if (topicIds.length === 0)
            return;
        const topicId = topicIds[0]; // Calculus I
        const userEmails = Object.keys(userIds);
        let messageCount = 0;
        for (let i = 0; i < demoMessages.length && i < userEmails.length; i++) {
            const userId = userIds[userEmails[i]];
            // Check if message already exists
            const existingMessage = await client.query('SELECT id FROM messages WHERE topic_id = $1 AND user_id = $2 AND content = $3 LIMIT 1', [topicId, userId, demoMessages[i].content]);
            if (existingMessage.rows.length > 0) {
                continue;
            }
            // Add user as member if not already
            await client.query(`INSERT INTO topic_members (topic_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`, [topicId, userId]);
            // Insert message
            await client.query(`INSERT INTO messages (topic_id, user_id, content)
         VALUES ($1, $2, $3)`, [topicId, userId, demoMessages[i].content]);
            messageCount++;
        }
        console.log(`✅ Created ${messageCount} demo messages`);
    }
    catch (error) {
        console.error('❌ Error seeding messages:', error);
        throw error;
    }
    finally {
        client.release();
    }
}
async function seed() {
    try {
        console.log('🚀 Starting database seeding...');
        // Seed users
        const userIds = await seedUsers();
        // Seed topics
        const topicIds = await seedTopics(userIds);
        // Seed messages
        await seedMessages(topicIds, userIds);
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📋 Test Users Created:');
        testUsers.forEach(user => {
            console.log(`   - ${user.email} (${user.password})`);
        });
        console.log(`\n📚 Topics Created: ${topicIds.length}`);
        console.log(`💬 Demo Messages Added\n`);
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}
// Run seed if called directly
if (require.main === module) {
    seed()
        .then(() => {
        process.exit(0);
    })
        .catch((error) => {
        console.error('Seed script failed:', error);
        process.exit(1);
    });
}
exports.default = seed;
