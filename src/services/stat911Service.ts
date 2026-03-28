import { apiClient } from '../lib/apiClient';

export interface Stat911 {
  // Define stat 911 properties as needed based on SEP requirements
  total_students: number;
  total_groups: number;
  [key: string]: any;
}

export const stat911Service = {
  getStatistics: () => apiClient.get<Stat911>('/v1/statistics/911'),
};
