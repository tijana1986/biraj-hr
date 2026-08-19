# Reviews & Ratings System Guide

Complete guide to the marketplace review system for building trust and credibility.

---

## 📋 Features

### Core Review System
- **1-5 Star Ratings** - Standard star rating system
- **Written Reviews** - Title + detailed comment
- **Verified Purchase Badge** - Shows if review comes from actual purchase
- **Photo Reviews** - Optional photos with descriptions
- **Edit Reviews** - Users can update their reviews

### Seller Ratings
- **Average Rating** - Aggregated across all reviews
- **Rating Breakdown** - Distribution chart (1-5 stars)
- **Total Review Count** - Number of reviews received
- **Response Rate** - % of reviews seller responded to
- **Response Time** - Average hours to respond to review

### Engagement Features
- **Helpful Voting** - Mark reviews as helpful/unhelpful
- **Seller Responses** - Sellers can reply to reviews (once per review)
- **Review Moderation** - Flag inappropriate reviews
- **Review History** - Full changelog of edits

### Quality Control
- **Verified Purchase Only** - Can't review without purchase
- **One Review Per Listing** - Prevent duplicate reviews
- **Self-Review Prevention** - Sellers can't review themselves
- **Moderation Queue** - Report spam/fake reviews
- **Auto-Hiding** - Flagged reviews hidden during review

---

## 🏗️ Database Architecture

### listing_reviews Table
```sql
id, listing_id, order_id, reviewer_id, seller_id
rating (1-5), title, comment, photos (JSONB array)
is_verified_purchase, helpful_count, unhelpful_count
status (published/flagged/hidden)
created_at, updated_at
```

### seller_ratings Table (Denormalized)
```sql
seller_id (unique)
average_rating, total_reviews
rating_1_count through rating_5_count
response_rate, response_time_hours
updated_at
```

### seller_review_responses Table
```sql
id, review_id, seller_id
response (text)
created_at, updated_at
```

### review_flags Table
```sql
id, review_id, reported_by_id
reason (spam/offensive/fake/irrelevant)
description, status (pending/reviewed/resolved)
created_at
```

### review_votes Table
```sql
id, review_id, voter_id
is_helpful (boolean)
created_at (unique per review+voter)
```

### Performance Indexes
- idx_listing_reviews_listing_id - Get reviews for listing
- idx_listing_reviews_seller_id - Get seller's reviews
- idx_listing_reviews_rating - Filter by stars
- idx_seller_ratings_average - Sort by rating
- idx_review_votes_review_id - Get vote counts

### Auto-Update Triggers
- `update_seller_ratings()` - Recalculate seller stats on review change
- `ensure_seller_rating_record()` - Create rating record on first review
- `update_review_helpful_count()` - Update vote counts
- `update_listing_rating()` - Update listing.average_rating

---

## 🔧 API Functions

### Get Listing Reviews
```typescript
getListingReviews({
  listingId: string,
  sortBy?: 'recent' | 'helpful' | 'rating-high' | 'rating-low',
  ratingFilter?: number,  // 1-5 for specific star
  limit?: number,         // default: 10
  offset?: number         // default: 0
})
```

Returns:
```typescript
{
  reviews: Review[],
  total: number,
  page: number,
  totalPages: number
}
```

### Get Seller Rating
```typescript
getSellerRating({ sellerId: string })
```

Returns:
```typescript
{
  sellerId: string,
  sellerName: string,
  sellerAvatar: string | null,
  averageRating: number,   // 0-5
  totalReviews: number,
  rating1Count through rating5Count: number,
  responseRate: number     // 0-100%
}
```

### Create Review
```typescript
createReview({
  listingId: string,
  sellerId: string,
  orderId?: string,        // For verified purchase badge
  rating: number,          // 1-5
  title: string,           // 5-200 chars
  comment: string,         // 10-2000 chars
  photos?: Array<{
    url: string,
    description?: string
  }>
})
```

### Update Review
```typescript
updateReview({
  reviewId: string,
  rating: number,
  title: string,
  comment: string,
  photos?: Array<...>
})
// Only reviewer can update
```

### Respond to Review
```typescript
respondToReview({
  reviewId: string,
  response: string         // 10-1000 chars
})
// Only seller can respond, once per review
```

### Vote Helpful
```typescript
voteReviewHelpful({
  reviewId: string,
  isHelpful: boolean
})
// Upserts vote, replaces previous
```

### Flag Review
```typescript
flagReview({
  reviewId: string,
  reason: 'spam' | 'offensive' | 'fake' | 'irrelevant',
  description?: string
})
```

---

## 🎨 UI Components

### RatingDisplay
Shows seller rating with stars and count.

```typescript
<RatingDisplay
  sellerId={seller.id}
  size="md"           // sm, md, lg
  showText={true}     // Show rating number
/>
```

Displays: ⭐⭐⭐⭐ 4.5 (128)

### ReviewList
Full review listing with pagination and filtering.

```typescript
<ReviewList
  listingId={listing.id}
  currentUserId={user?.id}
/>
```

Features:
- Sort dropdown (recent, helpful, high-low ratings)
- Star rating filter
- Pagination controls
- Helpful/unhelpful voting
- Flag review button
- Seller response display
- Verified purchase badge

### ReviewForm
Create/edit review form.

```typescript
<ReviewForm
  listingId={listing.id}
  sellerId={seller.id}
  orderId={order?.id}      // For verified badge
  onSuccess={() => {...}}  // Called after submit
/>
```

