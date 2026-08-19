# Admin Dashboard Guide

Complete guide to the admin control panel for marketplace moderation, user management, and operations.

---

## 📋 Features

### Overview Dashboard
- **Real-time Metrics** - Daily user counts, listings, orders, revenue
- **Pending Moderation** - Queue of items awaiting review
- **Open Disputes** - Payment disputes requiring resolution
- **Active Suspensions** - Currently suspended users and accounts
- **Alert Summary** - Quick view of critical issues

### Moderation System
- **Content Review Queue** - Review flagged reviews, listings, messages, photos
- **Prioritization** - Critical, High, Normal priority sorting
- **Batch Actions** - Approve, reject, or delete items
- **Resolution Notes** - Document reasons for moderation decisions
- **Audit Trail** - Complete log of all moderation actions

### Dispute Resolution
- **Payment Disputes** - Manage buyer/seller conflicts
- **Refund Processing** - Issue refunds with documentation
- **Resolution Tracking** - Monitor dispute status and history
- **Amount Management** - Record refund amounts and adjustments

### User Management
- **Seller Warnings** - Issue structured warnings for policy violations
- **User Suspensions** - Temporary or permanent account suspensions
- **Duration Control** - Set expiration dates for temporary bans
- **Appeal Management** - Track user appeals and resolutions
- **Activity History** - View complete user action history

### Marketplace Metrics
- **Daily Statistics** - Automated daily metric collection
- **Trend Analysis** - View performance over time
- **Volume Tracking** - Orders, revenue, user growth
- **Quality Indicators** - Rating distribution, review counts
- **Support Metrics** - Message volume, dispute resolution

---

## 🏗️ Database Architecture

### moderation_queue Table
Content flagged for admin review.
```sql
id, item_type (review/listing/message/profile_photo)
item_id, flagged_by_id
reason (spam/offensive/fake/inappropriate/scam)
description, status (pending/approved/rejected/deleted)
priority (low/normal/high/critical)
assigned_to_id, resolution_notes
resolved_at, created_at, updated_at
```

### payment_disputes Table
Payment conflicts between buyers and sellers.
```sql
id, order_id, initiated_by_id
dispute_type (item_not_received/item_not_matching/damaged_item/etc)
description, status (open/in_progress/resolved/appealed/closed)
assigned_to_id, resolution, refund_amount
resolved_at, created_at, updated_at
```

### seller_warnings Table
Warnings issued to sellers.
```sql
id, seller_id, admin_id
warning_type (false_listings/poor_ratings/unresponsive/etc)
description, severity (low/medium/high/critical)
action_required, deadline
acknowledged_at, resolved_at, created_at
```

### user_suspensions Table
Account suspensions and bans.
```sql
id, user_id, admin_id
suspension_type (temporary/permanent), reason
duration_days, status (active/lifted/expired)
appeal_reason, appeal_status
created_at, lifted_at, expires_at
```

### marketplace_metrics Table
Daily aggregated platform statistics.
```sql
id, metric_date (unique)
total_users, new_users, active_sellers, active_buyers
total_listings, new_listings, listings_flagged
total_orders, completed_orders, canceled_orders, disputed_orders
gross_volume, platform_revenue, seller_payouts, refunds
average_rating, total_reviews, reviews_flagged
total_messages, moderation_items, resolved_disputes
```

### admin_logs Table
Audit trail of all admin actions.
```sql
id, admin_id, action_type
target_type (user/listing/review/conversation/order), target_id
details (JSONB), reason
created_at
```

### Performance Indexes
- idx_moderation_queue_status
- idx_moderation_queue_priority
- idx_moderation_queue_created_at
- idx_payment_disputes_status
- idx_payment_disputes_assigned_to
- idx_user_suspensions_user_id
- idx_user_suspensions_expires_at
- idx_marketplace_metrics_date
- idx_admin_logs_admin_id
- idx_admin_logs_created_at

---

## 🔧 API Functions

### Get Admin Dashboard Overview
```typescript
getAdminDashboard({})
```

