import pool from './connection';

async function resetDemo() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Resetting demo data...');
    
    // Delete in correct order (respecting foreign keys)
    await client.query('DELETE FROM messages');
    console.log('✅ Deleted all messages');
    
    await client.query('DELETE FROM topic_members');
    console.log('✅ Deleted all topic members');
    
    await client.query('DELETE FROM topics');
    console.log('✅ Deleted all topics');
    
    await client.query('DELETE FROM users');
    console.log('✅ Deleted all users');
    
    console.log('✅ Demo data reset completed!');
    console.log('💡 Run "npm run seed" to recreate demo data');
  } catch (error) {
    console.error('❌ Error resetting demo data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run reset if called directly
if (require.main === module) {
  resetDemo()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reset script failed:', error);
      process.exit(1);
    });
}

export default resetDemo;

