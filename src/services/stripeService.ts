import { apiClient } from '../lib/apiClient';

export interface PlanData {
  id: number;
  name: string;
  price: number;
  duration: string;
  features: string[];
  is_recommended: boolean;
  stripe_price_id: string | null;
}

export const planService = {
  getPlans: async () => {
    const response = await apiClient.get<PlanData[]>('/v1/plans');
    return response;
  }
};

export const stripeService = {
  createCheckoutSession: async (priceId: string, planName: string) => {
    try {
      const response = await apiClient.post<{ url: string }>('/v1/stripe/checkout', {
        price_id: priceId,
        plan_name: planName
      });
      return response.url; // Regresa la URL de la página segura de Stripe
    } catch (error) {
      console.error('Error al generar sesión de Stripe', error);
      throw error;
    }
  }
};
