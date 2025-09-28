# ParlayParty Database Setup Guide

This guide will help you set up the database for your ParlayParty application. We recommend PostgreSQL with Prisma ORM for the best TypeScript integration and performance.

## 🗄️ **Database Options**

### **1. Recommended: PostgreSQL + Prisma (Production Ready)**
- ✅ **ACID compliance** for financial transactions
- ✅ **JSON support** for flexible party data
- ✅ **Full-text search** for party discovery
- ✅ **Excellent TypeScript integration**
- ✅ **Real-time subscriptions** possible

### **2. Alternative: Supabase (Quick Setup)**
- ✅ **Built-in authentication**
- ✅ **Real-time subscriptions**
- ✅ **Auto-generated APIs**
- ✅ **Free tier available**

### **3. Alternative: MongoDB (Flexible Schema)**
- ✅ **Document-based** for complex nested data
- ✅ **Easy horizontal scaling**
- ✅ **Flexible schema evolution**

## 🚀 **Quick Start with PostgreSQL + Prisma**

### **Step 1: Install Dependencies**

```bash
# Install Prisma CLI
npm install -g prisma

# Install Prisma client and dependencies
npm install prisma @prisma/client
npm install -D prisma
```

### **Step 2: Set Up Environment Variables**

Create a `.env` file in your project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/parlayparty?schema=public"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_API_KEY="your-api-key-here"

# Optional: For production
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### **Step 3: Initialize Prisma**

```bash
# Initialize Prisma (if not already done)
npx prisma init

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### **Step 4: Run Database Migrations**

```bash
# Create and run migration
npx prisma migrate dev --name init

# Or if you want to reset the database
npx prisma migrate reset
```

### **Step 5: Seed the Database (Optional)**

```bash
# Run the seed script
npx prisma db seed
```

## 🐘 **PostgreSQL Setup Options**

### **Option A: Local PostgreSQL**

1. **Install PostgreSQL:**
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- Create database and user
   CREATE DATABASE parlayparty;
   CREATE USER parlayparty_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE parlayparty TO parlayparty_user;
   \q
   ```

3. **Update DATABASE_URL:**
   ```env
   DATABASE_URL="postgresql://parlayparty_user:your_password@localhost:5432/parlayparty?schema=public"
   ```

### **Option B: Docker PostgreSQL**

1. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: parlayparty
         POSTGRES_USER: parlayparty_user
         POSTGRES_PASSWORD: your_password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

### **Option C: Cloud PostgreSQL (Recommended for Production)**

#### **Supabase (Free Tier Available)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings > Database
4. Update your `.env` file

#### **Railway (Simple Deployment)**
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Update your `.env` file

