'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReservation,
  listReservations,
  ListReservationsParams,
  releaseReservation,
} from './api';

export const reservationKeys = {
  list: (params: ListReservationsParams) => ['reservations', 'list', params] as const,
};

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['reservations'] });
  qc.invalidateQueries({ queryKey: ['inventory'] });
}

export function useReservations(params: ListReservationsParams = {}) {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: () => listReservations(params),
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useReleaseReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: releaseReservation,
    onSuccess: () => invalidateAll(qc),
  });
}
