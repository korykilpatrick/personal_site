import { useState, useCallback } from 'react';

/**
 * A custom hook that provides functionality for multi-selection of items
 * 
 * @param initialSelection - The initial selection of item IDs
 * @returns - Object containing selected IDs array and functions to toggle, set, clear selection
 */
const useMultiSelect = <T>(initialSelection: T[] = []) => {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialSelection);

  /**
   * Toggle an item's selection status
   * @param id - The item ID to toggle
   */
  const toggleSelection = useCallback((id: T) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  }, []);

  /**
   * Check if an item is selected
   * @param id - The item ID to check
   * @returns true if the item is selected
   */
  const isSelected = useCallback((id: T) => {
    return selectedItems.includes(id);
  }, [selectedItems]);
  
  /**
   * Set the selection to a specific set of items
   * @param ids - Array of item IDs to select
   */
  const setSelection = useCallback((ids: T[]) => {
    setSelectedItems(ids);
  }, []);
  
  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    selectedItems,
    toggleSelection,
    isSelected,
    setSelection,
    clearSelection
  };
};

export default useMultiSelect;