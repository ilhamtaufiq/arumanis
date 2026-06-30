import api, { ApiError } from '@/lib/api-client';

export type ContactInquiryPayload = {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    website?: string;
};

export type ContactInquiryResult = {
    status: 'success' | 'error';
    message: string;
};

export async function submitContactInquiry(
    payload: ContactInquiryPayload,
): Promise<ContactInquiryResult> {
    try {
        return await api.post<ContactInquiryResult>('/public/contact', payload);
    } catch (error) {
        if (error instanceof ApiError) {
            if (error.status === 429) {
                throw new ApiError('RATE_LIMIT', 429, error.data);
            }
            throw error;
        }
        throw error;
    }
}