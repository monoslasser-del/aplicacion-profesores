import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import * as Icons from 'lucide-react';

export interface FormativeField {
  id: number;
  name: string;
  slug: string;
  color_hex: string;
  bg_color_hex: string;
  icon: string;
  description: string | null;
  is_active: boolean;
}

export function useFormativeFields() {
  const [fields, setFields] = useState<FormativeField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<FormativeField[]>('/v1/formative-fields');
      const data = res as unknown as FormativeField[];
      setFields(data);
    } catch (err) {
      console.error('Error fetching formative fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.BookOpen;
    return IconComponent;
  };

  return { fields, loading, getIcon, fetchFields };
}