Returns:
```typescript
{
  metrics: {
    totalUsers: number,
    activeUsers: number,
    totalListings: number,
    totalOrders: number,
    completedOrders: number,
    grossVolume: number,
    platformRevenue: number,
    averageRating: number,
  },
  pendingModeration: ModerationItem[],
  openDisputes: Dispute[],
  recentSuspensions: Suspension[],
}
```

### Get Moderation Queue
```typescript
getModerationQueue({
  status?: 'pending' | 'approved' | 'rejected' | 'deleted',
  priority?: 'low' | 'normal' | 'high' | 'critical',
  itemType?: string,
  limit?: number,  // default: 50
  offset?: number,
})
```

### Update Moderation Item
```typescript
updateModerationItem({
  itemId: string,
  status: 'approved' | 'rejected' | 'deleted',
  resolutionNotes?: string,
})
```

### Get Payment Disputes
```typescript
getPaymentDisputes({
  status?: 'open' | 'in_progress' | 'resolved',
  limit?: number,
  offset?: number,
})
```

### Resolve Dispute
```typescript
resolveDispute({
  disputeId: string,
  resolution: string,
  refundAmount?: number,
})
```

### Get Seller Warnings
```typescript
getSellerWarnings({
  sellerId?: string,
  severity?: 'low' | 'medium' | 'high' | 'critical',
  limit?: number,
})
```

### Issue Seller Warning
```typescript
issueSellerWarning({
  sellerId: string,
  warningType: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  actionRequired?: string,
  deadlineDays?: number,
})
```

### Get User Suspensions
```typescript
getUserSuspensions({
  status?: 'active' | 'lifted' | 'expired',
  limit?: number,
})
```

### Suspend User
```typescript
suspendUser({
  userId: string,
  suspensionType: 'temporary' | 'permanent',
  reason: string,
  durationDays?: number,
})
```

### Get Admin Logs
```typescript
getAdminLogs({
  actionType?: string,
  limit?: number,  // default: 100
})
```

### Get User Details (Admin)
```typescript
getUserDetailsAdmin({ userId: string })
```

Returns user profile, listings, warnings, suspensions, and seller stats.

---

## 🎨 UI Components

### DashboardOverview
Displays key metrics and alert summary.
```typescript
<DashboardOverview />
```

Shows:
- User and listing counts
- Order metrics
- Revenue figures
- Pending moderation count
- Open disputes count
- Active suspensions

### ModerationQueue
Browse and action moderation queue.
```typescript
<ModerationQueue />
```

Features:
- Filter by status and priority
- Display reason and description
- Approve/reject/delete buttons
- Resolution notes input
- Pagination

### PaymentDisputes
Manage payment disputes.
```typescript
<PaymentDisputes />
```

Shows:
- Dispute type
- Initiator information
- Order amount
- Quick action buttons
- Resolution dialog

### UserManagement
Manage suspensions and warnings.
```typescript
<UserManagement />
```

Tabs:
- **Suspensions** - Active and expired suspensions
- **Warnings** - Seller warnings with severity levels
- Suspend dialog for quick actions

---

## 📊 Moderation Workflow

### Item Flagging
1. Users flag content via review/listing/message
2. Item added to moderation_queue with status='pending'
3. Appears in admin dashboard and queue

### Review Process
1. Admin opens moderation queue
2. Reviews flagged item details
3. Reads flag reason and description
4. Examines related content if needed

### Resolution
1. Admin selects action (approve/reject/delete)
2. Adds resolution notes explaining decision
3. System records action in admin_logs
4. Original user notified if applicable

### Appeals
- Users can appeal moderation decisions
- Stored in appeal_status field
- Admin can reopen cases for reconsideration

---

## 🔐 Security & RLS

### Admin-Only Access
All admin tables use RLS policies requiring admin role (future implementation).

### Current Policies
```sql
-- Admins manage moderation
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Admins resolve disputes
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

-- Admins view and issue warnings
ALTER TABLE seller_warnings ENABLE ROW LEVEL SECURITY;

-- Admins manage suspensions
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;
```

