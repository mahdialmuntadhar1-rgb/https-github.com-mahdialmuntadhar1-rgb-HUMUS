import BusinessCard from './BusinessCard';
import { QueryResult } from '@/lib/supabaseClient';

interface BusinessGridProps {
  queryResult: QueryResult;
  onLoadMore: () => void;
}

export default function BusinessGrid({ queryResult, onLoadMore }: BusinessGridProps) {
  const { businesses, total, loading, error, hasMore } = queryResult;

  // Loading state
  if (loading && businesses.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Unable to Load Businesses</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (businesses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 font-semibold mb-2">No Businesses Found</p>
        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  // Results
  return (
    <div>
      {/* Results Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-900 font-semibold">
          Showing {businesses.length} of {total} businesses
        </p>
        <p className="text-blue-700 text-sm mt-1">
          {total === 0 ? 'No results' : `Total: ${total} businesses`}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {businesses.map(business => (
          <BusinessCard
            key={business.id}
            business={business}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mb-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* No More Results */}
      {!hasMore && businesses.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No more businesses to load</p>
        </div>
      )}
    </div>
  );
}
