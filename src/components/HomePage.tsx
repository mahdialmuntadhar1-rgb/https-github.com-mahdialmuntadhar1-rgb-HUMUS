'use client';

import { useFilterState } from '@/hooks/useFilterState';
import { useBusinesses } from '@/hooks/useBusinesses';
import FilterBar from '@/components/FilterBar';
import BusinessGrid from '@/components/BusinessGrid';

export default function HomePage() {
  const {
    filters,
    page,
    updateGovernorate,
    updateCategory,
    resetFilters,
    nextPage,
  } = useFilterState();

  const queryResult = useBusinesses(filters, page);
  const { availableGovernortes, availableCategories, loading } = queryResult;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">BELIVE</h1>
          <p className="text-gray-600 mt-1">Iraqi Business Directory</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          availableGovernortes={availableGovernortes}
          availableCategories={availableCategories}
          loading={loading}
          onGovernorateChange={updateGovernorate}
          onCategoryChange={updateCategory}
          onReset={resetFilters}
        />

        {/* Business Grid */}
        <BusinessGrid
          queryResult={queryResult}
          onLoadMore={nextPage}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 text-sm">
          <p>© 2024 BELIVE - Iraqi Business Directory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
