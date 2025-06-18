import { useState, useEffect, useCallback } from 'react';
import { 
  getUnifiedESGData, 
  getMultipleUnifiedESGData, 
  searchUnifiedESGCompanies,
  getUnifiedESGDataBySector,
  UnifiedESGData 
} from '../services/esgDataService';

interface UseESGDataState {
  data: UnifiedESGData | null;
  loading: boolean;
  error: string | null;
}

interface UseESGDataReturn extends UseESGDataState {
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch ESG data for a single company
 * @param ticker - Company ticker symbol
 * @returns UseESGDataReturn - ESG data with loading and error states
 */
export function useESGData(ticker: string): UseESGDataReturn {
  const [state, setState] = useState<UseESGDataState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!ticker) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getUnifiedESGData(ticker);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch ESG data' 
      });
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

interface UseMultipleESGDataState {
  data: UnifiedESGData[];
  loading: boolean;
  error: string | null;
}

interface UseMultipleESGDataReturn extends UseMultipleESGDataState {
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch ESG data for multiple companies
 * @param tickers - Array of company ticker symbols
 * @returns UseMultipleESGDataReturn - ESG data array with loading and error states
 */
export function useMultipleESGData(tickers: string[]): UseMultipleESGDataReturn {
  const [state, setState] = useState<UseMultipleESGDataState>({
    data: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!tickers.length) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getMultipleUnifiedESGData(tickers);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: [], 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch ESG data' 
      });
    }
  }, [tickers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

interface UseESGSearchState {
  data: UnifiedESGData[];
  loading: boolean;
  error: string | null;
}

interface UseESGSearchReturn extends UseESGSearchState {
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

/**
 * Hook to search companies with ESG data
 * @returns UseESGSearchReturn - Search functionality with loading and error states
 */
export function useESGSearch(): UseESGSearchReturn {
  const [state, setState] = useState<UseESGSearchState>({
    data: [],
    loading: false,
    error: null,
  });

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await searchUnifiedESGCompanies(query);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: [], 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to search companies' 
      });
    }
  }, []);

  const clearSearch = useCallback(() => {
    setState({ data: [], loading: false, error: null });
  }, []);

  return { ...state, search, clearSearch };
}

interface UseESGSectorDataState {
  data: UnifiedESGData[];
  loading: boolean;
  error: string | null;
}

interface UseESGSectorDataReturn extends UseESGSectorDataState {
  fetchBySector: (sector: string) => Promise<void>;
  clearData: () => void;
}

/**
 * Hook to fetch ESG data for companies in a specific sector
 * @returns UseESGSectorDataReturn - Sector data with loading and error states
 */
export function useESGSectorData(): UseESGSectorDataReturn {
  const [state, setState] = useState<UseESGSectorDataState>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchBySector = useCallback(async (sector: string) => {
    if (!sector.trim()) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getUnifiedESGDataBySector(sector);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: [], 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch sector data' 
      });
    }
  }, []);

  const clearData = useCallback(() => {
    setState({ data: [], loading: false, error: null });
  }, []);

  return { ...state, fetchBySector, clearData };
} 