# Seller Dashboard Guide

Complete guide to the comprehensive seller dashboard for marketplace analytics and business intelligence.

---

## 📋 Features

### Core Dashboard Views
- **Overview Stats** - Key metrics at a glance (active listings, rating, messages, views, completion rate)
- **Performance Charts** - Daily/weekly/monthly trends for views, messages, orders, and revenue
- **Recent Activity** - Latest orders and customer messages
- **Reviews & Ratings** - Customer feedback and rating distribution
- **Listing Performance** - Individual listing analytics and performance comparison

### Performance Tracking
- **Daily Metrics** - Track views, messages, orders, and revenue by day
- **Trend Analysis** - 7-day, 30-day, or 90-day performance periods
- **Top Performing Listings** - See which listings are getting the most attention
- **Completion Rates** - Monitor order completion and cancellation rates

### Customer Insights
- **Review Analytics** - View distribution of ratings (1-5 stars)
- **Response Metrics** - Track seller response rate and time
- **Message Activity** - Monitor conversation volume and trends
- **Recent Feedback** - See latest customer reviews and responses

---

## 🏗️ Database Architecture

### seller_stats Table
Main denormalized seller performance data, updated by triggers.
```sql
seller_id (unique)
total_listings, active_listings, archived_listings
average_rating, total_reviews
total_messages_sent, total_conversations
average_response_time_minutes
total_orders, completed_orders, canceled_orders
total_views, total_saves, total_inquiries
total_revenue, pending_payout, last_payout_date
completion_rate, cancellation_rate
created_at, updated_at
```

### seller_daily_metrics Table
Daily breakdown of metrics for trend analysis.
```sql
seller_id, metric_date
new_listings, new_messages, new_orders
new_views, new_inquiries
daily_revenue
created_at
```

### seller_badges Table
Achievements and seller badges.
```sql
seller_id, badge_type
badge_type: 'top_rated', 'fast_responder', 'popular', 'trustworthy', 'power_seller'
earned_at
```

### seller_earnings Table
Transaction history and earnings tracking.
```sql
seller_id, order_id
amount, platform_fee, net_amount
status (pending/completed/paid_out/disputed)
transaction_date, payment_date
```

### seller_insights Table
Performance insights and recommendations.
```sql
seller_id (unique)
rating_vs_market_avg, response_time_vs_market_avg
rating_trend, sales_trend ('increasing'/'stable'/'decreasing')
action_needed, action_type, action_priority
last_calculated
```

### Auto-Update Triggers
- `update_seller_stats_on_review()` - Updates rating and review count when reviews change
- `update_seller_stats_on_message()` - Increments message counter when new message sent
- `update_seller_stats_on_listing()` - Counts active/archived listings
- `update_seller_stats_on_view()` - Increments view counter
- `update_seller_stats_on_order()` - Updates order statistics
- `update_seller_completion_rate()` - Calculates completion rates

### Performance Indexes
- idx_seller_stats_seller_id - Fast seller lookups
- idx_seller_stats_rating - Sort by rating
- idx_seller_stats_reviews - Filter by review count
- idx_seller_stats_revenue - Sort by earnings
- idx_seller_daily_metrics_seller_id - Daily data access
- idx_seller_daily_metrics_date - Time range queries
- idx_seller_badges_seller_id - User achievement lookup
- idx_seller_earnings_seller_id - Earnings history
- idx_seller_earnings_status - Filter by payment status

---

## 🔧 API Functions

### Get Seller Dashboard Overview
```typescript
getSellerDashboard({ sellerId: string })
```

Returns:
```typescript
{
  stats: {
    totalListings: number,
    activeListings: number,
    averageRating: number,    // 0-5
    totalReviews: number,
    totalMessages: number,
    totalOrders: number,
    completedOrders: number,
    completionRate: number,   // percentage 0-100
    totalRevenue: number,
    totalViews: number,
    totalSaves: number,
  },
  profile: { name, avatar_url, email },
  recentOrders: Order[],
  recentMessages: Conversation[],
}
```

### Get Performance Metrics (for Charts)
```typescript
getSellerPerformanceMetrics({
  sellerId: string,
  days: number  // default: 30
})
```

Returns daily breakdown for charting:
```typescript
{
  dailyMetrics: [
    { metric_date, new_views, new_messages, new_orders, daily_revenue }
  ],
  totals: {
    views: number,
    messages: number,
    orders: number,
    revenue: number,
  },
  period: { startDate, endDate, days }
}
```

### Get Seller Earnings
```typescript
getSellerEarnings({
  sellerId: string,
  startDate?: string,
  endDate?: string,
})
```

Returns:
```typescript
{
  earnings: [
    { id, amount, platform_fee, net_amount, status, transaction_date }
  ],
  totalRevenue: number,
  pendingPayout: number,
}
```

