"use client";


import { useRouter } from 'next/dist/client/router';
import { useEffect } from 'react';

const PaymentPage = () => {
  const router = useRouter();
  const { transactionId } = router.query;

  useEffect(() => {
    if (!transactionId) return;
    // Add logic to handle transactionId
    console.log(transactionId);
  }, [transactionId]);

  return <div>Payment Page for Transaction: {transactionId}</div>;
};

export default PaymentPage;
