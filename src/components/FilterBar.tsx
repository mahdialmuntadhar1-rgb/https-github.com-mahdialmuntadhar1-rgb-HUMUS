import { FilterState } from '@/lib/supabaseClient';

interface FilterBarProps {
  filters: FilterState;
  availableGovernortes: string[];
  availableCategories: string[];
  loading: boolean;
  onGovernorateChange: (gov: string) => void;
  onCategoryChange: (cat: string) => void;
  onReset: () => void;
}

export default function FilterBar({
  filters,
  availableGovernortes,
  availableCategories,
  loading,
  onGovernorateChange,
  onCategoryChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = filters.governorate !== 'All' || filters.category !== 'All';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Filters</h2>

      {/* Filter Status */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <span className="font-semibold">Active Filters:</span>
          {filters.governorate !== 'All' && (
            <span className="ml-2 bg-blue-200 px-2 py-1 rounded">
              {filters.governorate}
              <button
                onClick={() => onGovernorateChange('All')}
                className="ml-1 font-bold"
                aria-label="Clear governorate filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.category !== 'All' && (
            <span className="ml-2 bg-blue-200 px-2 py-1 rounded">
              {filters.category}
              <button
                onClick={() => onCategoryChange('All')}
                className="ml-1 font-bold"
                aria-label="Clear category filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Governorate Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2">Governorate</label>
          <select
            value={filters.governorate}
            onChange={e => onGovernorateChange(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Governorates</option>
            {availableGovernortes.map(gov => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {availableGovernortes.length} governorates available
          </p>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <select
            value={filters.category}
            onChange={e => onCategoryChange(e.target.value)}
            disabled={loading || availableCategories.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {availableCategories.length} categories available
            {filters.governorate !== 'All' && ' in this governorate'}
          </p>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={onReset}
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 animate-pulse">Updating filters...</p>
        </div>
      )}
    </div>
  );
}
