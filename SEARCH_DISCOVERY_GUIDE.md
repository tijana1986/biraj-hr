# Search & Discovery System Guide

Complete guide to the advanced search and discovery system for Biraj.HR marketplace.

---

## 📋 Features

### Core Search
- **Full-text search** on listing title and description
- **Real-time suggestions** as users type
- **Search history** for analytics and trending topics

### Advanced Filtering
- Filter by category with live counts
- Filter by location with live counts
- Price range filtering (min/max)
- Promotion status filter (promoted listings only)
- Featured listings filter
- Combination filtering (multiple filters at once)

### Sorting Options
- **Newest** - Recently posted listings first
- **Popular** - Most viewed listings first
- **Rating** - Highest rated listings first
- **Price ASC** - Lowest price first
- **Price DESC** - Highest price first

### User Features
- **Saved searches** - Save favorite search queries with filters
- **Quick access** - One-click to re-run saved searches
- **Search suggestions** - Autocomplete suggestions while typing
- **Listing views** - Track which listings users view
- **Wishlist** - Save individual listings to favorites

---

## 🏗️ Architecture

### Database Schema

#### Core Tables Enhanced
```sql
listings (enhanced for search)
├── search_vector (tsvector) - Full-text search index
├── view_count (int) - Popularity metric
├── rating (decimal) - Average user rating
├── review_count (int) - Number of reviews
├── is_featured (boolean) - Featured listing flag
└── [existing fields]
```

#### New Tables

**saved_searches** - User's saved search queries
```
id, user_id, name, query, filters (JSONB), created_at, updated_at
```

**search_history** - Analytics on search queries
```
id, user_id, query, results_count, created_at
```

**listing_views** - Tracks individual listing views
```
id, listing_id, user_id, viewed_at
```

**listing_interactions** - All user interactions (view/save/message)
```
id, listing_id, user_id, interaction_type, created_at
```

### Performance Indexes
```sql
idx_listings_search_vector - Full-text search
idx_listings_category_active - Category + active filter
idx_listings_location_active - Location + active filter
idx_listings_rating_desc - Popularity/rating sort
idx_listings_view_count_desc - View count sort
idx_listings_created_at - Newest sort
idx_listings_is_featured - Featured listings
```

---

## 🔧 API Functions

### Search Listings
```typescript
searchListings({
  query?: string,           // Search term
  category?: string,        // Category filter
  location?: string,        // Location filter
  minPrice?: number,        // Minimum price (€)
  maxPrice?: number,        // Maximum price (€)
  promotion?: boolean,      // Only promoted listings
  featured?: boolean,       // Only featured listings
  sortBy?: 'newest' | 'popular' | 'rating' | 'price-asc' | 'price-desc',
  page?: number,            // Pagination (default: 1)
  limit?: number            // Results per page (default: 20)
})
```

Returns:
```typescript
{
  listings: SearchListing[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

### Get Suggestions
```typescript
getSearchSuggestions({ query: string })
// Returns: string[] - Array of suggestion strings
```

### Get Categories
```typescript
getCategories()
// Returns: Array<{ name: string, count: number }>
```

### Get Locations
```typescript
getLocations()
// Returns: Array<{ name: string, count: number }>
```

### Save Search
```typescript
saveSearch({
  name: string,           // User-friendly name
  query?: string,         // Search query
  filters?: object        // Filter object
})
// Returns: Saved search record
```

### Get Saved Searches
```typescript
getSavedSearches()
// Returns: SavedSearch[] (for authenticated user only)
```

### Delete Saved Search
```typescript
deleteSavedSearch({ id: string })
// Returns: { success: boolean }
```

### Record View
```typescript
recordListingView({ listingId: string })
// Increments view count and records in analytics
```

---

## 🎨 UI Components

### SearchBar
Search input with autocomplete suggestions.

```typescript
<SearchBar
  initialQuery="user's initial search"
  onSearch={(query) => handleSearch(query)}
  placeholder="Pretraži oglase..."
/>
```

Features:
- Debounced suggestion fetching (300ms)
- Clear button for quick reset
- Enter key to search
- Dropdown suggestions
- Loading state

### SearchFilters
Sidebar filter panel with all filter options.

```typescript
<SearchFilters
  categories={categories}
  locations={locations}
  onFiltersChange={(filters) => handleUpdate(filters)}
  initialFilters={currentFilters}