Features:
- 5-star rating picker with hover preview
- Title input (5-200 chars)
- Comment textarea (10-2000 chars)
- Character counters
- Submit button with loading state
- Validation feedback

---

## 📊 Integration Examples

### On Listing Detail Page
```typescript
function ListingDetail({ listing, seller }) {
  return (
    <div>
      <div className="mb-8">
        <RatingDisplay sellerId={seller.id} />
        <ReviewForm
          listingId={listing.id}
          sellerId={seller.id}
          orderId={currentOrder?.id}
        />
      </div>
      <ReviewList listingId={listing.id} />
    </div>
  );
}
```

### On Seller Profile
```typescript
function SellerProfile({ seller }) {
  return (
    <div>
      <RatingDisplay sellerId={seller.id} size="lg" />
      <ReviewList listingId={undefined} />  // All reviews
    </div>
  );
}
```

### In Search Results
```typescript
function SearchResult({ listing }) {
  return (
    <div>
      <h3>{listing.title}</h3>
      <RatingDisplay sellerId={listing.seller_id} size="sm" />
    </div>
  );
}
```

---

## 🔐 Security & RLS

### Row-Level Security

**listing_reviews:**
- Public can view published reviews
- Reviewers/sellers can see own reviews even if unpublished
- Only verified buyers can create reviews
- Only reviewers can edit own reviews

**seller_ratings:**
- Anyone can view (no RLS needed, public)

**Review Responses:**
- Anyone can view
- Only sellers can add responses to own reviews

**Review Flags:**
- Users can flag reviews
- Users can see own flags
- Admins see all flags (future)

### Verification
- Checks order_id in promotion_orders table
- Confirms payment_status = 'completed'
- Allows conversation participation as fallback

### One Review Per Listing
```sql
UNIQUE constraint prevents duplicate reviews
- Same reviewer
- Same listing
- (regardless of seller)
```

---

## 📈 Analytics

### Review Metrics
```sql
-- Average rating by seller
SELECT seller_id, AVG(rating) as avg_rating, COUNT(*) as total
FROM listing_reviews
WHERE status = 'published'
GROUP BY seller_id;

-- Most reviewed listings
SELECT listing_id, COUNT(*) as review_count
FROM listing_reviews
WHERE status = 'published'
GROUP BY listing_id
ORDER BY review_count DESC;

-- Review sentiment
SELECT rating, COUNT(*) as count
FROM listing_reviews
WHERE status = 'published'
GROUP BY rating;

-- Seller response rate
SELECT seller_id,
  (SELECT COUNT(*) FROM seller_review_responses r
   WHERE r.seller_id = listing_reviews.seller_id) /
  CAST(COUNT(*) AS FLOAT) as response_rate
FROM listing_reviews
GROUP BY seller_id;
```

---

## 💡 Best Practices

### For Reviewers
1. **Be specific** - Describe actual experience
2. **Be honest** - Truthful reviews help everyone
3. **Include details** - What worked? What didn't?
4. **Be fair** - Rate based on listing accuracy
5. **Add photos** - Pictures help other buyers

### For Sellers
1. **Respond quickly** - Build trust by responding
2. **Address concerns** - Don't ignore negative feedback
3. **Stay professional** - Don't argue or get defensive
4. **Thank reviewers** - Show appreciation for feedback
5. **Improve based on feedback** - Show you care

### For Platform
1. **Verify purchases** - Only buyers should review
2. **Moderate actively** - Remove fake/spam reviews
3. **Protect reviewers** - Privacy and safety first
4. **Encourage feedback** - Send reminders post-purchase
5. **Showcase ratings** - Display prominently in search

---

## 🚀 Deployment

### Database
1. Apply migration: `20260819_reviews_ratings.sql`
2. Verify all tables and indexes created
3. Verify triggers are active
4. Test rating calculation trigger

### Frontend
1. Add review section to listing detail page
2. Add rating display to search results
3. Test review form validation
4. Test helpful/flag features

### Launch Sequence
1. Enable review creation (week 1)
2. Collect 10+ reviews per major seller
3. Enable seller responses (week 2)
4. Launch star ratings in search (week 3)
5. Featured seller badges based on ratings (week 4)

---

## 🎯 Growth Roadmap

### Phase 1: Basic Reviews
✅ 1-5 star ratings
✅ Written reviews
✅ Helpful voting
✅ Seller responses

### Phase 2: Quality
- Review photos
- Video reviews
- Detailed feedback categories
- Review authenticity verification

### Phase 3: Engagement
- Review reminders post-purchase
- Incentives for reviews (badges)
- Most helpful reviewers
- Review contests

### Phase 4: Intelligence
- AI-powered review analysis
- Sentiment detection
- Fake review detection
- Recommendation algorithm

---

## 🐛 Common Issues

### No reviews showing
1. Check `status = 'published'` filter
2. Verify reviews exist in database
3. Check RLS policies allow SELECT
4. Verify listing_id matches

### Rating not updating
1. Check seller_ratings table exists
2. Verify trigger is active
3. Check for trigger errors in logs
4. Manually run `update_seller_ratings()`

### Can't create review
1. Verify user is logged in
2. Check review doesn't already exist
3. Verify purchase requirement (order_id)
4. Check seller_id doesn't match buyer_id

### Helpful count not changing
1. Verify review_votes table has data
2. Check helpful count trigger
3. Verify vote was inserted (upsert)
4. Check for constraint violations

---

**Status**: Production Ready ✅  
**Last Updated**: August 19, 2026  
**Version**: 1.0.0
