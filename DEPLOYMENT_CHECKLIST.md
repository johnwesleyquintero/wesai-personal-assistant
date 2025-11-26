# Supabase Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Environment Variables

Ensure these are set in your `.env` file:

```bash
VITE_SUPABASE_URL=https://ahmxjnqgpehsysnyoqzq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobXhqbnFncGVoc3lzbnlvcXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzA2NDgsImV4cCI6MjA3OTcwNjY0OH0.s0lu0oD9lWOjj175EA8yV3XcG_QcnN450dzm7y8tBD0
```

### 2. Supabase Dashboard Setup

- [ ] Create project at [supabase.com](https://supabase.com)
- [ ] Copy project URL and anon key to `.env`
- [ ] Enable Google OAuth in Authentication settings
- [ ] Configure OAuth redirect URLs

### 3. Database Setup

- [ ] Run `supabase_schema.sql` in SQL Editor
- [ ] Verify table creation and RLS policies
- [ ] Test basic CRUD operations

## 🚀 Deployment Steps

### Step 1: Database Schema

```bash
# Copy and run the SQL script in Supabase dashboard
# File: supabase_schema.sql
```

### Step 2: Verify Schema

```sql
-- Run this in Supabase SQL Editor to verify setup
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'chat_sessions';
```

### Step 3: Test Authentication

```sql
-- Verify RLS policies are working
SELECT * FROM pg_policies
WHERE tablename = 'chat_sessions';
```

### Step 4: Test Data Operations

```sql
-- Insert test data (replace with actual user ID)
INSERT INTO public.chat_sessions (user_id, name, messages)
VALUES (
    'your-user-id-here',
    'Test Session',
    '[{"id": "1", "role": "user", "content": "Hello", "componentCode": null, "showPreview": false}]'::jsonb
);
```

## 🔧 Post-Deployment Verification

### 1. Authentication Test

- [ ] Try Google sign-in
- [ ] Verify user sessions are created
- [ ] Check that RLS policies restrict access

### 2. Chat Operations Test

- [ ] Create new chat session
- [ ] Save messages to session
- [ ] Reload and verify persistence
- [ ] Test session renaming
- [ ] Test session duplication
- [ ] Test session deletion

### 3. Performance Test

- [ ] Load test with multiple sessions
- [ ] Test with large message arrays
- [ ] Verify index performance

## 📊 Monitoring Setup

### 1. Database Monitoring

```sql
-- Check for slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;
```

### 2. Error Monitoring

- [ ] Set up Supabase error notifications
- [ ] Configure application error tracking
- [ ] Monitor failed authentication attempts

## 🛡️ Security Checklist

### Row Level Security

- [ ] RLS policies are enabled on all tables
- [ ] Users can only access their own data
- [ ] Authentication is required for all operations

### Data Validation

- [ ] JSON schema validation for messages
- [ ] Input sanitization on client side
- [ ] Rate limiting for API calls

## 🔄 Backup & Recovery

### Automated Backups

- [ ] Enable Supabase automated backups
- [ ] Set backup retention policy
- [ ] Test recovery procedures

### Manual Backup Script

```sql
-- Export chat sessions for a specific user
COPY (
    SELECT * FROM public.chat_sessions
    WHERE user_id = 'specific-user-id'
) TO '/tmp/user_backup.csv' WITH CSV HEADER;
```

## 🚨 Troubleshooting Guide

### Common Issues

1. **"Permission denied" errors**
   - Check RLS policies are enabled
   - Verify user authentication status
   - Check user_id matches auth.uid()

2. **"Invalid JSON" errors**
   - Validate message structure matches ChatMessage type
   - Check for null values in required fields
   - Verify JSON array format

3. **Sessions not loading**
   - Check network requests in browser dev tools
   - Verify Supabase client initialization
   - Check for CORS issues

4. **Performance issues**
   - Check query execution plans
   - Verify indexes are being used
   - Consider pagination for large datasets

### Emergency Contacts

- Supabase Support: [support@supabase.com](mailto:support@supabase.com)
- Database Issues: Check Supabase status page
- Authentication Issues: Review OAuth configuration

## 📈 Scaling Considerations

### When to Scale

- [ ] Monitor database size growth
- [ ] Track query performance metrics
- [ ] Watch for authentication bottlenecks

### Scaling Options

- [ ] Enable connection pooling
- [ ] Consider read replicas
- [ ] Implement caching strategies
- [ ] Optimize heavy queries

---

**✅ Ready to Deploy!**
Your Supabase backend is now configured for cloud storage with full authentication and chat session management.
