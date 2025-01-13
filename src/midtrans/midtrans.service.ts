import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';
import { Transaction } from '../entities/transactions.entity';

@Injectable()
export class MidtransService {
  private readonly snap: any;
  private readonly core: any;

  constructor(private configService: ConfigService) {
    const commonConfig = {
      isProduction: this.configService.get('midtrans.isProduction'),
      serverKey: this.configService.get('midtrans.serverKey'),
      clientKey: this.configService.get('midtrans.clientKey'),
    };

    this.snap = new midtransClient.Snap(commonConfig);
    this.core = new midtransClient.CoreApi(commonConfig);
  }

  async createPaymentLink(transaction: Transaction): Promise<string> {
    const parameter = {
      transaction_details: {
        order_id: transaction.midtransOrderId,
        gross_amount: Number(transaction.amount),
      },
      item_details: [
        {
          id: transaction.appointment.id,
          price: Number(transaction.amount),
          quantity: 1,
          name: `Consultation with Dr. ${transaction.appointment.doctor.user.name}`,
        },
      ],
      customer_details: {
        first_name: transaction.appointment.patient.user.name,
        email: transaction.appointment.patient.user.email,
      },
      callbacks: {
        finish: `${this.configService.get('midtrans.redirectUrl')}/payment/finish`,
        error: `${this.configService.get('midtrans.redirectUrl')}/payment/error`,
        pending: `${this.configService.get('midtrans.redirectUrl')}/payment/pending`,
      },
      expiry: {
        unit: 'hours',
        duration: this.configService.get('app.paymentExpiryHours'),
      },
    };

    try {
      const response = await this.snap.createTransaction(parameter);
      return response.redirect_url;
    } catch (error) {
      console.error('Midtrans create payment link error:', error);
      throw error;
    }
  }

  async processRefund(transaction: Transaction) {
    const parameter = {
      refund_key: `refund-${transaction.id}-${Date.now()}`,
      amount: Number(transaction.amount),
      reason: 'Appointment cancelled or doctor no-show',
    };

    try {
      const response = await this.core.refund(
        transaction.midtransTransactionId,
        parameter,
      );
      return response;
    } catch (error) {
      console.error('Midtrans refund error:', error);
      throw error;
    }
  }

  async verifyPayment(midtransOrderId: string) {
    try {
      const response = await this.core.transaction.status(midtransOrderId);
      return response;
    } catch (error) {
      console.error('Midtrans verify payment error:', error);
      throw error;
    }
  }
}