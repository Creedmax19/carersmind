// Configuration
const API_BASE_URL = '/api/v1';
// Payment handling with Stripe
const STRIPE_PUBLIC_KEY = window.STRIPE_PUBLISHABLE_KEY || 'pk_test_51RuCo4AbgyHA5XcoyQjQ054R8jfbfuSELZacUuh2cTQgrBbZxZdTMXSAazIy8dpxcIGB987BSsPQ33woGtTXIpYE00gIMx8N8J'; // Uses global config or fallback
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// DOM Elements
const paymentForm = document.getElementById('payment-form');
const paymentStatus = document.getElementById('payment-status');
const amountInput = document.getElementById('amount');
const accountHolderNameInput = document.getElementById('accountHolderName');
const sortCodeInput = document.getElementById('sortCode');
const accountNumberInput = document.getElementById('accountNumber');
const referenceInput = document.getElementById('reference');
const submitButton = paymentForm?.querySelector('button[type="submit"]');

// Format sort code as user types (e.g., 123456 -> 12-34-56)
function formatSortCode(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.substring(0, 6);
    
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 2 === 0) {
            formattedValue += '-';
        }
        formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
}

// Format amount (currency)
function formatAmount(e) {
    // Remove any non-digit characters except decimal point
    let value = e.target.value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    e.target.value = value;
}

// Handle form submission
async function handlePayment(e) {
    e.preventDefault();
    
    if (!paymentForm) return;
    
    const amount = parseFloat(amountInput?.value);
    const accountHolderName = accountHolderNameInput?.value;
    const sortCode = sortCodeInput?.value;
    const accountNumber = accountNumberInput?.value;
    
    // Basic validation
    if (!amount || isNaN(amount) || amount <= 0) {
        showError('Please enter a valid amount greater than 0');
        return;
    }
    
    if (!accountHolderName) {
        showError('Please enter the account holder name');
        return;
    }
    
    if (!sortCode || sortCode.replace(/\D/g, '').length !== 6) {
        showError('Please enter a valid sort code (6 digits)');
        return;
    }
    
    if (!accountNumber || accountNumber.length < 8) {
        showError('Please enter a valid account number (at least 8 digits)');
        return;
    }
    
    // Disable submit button
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    }
    
    try {
        // Create checkout session
        const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'gbp',
                metadata: {
                    bankAccount: {
                        accountHolderName: accountHolderName,
                        sortCode: sortCode,
                        accountNumber: accountNumber,
                        reference: referenceInput?.value || ''
                    }
                },
                successUrl: `${window.location.origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/payment.html`
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create payment session');
        }
        
        const { url } = await response.json();
        
        // Redirect to Stripe Checkout
        window.location.href = url;
        
    } catch (error) {
        console.error('Payment error:', error);
        showError(error.message || 'An error occurred while processing your payment');
        
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Pay Now';
        }
    }
}

// Show error message
function showError(message) {
    if (!paymentStatus) return;
    
    paymentStatus.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// Initialize the payment form
function initPaymentForm() {
    if (!paymentForm) return;
    
    // Add event listeners
    paymentForm.addEventListener('submit', handlePayment);
    
    if (sortCodeInput) {
        sortCodeInput.addEventListener('input', formatSortCode);
    }
    
    if (accountNumberInput) {
        accountNumberInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    if (amountInput) {
        amountInput.addEventListener('input', formatAmount);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPaymentForm();
    
    // Check for success message in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'true' && paymentStatus) {
        paymentStatus.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Payment successful! Thank you for your support.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
});

async function handlePayment(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const paymentStatus = document.getElementById('payment-status');
    
    // Disable submit button to prevent multiple submissions
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    
    try {
        // Get form data
        const formData = {
            amount: parseFloat(form.amount.value),
            currency: form.currency.value,
            paymentMethod: 'card',
            bankAccount: {
                accountHolderName: form.accountHolderName.value,
                sortCode: form.sortCode.value,
                accountNumber: form.accountNumber.value,
                reference: form.reference?.value || ''
            }
        };
        
        // Create payment intent on the server
        const response = await fetch('/api/v1/payments/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                amount: formData.amount,
                currency: formData.currency
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Something went wrong');
        }
        
        const { clientSecret } = await response.json();
        
        // Confirm the payment with Stripe Elements
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: formData.bankAccount.accountHolderName,
                },
            },
            receipt_email: formData.email || '',
            save_payment_method: true
        });
        
        if (stripeError) {
            throw stripeError;
        }
        
        // If payment was successful, save the payment with bank details
        if (paymentIntent.status === 'succeeded') {
            const saveResponse = await fetch('/api/v1/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    stripePaymentId: paymentIntent.id
                })
            });
            
            if (!saveResponse.ok) {
                const error = await saveResponse.json();
                throw new Error(error.message || 'Payment succeeded but failed to save details');
            }
            
            // Show success message
            paymentStatus.innerHTML = `
                <div class="alert alert-success">
                    <h4>Payment Successful!</h4>
                    <p>Your payment of ${formData.currency.toUpperCase()} ${formData.amount.toFixed(2)} has been processed successfully.</p>
                    <p>Reference: ${paymentIntent.id}</p>
                </div>
            `;
            
            // Reset form
            form.reset();
        }
    } catch (error) {
        console.error('Payment error:', error);
        paymentStatus.innerHTML = `
            <div class="alert alert-danger">
                <h4>Payment Failed</h4>
                <p>${error.message || 'An error occurred while processing your payment. Please try again.'}</p>
            </div>
        `;
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Make Payment';
    }
}

// Function to load user's payment history
async function loadPaymentHistory() {
    try {
        const response = await fetch('/api/v1/payments', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load payment history');
        }
        
        const { data: payments } = await response.json();
        const historyContainer = document.getElementById('payment-history');
        
        if (payments.length === 0) {
            historyContainer.innerHTML = '<p>No payment history found.</p>';
            return;
        }
        
        const historyHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => `
                            <tr>
                                <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
                                <td>${payment.currency.toUpperCase()} ${payment.amount.toFixed(2)}</td>
                                <td><span class="badge bg-${payment.status === 'completed' ? 'success' : 'warning'}">
                                    ${payment.status}
                                </span></td>
                                <td>${payment.stripePaymentId || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        historyContainer.innerHTML = historyHTML;
    } catch (error) {
        console.error('Error loading payment history:', error);
        const historyContainer = document.getElementById('payment-history');
        historyContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load payment history. Please try again later.
            </div>
        `;
    }
}

// Load payment history when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('payment-history')) {
        loadPaymentHistory();
    }
});