### Get Reviews & Ratings
```typescript
getSellerReviewsAndRatings({ sellerId: string })
```

Returns:
```typescript
{
  rating: {
    averageRating: number,
    totalReviews: number,
    rating1Count through rating5Count: number,
    responseRate: number,
  },
  recentReviews: Review[],
}
```

### Get Seller Badges
```typescript
getSellerBadges({ sellerId: string })
```

Returns array of earned badges with earn dates.

### Get Seller Insights
```typescript
getSellerInsights({ sellerId: string })
```

Returns:
```typescript
{
  ratingVsMarketAvg: number,
  responseTimeVsMarketAvg: number,
  ratingTrend: 'increasing' | 'stable' | 'decreasing',
  salesTrend: 'increasing' | 'stable' | 'decreasing',
  actionNeeded: boolean,
  actionType: string,  // e.g., 'improve_ratings'
  actionPriority: 'high' | 'medium' | 'low',
}
```

### Get Listing Performance
```typescript
getSellerListingPerformance({ sellerId: string })
```

Returns array with individual listing stats:
```typescript
[
  {
    id, title, imageUrl, category, isActive,
    rating, views, saves, reviewCount, avgReviewRating,
    createdAt,
  }
]
```

### Get Market Comparison
```typescript
getMarketComparison({
  sellerId: string,
  category?: string
})
```

Returns seller's metrics vs market averages:
```typescript
{
  seller: { rating, reviews, completionRate },
  market: { avgRating, avgReviews, avgCompletionRate },
  comparison: { ratingDiff, reviewsDiff, completionRateDiff },
}
```

---

## 🎨 UI Components

### DashboardOverview
Displays key performance metrics in card format.
```typescript
<DashboardOverview sellerId={sellerId} />
```

Shows:
- Active listings count
- Average rating with review count
- Total messages sent
- Total views
- Completion rate percentage

### PerformanceChart
Interactive charts showing trends over time with period selector.
```typescript
<PerformanceChart sellerId={sellerId} />
```

Features:
- Line chart: Views, messages, orders trends
- Bar chart: Daily revenue
- Period selector: 7d, 30d, 90d
- Summary cards for quick stats

### RecentActivity
Two-column layout showing recent orders and messages.
```typescript
<RecentActivity sellerId={sellerId} />
```

Shows:
- Last 5 orders with status badges
- Last 5 conversations with preview
- Relative timestamps
- Order amounts

### ReviewsSection
Comprehensive review analytics and feedback display.
```typescript
<ReviewsSection sellerId={sellerId} />
```

Features:
- Average rating display
- Response rate metric
- Rating distribution bar chart
- List of recent reviews with seller responses
- Helpful vote counts

### ListingPerformance
Table and analytics for individual listings.
```typescript
<ListingPerformance sellerId={sellerId} />
```

Shows:
- Active listings table
- Archived listings section
- Summary statistics (views, saves, reviews)
- Top performing listings carousel

---

## 📊 Integration Examples

### Complete Seller Dashboard Page
```typescript
import { DashboardOverview } from "@/components/seller-dashboard/dashboard-overview";
import { PerformanceChart } from "@/components/seller-dashboard/performance-chart";
import { RecentActivity } from "@/components/seller-dashboard/recent-activity";
import { ReviewsSection } from "@/components/seller-dashboard/reviews-section";
import { ListingPerformance } from "@/components/seller-dashboard/listing-performance";
import { Suspense } from "react";

function SellerDashboard({ sellerId }) {
  return (
    <div className="space-y-8">
      <Suspense fallback={<Skeleton />}>
        <DashboardOverview sellerId={sellerId} />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <PerformanceChart sellerId={sellerId} />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <RecentActivity sellerId={sellerId} />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <ReviewsSection sellerId={sellerId} />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <ListingPerformance sellerId={sellerId} />
      </Suspense>
    </div>
  );
}
```

### Embedded in Account Navigation
Already integrated at `/racun/dashboard` with "Analitika" label in account sidebar menu.

### Analytics Widget for Homepage
```typescript
function SellerStatsWidget({ sellerId }) {
  const { data } = useSuspenseQuery({
    queryKey: ["sellerDashboard", sellerId],
    queryFn: () => getSellerDashboard({ sellerId }),
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">{data.stats.totalListings}</div>
        <div className="text-xs text-muted-foreground">Active Listings</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">
          {data.stats.averageRating.toFixed(1)}⭐
        </div>
        <div className="text-xs text-muted-foreground">Rating</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">
          {data.stats.completionRate.toFixed(0)}%
        </div>
        <div className="text-xs text-muted-foreground">Completion</div>
      </div>
    </div>
  );
}
```

---

## 🔐 Security & RLS

