# Supabase Setup Guide for WesAI Personal Assistant

## 🚀 Quick Setup Instructions

### 1. Run the SQL Script

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_schema.sql`
4. Click **Run** to execute the script

### 2. Verify Setup

After running the script, you can verify the setup by running this query in the SQL Editor:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'chat_sessions';
```

### 3. Configure Row Level Security (RLS)

The script automatically sets up RLS policies, but you should verify they're working:

```sql
SELECT * FROM pg_policies
WHERE tablename = 'chat_sessions';
```

## 📋 Database Schema Overview

### chat_sessions Table

- **id**: UUID primary key (auto-generated)
- **user_id**: References auth.users(id) - links to authenticated user
- **name**: Session display name
- **created_at**: Timestamp of creation
- **messages**: JSONB array storing ChatMessage objects
- **updated_at**: Auto-updated timestamp

### ChatMessage Structure (JSONB)

```json
{
  "id": "string",
  "role": "user" | "model",
  "content": "string",
  "componentCode": "string | null",
  "showPreview": "boolean"
}
```

## 🔒 Security Features

### Row Level Security (RLS) Policies

1. **Users can view own chat sessions** - Users only see their data
2. **Users can insert own chat sessions** - Users can create sessions
3. **Users can update own chat sessions** - Users can modify their sessions
4. **Users can delete own chat sessions** - Users can delete their sessions

### Data Validation

- Messages must be valid JSON arrays
- Each message must have required fields (id, role, content)
- Role must be either "user" or "model"

## 🎯 Features Enabled

### ✅ Cloud Storage Features

- **Persistent Chat Sessions**: All chat history stored in Supabase
- **User Isolation**: Each user only sees their own sessions
- **Real-time Sync**: Changes immediately reflected across devices
- **Backup & Recovery**: Automatic cloud backup of all data

### ✅ Authentication Integration

- **Google OAuth**: Ready for Google sign-in
- **Session Management**: Automatic session handling
- **User Profiles**: Linked to Supabase auth.users table

## 🛠️ Performance Optimizations

### Indexes Created

- `idx_chat_sessions_user_id` - Fast user-based queries
- `idx_chat_sessions_created_at` - Fast chronological sorting
- `idx_chat_sessions_user_created` - Combined index for common queries

### Functions Created

- `validate_chat_messages()` - Ensures data integrity
- `get_user_chat_sessions()` - Optimized query function
- `update_updated_at_column()` - Auto-updates timestamps

## 🔍 Testing Your Setup

### Test Authentication

1. Try logging in with Google OAuth
2. Verify user sessions are created
3. Check that RLS policies restrict access

### Test Chat Operations

1. Create a new chat session
2. Save messages to the session
3. Reload the page and verify persistence
4. Try renaming the session
5. Test duplicating sessions
6. Verify deletion works

## 🚨 Common Issues & Solutions

### Issue: "Permission denied" errors

**Solution**: Ensure RLS policies are enabled and user is properly authenticated

### Issue: "Invalid JSON" errors

**Solution**: Check that messages array follows the ChatMessage structure

### Issue: Sessions not loading

**Solution**: Verify user_id is properly set in the auth context

## 📊 Monitoring & Maintenance

### Monitor Query Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Database Size Monitoring

```sql
-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔄 Migration Notes

If you're migrating from local storage to cloud storage:

1. The app will automatically use cloud storage when user is authenticated
2. Local storage remains as fallback for non-authenticated users
3. No data migration needed - new sessions go to cloud, existing local sessions remain local

## 📞 Support

If you encounter issues:

1. Check Supabase logs in the dashboard
2. Verify environment variables are set correctly
3. Test the SQL script execution step by step
4. Check browser console for client-side errors
