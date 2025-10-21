/**
 * Explorer Search Bar Component
 * 
 * Provides search, filter, and sort controls for the Public Proof Explorer.
 * Features glassmorphism design with animated interactions.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, SortDesc, X } from "lucide-react";
import { ProofFilters } from "@/lib/fetchProofs";

interface ExplorerSearchBarProps {
  filters: ProofFilters;
  onFiltersChange: (filters: ProofFilters) => void;
  totalCount: number;
  showFilterPanel?: boolean;
  onToggleFilterPanel?: () => void;
}

export default function ExplorerSearchBar({
  filters,
  onFiltersChange,
  totalCount,
  showFilterPanel = false,
  onToggleFilterPanel,
}: ExplorerSearchBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: e.target.value,
      page: 1, // Reset to first page on search
    });
  };

  const handleClearSearch = () => {
    onFiltersChange({
      ...filters,
      searchQuery: '',
      page: 1,
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      modelFilter: e.target.value,
      page: 1,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      typeFilter: e.target.value as 'all' | 'text' | 'image' | 'code',
      page: 1,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as 'recent' | 'oldest',
    });
  };

  const activeFiltersCount = [
    filters.searchQuery,
    filters.modelFilter && filters.modelFilter !== 'all',
    filters.typeFilter && filters.typeFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="relative flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              placeholder="Search by wallet address, model, or proof ID..."
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-xl"
            />
            {filters.searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFilterPanel}
            className={`relative px-5 py-3.5 rounded-xl border transition-all ${
              showFilterPanel
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-medium hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </div>
          </motion.button>

          {/* Sort Dropdown */}
          <div className="relative hidden md:block">
            <SortDesc className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              value={filters.sortBy || 'recent'}
              onChange={handleSortChange}
              className="pl-12 pr-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-xl appearance-none cursor-pointer"
            >
              <option value="recent" className="bg-[#0E0E12]">Recent First</option>
              <option value="oldest" className="bg-[#0E0E12]">Oldest First</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Extended Filter Panel */}
      {showFilterPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={filters.modelFilter || 'all'}
                  onChange={handleModelChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="all" className="bg-[#0E0E12]">All Models</option>
                  <option value="gpt" className="bg-[#0E0E12]">GPT (OpenAI)</option>
                  <option value="claude" className="bg-[#0E0E12]">Claude (Anthropic)</option>
                  <option value="gemini" className="bg-[#0E0E12]">Gemini (Google)</option>
                  <option value="dall-e" className="bg-[#0E0E12]">DALL-E</option>
                  <option value="midjourney" className="bg-[#0E0E12]">Midjourney</option>
                  <option value="stable" className="bg-[#0E0E12]">Stable Diffusion</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proof Type
                </label>
                <select
                  value={filters.typeFilter || 'all'}
                  onChange={handleTypeChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="all" className="bg-[#0E0E12]">All Types</option>
                  <option value="text" className="bg-[#0E0E12]">Text</option>
                  <option value="image" className="bg-[#0E0E12]">Image</option>
                  <option value="code" className="bg-[#0E0E12]">Code</option>
                </select>
              </div>

              {/* Sort (Mobile) */}
              <div className="md:hidden">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || 'recent'}
                  onChange={handleSortChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="recent" className="bg-[#0E0E12]">Recent First</option>
                  <option value="oldest" className="bg-[#0E0E12]">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-400 text-center pt-2 border-t border-white/10">
              Showing {totalCount} proof{totalCount !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