### Row-Level Security Policies

**seller_stats:**
- Sellers see only their own stats
- Public can view basic stats (future public profile feature)

**seller_earnings:**
- Only the seller can view their earnings history
- Prevents cross-seller data exposure

**seller_insights:**
- Only the seller can view personalized recommendations
- Admins can see all insights (future admin dashboard)

### Data Protection
- All seller-specific queries filtered by `auth.uid()`
- Transactions tracked by order_id with payment verification
- Financial data never exposed to non-sellers

---

## 📈 Analytics Queries

### Seller Performance Over Time
```sql
SELECT
  DATE(metric_date) as date,
  SUM(new_views) as total_views,
  SUM(new_orders) as total_orders,
  SUM(daily_revenue) as daily_revenue,
  COUNT(*) as records
FROM seller_daily_metrics
WHERE seller_id = $1
GROUP BY DATE(metric_date)
ORDER BY date DESC
LIMIT 30;
```

### Top Sellers by Rating
```sql
SELECT
  seller_id,
  average_rating,
  total_reviews,
  completion_rate,
  total_revenue
FROM seller_stats
WHERE average_rating > 4.0
ORDER BY average_rating DESC, total_reviews DESC
LIMIT 10;
```

### Trending Up/Down Sellers
```sql
SELECT
  si.seller_id,
  si.rating_trend,
  si.sales_trend,
  ss.average_rating,
  ss.total_orders
FROM seller_insights si
JOIN seller_stats ss ON si.seller_id = ss.seller_id
WHERE si.rating_trend = 'increasing'
ORDER BY ss.total_reviews DESC;
```

---

## 💡 Best Practices for Sellers

### Maximize Your Dashboard
1. **Check Daily** - Review performance metrics daily for trends
2. **Act on Insights** - Follow recommended actions to improve ratings
3. **Respond to Reviews** - Higher response rate = better credibility
4. **Improve Listings** - Focus on top performers, improve underperformers
5. **Monitor Messages** - Track response time and message volume

### Growth Strategies
1. **Quality First** - Maintain high ratings (4.5+) for visibility
2. **Fast Responses** - Reduce response time to <2 hours for more inquiries
3. **Multiple Listings** - Higher count = more visibility
4. **Encourage Reviews** - More reviews = higher buyer confidence
5. **Competitive Pricing** - Monitor market rates for your category

### Performance Targets
- **Rating:** 4.5+ stars (top 10% of sellers)
- **Response Rate:** 80%+ (show customers you're reliable)
- **Response Time:** <4 hours (faster = more conversions)
- **Completion Rate:** 95%+ (build trust)
- **Review Count:** 20+ (proof of sales)

---

## 🚀 Deployment

### Database
1. Run migration: `20260819_seller_dashboard.sql`
2. Verify all tables created (seller_stats, seller_daily_metrics, etc.)
3. Verify triggers active and firing

### Frontend
1. Verify components render correctly with Suspense boundaries
2. Test chart rendering with various data ranges
3. Test responsive design on mobile/tablet
4. Verify loading states display properly

### Data Population
1. Existing sellers get auto-populated stats via triggers
2. Historical data needs backend seed job (future)
3. Daily metrics calculated nightly (future cron job)
4. Badges awarded by seller actions automatically

---

## 🎯 Future Enhancements

### Phase 2: Predictive Analytics
- Forecasted revenue trends
- Optimal pricing recommendations
- Inventory management alerts
- Seasonal trend analysis

### Phase 3: Advanced Features
- Custom report builder
- Competitor benchmarking
- Automated email summaries
- Export data (PDF/CSV)

### Phase 4: AI Features
- Auto-generated insights
- Recommendation engine
- Chatbot assistance
- Automated review responses

---

## 🐛 Common Issues

### Stats Not Updating
1. Check if triggers are active: `SELECT proname FROM pg_proc WHERE tgname LIKE '%seller%'`
2. Verify seller_stats row exists for user: `SELECT * FROM seller_stats WHERE seller_id = $1`
3. Check trigger logs in PostgreSQL for errors

### Charts Not Rendering
1. Verify seller_daily_metrics has data: `SELECT * FROM seller_daily_metrics LIMIT 1`
2. Check date range is correct
3. Verify Recharts is properly installed

### Missing Reviews
1. Verify reviews exist in listing_reviews with `status = 'published'`
2. Check seller_id filter is correct
3. Verify seller_ratings table has entry

### Performance Slow
1. Check indexes exist: `SELECT * FROM pg_indexes WHERE tablename LIKE 'seller_%'`
2. Analyze query plans
3. Consider caching daily metrics (Redis)

---

**Status**: Production Ready ✅  
**Last Updated**: August 19, 2026  
**Version**: 1.0.0
