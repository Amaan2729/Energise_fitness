#!/usr/bin/env node
/**
 * Redis Verification & Monitoring Script
 * Run this to check Redis connection and monitor cache operations
 */

const redis = require('redis');

async function verifyRedis() {
  console.log('\n📊 Redis Verification & Monitoring Script\n');
  console.log('═'.repeat(50));

  const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  });

  try {
    // Connect to Redis
    console.log('\n🔌 Connecting to Redis...');
    await client.connect();
    console.log('✓ Redis connection successful!\n');

    // Get server info
    console.log('📋 Redis Server Information:');
    console.log('─'.repeat(50));
    const info = await client.info('server');
    const lines = info.split('\r\n');
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        console.log(`  ${line}`);
      }
    });

    // Test basic operations
    console.log('\n🧪 Testing Cache Operations:');
    console.log('─'.repeat(50));

    // Set a test value
    console.log('\n  1️⃣  Setting test value...');
    await client.setEx('test:verify', 60, JSON.stringify({
      message: 'Redis is working!',
      timestamp: new Date().toISOString()
    }));
    console.log('  ✓ Value set successfully');

    // Get the value back
    console.log('\n  2️⃣  Retrieving test value...');
    const testValue = await client.get('test:verify');
    if (testValue) {
      console.log('  ✓ Value retrieved:', testValue);
    }

    // Check memory usage
    console.log('\n  3️⃣  Checking memory usage...');
    const memInfo = await client.info('memory');
    const memLines = memInfo.split('\r\n');
    memLines.forEach(line => {
      if (line.includes('used_memory') || line.includes('used_memory_human')) {
        console.log(`  ${line}`);
      }
    });

    // Get all keys
    console.log('\n  4️⃣  Current cached keys:');
    const keys = await client.keys('*');
    if (keys.length === 0) {
      console.log('  (No keys cached yet)');
    } else {
      keys.forEach(key => {
        console.log(`    • ${key}`);
      });
    }

    // Test with user data
    console.log('\n🏗️  Simulating Application Cache:');
    console.log('─'.repeat(50));

    const userData = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      subscription: 'Premium'
    };

    console.log('\n  Caching user data...');
    await client.setEx('user:1:profile', 3600, JSON.stringify(userData));
    console.log('  ✓ User data cached (TTL: 1 hour)');

    const cachedUser = await client.get('user:1:profile');
    console.log('  ✓ Retrieved from cache:', JSON.parse(cachedUser));

    // Test TTL
    console.log('\n⏱️  Checking TTL (Time To Live):');
    console.log('─'.repeat(50));
    const ttl = await client.ttl('user:1:profile');
    console.log(`  ✓ Remaining TTL: ${ttl} seconds (~${Math.round(ttl/60)} minutes)`);

    // Database stats
    console.log('\n📊 Database Statistics:');
    console.log('─'.repeat(50));
    const stats = await client.info('stats');
    const statsLines = stats.split('\r\n');
    statsLines.forEach(line => {
      if (line && !line.startsWith('#') && (line.includes('commands') || line.includes('keys'))) {
        console.log(`  ${line}`);
      }
    });

    console.log('\n✅ Redis verification complete!\n');
    console.log('═'.repeat(50));
    console.log('\n💡 Integration Tips:');
    console.log('  1. Use cacheSet() to cache data');
    console.log('  2. Use cacheGet() to retrieve cached data');
    console.log('  3. Use cacheDelete() to invalidate cache');
    console.log('  4. Add TTL (time-to-live) for automatic expiration');
    console.log('  5. Monitor with: redis-cli');
    console.log('\n');

  } catch (err) {
    console.error('❌ Redis Connection Error:', err.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Make sure Redis server is running');
    console.log('  2. Check if Redis is listening on localhost:6379');
    console.log('  3. Verify environment variables: REDIS_HOST, REDIS_PORT');
    console.log('  4. Install Redis: brew install redis (macOS) or sudo apt-get install redis (Linux)');
    console.log('  5. Start Redis: redis-server');
    console.log('\n');
    process.exit(1);
  } finally {
    await client.quit();
  }
}

// Run verification
verifyRedis();
