import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, Loader2, Info } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const plans = [
  { id: 'basic', name: 'Basic Plan', amount: 50000, description: 'Up to 5 vehicles', features: ['Listing up to 5 vehicles', 'Basic analytics', 'Standard support'] },
  { id: 'premium', name: 'Premium Plan', amount: 100000, description: 'Unlimited vehicles', features: ['Unlimited vehicle listings', 'Advanced analytics', 'Priority support', 'Featured listings'] },
];

const SubscriptionPlansPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');

  const handleSubscribe = async () => {
    if (paymentMethod === 'mobile' && !phone) {
      setError('Phone number is required for mobile payment');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<any>('/subscriptions/subscribe', {
        planId: selectedPlan,
        phoneNumber: phone,
        paymentMethod
      });

      if (response.success) {
        if (paymentMethod === 'card' && response.data.paymentLink) {
          // Redirect to Flutterwave Hosted Payment Page
          window.location.href = response.data.paymentLink;
          return;
        }

        setSuccess('Subscription payment initiated! Please check your phone to confirm.');
        setTimeout(() => navigate('/dashboard'), 5000);
      } else {
        setError(response.message || 'Subscription failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-500 mt-2">Choose the best plan for your fleet management needs.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <Info className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all relative ${
              selectedPlan === plan.id 
              ? 'border-blue-500 bg-blue-50 bg-opacity-30 shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-blue-600 font-mono">{plan.amount.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">RWF / month</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-md">
        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Payment Method
        </h4>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setPaymentMethod('mobile')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              paymentMethod === 'mobile' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500'
            }`}
          >
            <span className="font-bold text-sm">Mobile Money</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-500'
            }`}
          >
            <span className="font-bold text-sm">Debit/Credit Card</span>
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethod === 'mobile' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Money Number
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="078XXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">You will be redirected to Flutterwave secure payment page to complete your transaction using your Debit or Credit card.</p>
              <div className="flex items-center gap-2">
                <img src="https://brand.mastercard.com/content/dam/mccom/brandcenter/thumbnails/mastercard_vrt_pos_92px_2x.png" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4" alt="Visa" />
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubscribe}
            disabled={loading || !!success}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl transition-all"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
            ) : (
              `Pay ${plans.find(p => p.id === selectedPlan)?.amount.toLocaleString()} RWF`
            )}
          </Button>
          <p className="text-[10px] text-gray-500 text-center">
            {paymentMethod === 'mobile' 
              ? 'You will receive a push notification on your phone to authorize the payment.'
              : 'Secure payment processed by Flutterwave.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