#### **Neon (Serverless PostgreSQL)**
1. Go to [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string
4. Update your `.env` file

## 🔧 **Database Schema Overview**

### **Core Tables:**
- **`users`** - User accounts and profiles
- **`parties`** - Party information and settings
- **`party_members`** - Party membership and scores
- **`party_allowed_sports`** - Sports allowed in each party
- **`parlays`** - User parlay bets
- **`parlay_picks`** - Individual picks within parlays
- **`party_chat_messages`** - Chat messages in parties
- **`polls`** - Polls created in parties
- **`poll_options`** - Poll answer options
- **`poll_votes`** - User votes on polls

### **Key Features:**
- **UUID primary keys** for security
- **JSON fields** for flexible data storage
- **Full-text search** on party names and descriptions
- **Automatic timestamps** with triggers
- **Referential integrity** with foreign keys
- **Indexes** for optimal query performance

## 📊 **Database Performance Optimization**

### **Indexes Created:**
```sql
-- Parties indexes
CREATE INDEX idx_parties_created_by ON parties(created_by);
CREATE INDEX idx_parties_status ON parties(status);
CREATE INDEX idx_parties_type ON parties(type);
CREATE INDEX idx_parties_join_code ON parties(join_code);
CREATE INDEX idx_parties_dates ON parties(start_date, end_date);
CREATE INDEX idx_parties_search ON parties USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Party members indexes
CREATE INDEX idx_party_members_party_id ON party_members(party_id);
CREATE INDEX idx_party_members_user_id ON party_members(user_id);
CREATE INDEX idx_party_members_active ON party_members(party_id, is_active);

-- Parlays indexes
CREATE INDEX idx_parlays_party_id ON parlays(party_id);
CREATE INDEX idx_parlays_user_id ON parlays(user_id);
CREATE INDEX idx_parlays_status ON parlays(status);
CREATE INDEX idx_parlays_created_at ON parlays(created_at);
```

### **Query Optimization Tips:**
1. **Use prepared statements** for repeated queries
2. **Limit result sets** with pagination
3. **Use appropriate indexes** for common queries
4. **Monitor slow queries** with `EXPLAIN ANALYZE`
5. **Consider connection pooling** for high traffic

## 🔐 **Security Considerations**

### **Database Security:**
1. **Use strong passwords** for database users
2. **Enable SSL/TLS** for production connections
3. **Restrict database access** to application servers only
4. **Regular backups** and disaster recovery plan
5. **Monitor access logs** for suspicious activity

### **Application Security:**
1. **Validate all inputs** before database operations
2. **Use parameterized queries** to prevent SQL injection
3. **Implement rate limiting** for API endpoints
4. **Encrypt sensitive data** (wallet balances, personal info)
5. **Use environment variables** for sensitive configuration

## 🚀 **Deployment Checklist**

### **Before Going Live:**
- [ ] Database is properly secured
- [ ] All migrations have been run
- [ ] Database is backed up
- [ ] Connection pooling is configured
- [ ] Monitoring is set up
- [ ] Performance testing completed
- [ ] Disaster recovery plan is in place

### **Environment Variables:**
```env
# Production
DATABASE_URL="postgresql://user:password@prod-host:5432/parlayparty?schema=public&sslmode=require"
NEXT_PUBLIC_API_BASE_URL="https://api.parlayparty.com"
NEXT_PUBLIC_API_KEY="prod-api-key"

# Staging
DATABASE_URL="postgresql://user:password@staging-host:5432/parlayparty?schema=public"
NEXT_PUBLIC_API_BASE_URL="https://staging-api.parlayparty.com"
NEXT_PUBLIC_API_KEY="staging-api-key"
```

## 🔄 **Migration Strategy**

### **From Local Storage to Database:**
1. **Phase 1:** Run both local storage and API in parallel
2. **Phase 2:** Migrate existing data using the migration function
3. **Phase 3:** Switch to API-only mode
4. **Phase 4:** Remove local storage code

### **Migration Commands:**
```typescript
// In your app, call the migration function
const result = await partiesService.migrateToApi();
console.log(`Migrated ${result.migrated} parties`);
```

## 📈 **Monitoring and Maintenance**

### **Database Monitoring:**
1. **Query performance** - Monitor slow queries
2. **Connection usage** - Track active connections
3. **Storage usage** - Monitor disk space
4. **Error rates** - Track database errors
5. **Backup status** - Ensure backups are working

### **Maintenance Tasks:**
1. **Regular backups** (daily for production)
2. **Index maintenance** (monthly)
3. **Statistics updates** (weekly)
4. **Log rotation** (as needed)
5. **Security updates** (immediately)

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Connection refused:**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Start PostgreSQL
   sudo systemctl start postgresql
   ```

2. **Authentication failed:**
   ```bash
   # Check user permissions
   psql -U postgres -c "\du"
   
   # Reset password
   sudo -u postgres psql -c "ALTER USER parlayparty_user PASSWORD 'new_password';"
   ```

3. **Database doesn't exist:**
   ```sql
   -- Create database
   CREATE DATABASE parlayparty;
   ```

4. **Prisma client not found:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   ```

5. **Migration failed:**
   ```bash
   # Reset and retry
   npx prisma migrate reset
   npx prisma migrate dev
   ```

## 📚 **Additional Resources**

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

## 🎯 **Next Steps**

1. **Choose your database option** (PostgreSQL + Prisma recommended)
2. **Set up your environment** with the provided configuration
3. **Run the database migrations** to create tables
4. **Test the API integration** with your existing app
5. **Deploy to production** when ready

Your ParlayParty database is now ready to handle all the social betting party functionality! 🎉