/>
```

Features:
- Sorting dropdown
- Category selector
- Location selector
- Advanced filters (collapsible)
  - Price range (min/max)
  - Promotion checkbox
  - Featured checkbox
- Reset button
- Live category/location counts

### SearchResults
Grid display of search results with pagination.

```typescript
<SearchResults filters={searchFilters} />
```

Features:
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Listing cards with:
  - Image with hover zoom
  - Promotion badge
  - Featured badge
  - Save to wishlist button
  - Rating stars
  - Location
  - Price
  - View count
- Pagination controls
- Empty state handling
- Loading state

---

## 📊 Integration Examples

### Basic Search Page
```typescript
function SearchPage() {
  const [filters, setFilters] = useState({
    query: "",
    limit: 20,
  });

  return (
    <div>
      <SearchBar onSearch={(q) => setFilters({ ...filters, query: q })} />
      <div className="flex gap-8">
        <SearchFilters onFiltersChange={(f) => setFilters({ ...filters, ...f })} />
        <SearchResults filters={filters} />
      </div>
    </div>
  );
}
```

### Homepage with Search
```typescript
function HomePage() {
  return (
    <div>
      <SearchBar placeholder="Što tražiš?" />
      <FeaturedListings />
      <PopularListings sortBy="popular" limit={10} />
    </div>
  );
}
```

### Category Page
```typescript
function CategoryPage({ categoryName }) {
  const [filters] = useState({
    category: categoryName,
    limit: 20,
  });

  return (
    <div>
      <h1>{categoryName}</h1>
      <SearchFilters onFiltersChange={handleFilters} />
      <SearchResults filters={filters} />
    </div>
  );
}
```

---

## 🔍 Search Behavior

### Full-Text Search
Searches for query term in:
1. Listing title (exact word match)
2. Listing description (phrase match)

Example: "pristupačan Auto" finds:
- "Pristupačan i jeftin automat"
- "Auto pristupačan svim godinama"

### Filtering Logic
- All filters are applied with AND logic
- Multiple filter types combine (e.g., location AND price range)
- Promotion/featured filters are optional
- Empty filter = all results

### Sorting Priority
- Newest: `created_at DESC`
- Popular: `view_count DESC`
- Rating: `rating DESC` (then `review_count DESC`)
- Price ASC: `price ASC`
- Price DESC: `price DESC`

### Pagination
- Default 20 results per page
- Offset-based pagination
- Safe for large result sets
- Minimum 1, maximum 100 results per page

---

## 📈 Analytics & Insights

### Tracked Metrics
1. **Search queries** - What users search for
2. **Search results** - How many results per query
3. **Listing views** - Which listings get viewed most
4. **User interactions** - Save, view, message, promote

### Queries for Analytics

Total searches this month:
```sql
SELECT COUNT(*) FROM search_history 
WHERE created_at > NOW() - INTERVAL '30 days';
```

Most searched terms:
```sql
SELECT query, COUNT(*) as searches
FROM search_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY query
ORDER BY searches DESC
LIMIT 10;
```

Most viewed listings:
```sql
SELECT id, title, view_count, rating
FROM listings
WHERE is_active = true
ORDER BY view_count DESC
LIMIT 10;
```

---

## 🔐 Security & RLS

### Saved Searches
- Authenticated users only
- Each user sees only own saved searches
- RLS policies enforce user isolation

### Search History
- Tracks anonymous searches (null user_id)
- Tracks authenticated user searches
- No sensitive data stored (just query text)

### View Tracking
- Can be anonymous (null user_id)
- Records authenticated user IDs when available
- Used for personalization and analytics

---

## 🎯 Best Practices

### For Users
1. **Use search bar** for quick discovery
2. **Save searches** for frequently searched queries
3. **Use filters** to narrow results
4. **Sort by rating** for best quality listings

### For Developers
1. **Limit pagination** to 100 results max
2. **Cache categories/locations** (update frequency < 1 min)
3. **Debounce suggestions** (300ms)
4. **Index new columns** when adding filters
5. **Monitor search performance** via database logs

### For Admins
1. **Monitor popular searches** for trends
2. **Remove spam queries** from history if needed
3. **Promote popular listings** to featured section
4. **Update categories** based on user searches

---

## 🚀 Performance Tips

### Query Optimization
- Use indexes for filters (already created)
- Limit full-text search results
- Use pagination always
- Cache filter options (categories, locations)

### Frontend Optimization
- Debounce search suggestions (300ms)
- Lazy load images in results
- Use virtualized lists for large result sets
- Cache search results in React Query

### Database
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes 
WHERE relname = 'listings';

-- Monitor slow queries
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%listings%'
ORDER BY mean_time DESC;
```

---

## 📱 Mobile Experience

### Responsive Design
- Search bar full width on mobile
- Filters collapse to modal on mobile
- Grid: 1 column on mobile, 2+ on tablet/desktop
- Touch-friendly button sizes (44px minimum)

### Mobile Optimizations
- Debounced search (300ms for mobile)
- Simplified filter modal
- Lazy-load images below fold
- Pagination instead of infinite scroll

---

## 🐛 Troubleshooting

### No search results
1. Check query syntax (full-text has limitations)
2. Verify listings exist in database
3. Check RLS policies don't block access
4. Clear browser cache

### Slow search
1. Check indexes are created
2. Monitor database query time
3. Reduce results per page
4. Enable query caching

### Suggestions not showing
1. Verify `getSearchSuggestions` has data
2. Check minimum query length (2 chars)
3. Verify API endpoint is working
4. Check browser console for errors

---

## 📚 Next Steps

1. **Deploy migration** to production Supabase
2. **Test search functionality** with test listings
3. **Monitor performance** via Vercel logs
4. **Gather user feedback** on search experience
5. **Optimize based on usage** analytics

---

**Status**: Production Ready ✅  
**Last Updated**: August 19, 2026  
**Version**: 1.0.0
