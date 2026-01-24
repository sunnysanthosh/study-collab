import pool from './connection';

async function migrateV05() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting v0.5 database migration...');
    
    // Add edited_at column to messages if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'messages' AND column_name = 'edited_at'
        ) THEN
          ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP;
        END IF;
      END $$;
    `);
    console.log('✅ Added edited_at column to messages');

    // Add category column to topics if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'topics' AND column_name = 'category'
        ) THEN
          ALTER TABLE topics ADD COLUMN category VARCHAR(100);
        END IF;
      END $$;
    `);
    console.log('✅ Added category column to topics');

    // Create message_reactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_reactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(message_id, user_id, emoji)
      );
    `);
    console.log('✅ Created message_reactions table');

    // Create file_attachments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_attachments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100),
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created file_attachments table');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link VARCHAR(500),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created notifications table');

    // Create user_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'online',
        last_seen TIMESTAMP DEFAULT NOW(),
        socket_id VARCHAR(255),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created user_sessions table');

    // Create topic_favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS topic_favorites (
        topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (topic_id, user_id)
      );
    `);
    console.log('✅ Created topic_favorites table');

    // Create token_blacklist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        token_hash VARCHAR(128) UNIQUE NOT NULL,
        token_type VARCHAR(20) NOT NULL,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created token_blacklist table');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
      CREATE INDEX IF NOT EXISTS idx_file_attachments_message_id ON file_attachments(message_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_user_id_unique ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);
      CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
      CREATE INDEX IF NOT EXISTS idx_topics_search ON topics USING GIN (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
      );
      CREATE INDEX IF NOT EXISTS idx_topic_favorites_topic_id ON topic_favorites(topic_id);
      CREATE INDEX IF NOT EXISTS idx_topic_favorites_user_id ON topic_favorites(user_id);
    `);
    console.log('✅ Created indexes');

    console.log('✅ v0.5 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateV05()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateV05;

