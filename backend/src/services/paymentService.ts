/**
 * Mock Payment Service simulating JazzCash/EasyPaisa behavior.
 * In production, this would use axios to call the actual PG API.
 */
export const paymentService = {

    async initiatePayment(amount: number, orderId: string, mobileNumber: string) {
        console.log(`[MockPayment] Initiating payment of PKR ${amount} for Order ${orderId} to ${mobileNumber}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return a mock success response
        return {
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            status: 'PENDING', // JazzCash usually starts as pending/initiated
            message: 'Payment initiated. Please authorize on your mobile.'
        };
    },

    async verifyPayment(transactionId: string) {
        console.log(`[MockPayment] Verifying transaction ${transactionId}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Always return success for dev
        return {
            success: true,
            status: 'PAID',
            amount: 4000
        };
    }
};