### Audit Trail
- All admin actions logged in admin_logs
- Cannot be modified after creation
- Includes admin_id, action_type, target, reason

### Data Protection
- Dispute resolution documented
- Warning history preserved
- Suspension reasons recorded
- Audit trail immutable

---

## 💼 Admin Operations

### Daily Checklist
1. Review moderation queue (pending items)
2. Resolve open disputes
3. Review new warnings/suspensions
4. Check marketplace metrics
5. Address critical issues

### Weekly Review
1. Analyze moderation patterns
2. Identify repeat offenders
3. Review suspension expirations
4. Analyze quality metrics
5. Plan enforcement actions

### Monthly Analysis
1. Marketplace health report
2. Seller performance review
3. Buyer satisfaction trends
4. Revenue and volume analysis
5. Fraud/scam pattern analysis

---

## 📈 Marketplace Metrics Tracking

### Automatic Collection
- Runs daily at midnight (via scheduler)
- Updates marketplace_metrics table
- Aggregates data from all tables

### Tracked Metrics
```
User Metrics:
- Total users
- New users
- Active sellers/buyers
- Suspended users

Listing Metrics:
- Total listings
- New listings today
- Flagged listings
- Removed listings

Transaction Metrics:
- Total orders
- Completed/canceled orders
- Disputed orders
- Gross volume

Financial:
- Platform revenue
- Seller payouts
- Refunds issued

Quality:
- Average rating
- Total reviews
- Flagged reviews

Support:
- Messages sent
- Moderation items pending
- Resolved disputes
```

---

## 🚀 Deployment

### Database
1. Run migration: `20260819_admin_dashboard.sql`
2. Verify all tables created
3. Verify indexes exist
4. Test triggers and functions

### Frontend
1. Add components to project
2. Add route to admin menu
3. Verify RLS policies
4. Test with admin user

### Configuration
1. Set up daily metric aggregation (cron job)
2. Configure suspension expiry checks
3. Set up email notifications for admins
4. Configure audit log retention

---

## 🎯 Moderation Best Practices

### Content Moderation
1. **Review Thoroughly** - Check all related content
2. **Document Decisions** - Add clear resolution notes
3. **Be Consistent** - Apply policies uniformly
4. **Protect Users** - Balance seller/buyer interests
5. **Appeal Process** - Allow users to appeal decisions

### Seller Management
1. **Graduated Responses** - Warning → Temporary ban → Permanent
2. **Clear Communication** - Explain issues clearly
3. **Action Plans** - Give sellers time to improve
4. **Monitor Progress** - Track compliance with warnings
5. **Support Growth** - Help sellers succeed

### Dispute Resolution
1. **Gather Evidence** - Review all communications
2. **Fair Process** - Hear both sides
3. **Document Carefully** - Record full resolution
4. **Timely Action** - Resolve within SLA
5. **Learn & Improve** - Track patterns

---

## 🐛 Common Issues

### Moderation Queue Empty
- Verify items are being flagged
- Check flag creation in database
- Confirm triggers are active
- Test flag endpoint

### Disputes Not Showing
- Check payment_disputes table for data
- Verify order references exist
- Confirm RLS policies allow access
- Check date range queries

### Metrics Not Updating
- Verify marketplace_metrics table exists
- Check scheduled job is running
- Review database logs for errors
- Manually trigger update function

### Performance Issues
- Check index usage with EXPLAIN
- Monitor query performance
- Consider data archival strategy
- Optimize moderation queue queries

---

## 📞 Admin Support Commands

### Force Metric Calculation
```sql
SELECT update_daily_marketplace_metrics();
```

### Check Suspension Expiry
```sql
SELECT check_suspension_expiry();
```

### View Recent Admin Actions
```sql
SELECT * FROM admin_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

### Count Pending Items
```sql
SELECT item_type, COUNT(*) 
FROM moderation_queue 
WHERE status = 'pending' 
GROUP BY item_type;
```

---

**Status**: Production Ready ✅  
**Last Updated**: August 19, 2026  
**Version**: 1.0.0
