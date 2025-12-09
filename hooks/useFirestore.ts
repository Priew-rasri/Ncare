import { useState, useEffect, useCallback } from 'react';
import { QueryConstraint } from 'firebase/firestore';
import * as firestoreService from '../services/firestoreService';

/**
 * Hook for real-time collection data
 */
export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = firestoreService.subscribe<T>(
      collectionName,
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error, setData };
}

/**
 * Hook for single document data
 */
export function useDocument<T>(collectionName: string, id: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = firestoreService.subscribeToDoc<T>(
      collectionName,
      id,
      (newData) => {
        setData(newData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, id]);

  return { data, loading, error };
}

/**
 * Hook for CRUD operations
 */
export function useFirestoreCRUD<T>(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const add = useCallback(async (data: Omit<T, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const id = await firestoreService.add<T>(collectionName, data);
      setLoading(false);
      return id;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreService.update<T>(collectionName, id, data);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreService.remove(collectionName, id);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await firestoreService.getById<T>(collectionName, id);
      setLoading(false);
      return doc;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [collectionName]);

  return { add, update, remove, getById, loading, error };
}

/**
 * Hook for batch operations
 */
export function useBatchWrite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeBatch = useCallback(async (operations: Parameters<typeof firestoreService.batchWrite>[0]) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreService.batchWrite(operations);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, []);

  return { executeBatch, loading, error };
}

export default {
  useCollection,
  useDocument,
  useFirestoreCRUD,
  useBatchWrite
};
