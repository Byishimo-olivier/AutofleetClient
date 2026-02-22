import { apiClient } from './apiClient';

export interface VehicleDetails {
    make: string;
    model: string;
    year: string;
    features?: string;
}

export const aiService = {
    /**
     * Get AI-powered insights for the dashboard
     */
    async getInsights(dashboardData: any): Promise<string[]> {
        try {
            const response = await apiClient.post('/ai/insights', { data: dashboardData });
            if (response.success) {
                return response.data as string[];
            }
            return ['Unable to generate insights at this time.'];
        } catch (error) {
            console.error('AI Insights Error:', error);
            return ['Error connecting to AI service.'];
        }
    },

    /**
     * Generate a vehicle description using AI
     */
    async generateDescription(details: VehicleDetails): Promise<string> {
        try {
            const response = await apiClient.post('/ai/generate-description', details);
            if (response.success) {
                return (response.data as { description: string }).description;
            }
            return '';
        } catch (error) {
            console.error('AI Description Error:', error);
            return '';
        }
    }
};

