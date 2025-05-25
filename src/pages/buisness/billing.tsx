import { useLocation } from 'react-router-dom';

export default function BillingPage() {
  const location = useLocation();
  const { billData } = location.state || {};

  if (!billData) {
    return <div>No billing data found. Please go back and select an order.</div>;
  }
  
}