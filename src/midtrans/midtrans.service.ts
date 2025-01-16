import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';
import { Transaction } from '../entities/transactions.entity';

@Injectable()
export class MidtransService {
  private readonly snap: midtransClient.Snap;
  private readonly core: midtransClient.CoreApi;
  private readonly logger = new Logger(MidtransService.name);

  constructor(private configService: ConfigService) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY');
    const isProduction = this.configService.get<boolean>('MIDTRANS_IS_PRODUCTION');

    if (!serverKey || !clientKey) {
      throw new Error('Midtrans configuration is incomplete');
    }

    // Initialize without extra headers
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey,
      clientKey
    });

    this.core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey,
      clientKey
    });

    // Simple auth test
    // this.testAuth();
  }

  // private async testAuth() {
  //   try {
  //     const testTransaction = {
  //       transaction_details: {
  //         order_id: `test-${Date.now()}`,
  //         gross_amount: 10000
  //       }
  //     };
      
  //     const result = await this.snap.createTransaction(testTransaction);
  //     this.logger.log('Midtrans auth successful');
  //     return result;
  //   } catch (error) {
  //     this.logger.error('Midtrans auth failed:', error.message);
  //     throw error;
  //   }
  // }

  async createPaymentLink(transaction: Transaction): Promise<string> {
    try {
      // Validate transaction data
      if (!transaction.appointment?.doctor?.user?.name || 
          !transaction.appointment?.patient?.user?.name ||
          !transaction.appointment?.patient?.user?.email) {
        throw new HttpException('Incomplete transaction data', HttpStatus.BAD_REQUEST);
      }
  
      // Create consistent order ID format
      const orderId = `ORDER-${transaction.id}`; // Simpler, consistent format
      
      // Update the transaction with the order ID
      transaction.midtransOrderId = orderId;
      
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: Math.round(Number(transaction.amount)),
        },
        item_details: [
          {
            id: transaction.appointment.id,
            price: Math.round(Number(transaction.amount)),
            quantity: 1,
            name: `Consultation with Dr. ${transaction.appointment.doctor.user.name}`,
          },
        ],
        customer_details: {
          first_name: transaction.appointment.patient.user.name,
          email: transaction.appointment.patient.user.email,
        },
        enabled_payments: ["credit_card", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va"],
        credit_card: {
          secure: true
        }
      };
  
      this.logger.debug('Creating Midtrans transaction:', {
        orderId,
        amount: parameter.transaction_details.gross_amount,
      });
  
      const response = await this.snap.createTransaction(parameter);
  
      if (!response || !response.redirect_url) {
        throw new Error('Invalid response from Midtrans');
      }
  
      return response.redirect_url;
    } catch (error) {
      this.logger.error(`Failed to create payment link:`, {
        transactionId: transaction.id,
        error: error.message,
      });
      throw error;
    }
  }


  async processRefund(transaction: Transaction) {
    try {
      if (!transaction.midtransTransactionId) {
        throw new HttpException(
          'Transaction ID not found',
          HttpStatus.BAD_REQUEST
        );
      }

      const parameter = {
        refund_key: `refund-${transaction.id}-${Date.now()}`,
        amount: Math.round(Number(transaction.amount)),
        reason: 'Appointment cancelled or doctor no-show',
      };

      const response = await this.core.refund(
        transaction.midtransTransactionId,
        parameter,
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Failed to process refund for transaction ${transaction.id}: ${error.message}`,
        error.stack
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to process refund',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyPayment(midtransOrderId: string) {
    try {
      if (!midtransOrderId) {
        throw new HttpException(
          'Order ID is required',
          HttpStatus.BAD_REQUEST
        );
      }

      const response = await this.core.transaction.status(midtransOrderId);
      
      // Validate response
      if (!response || !response.transaction_status) {
        throw new Error('Invalid response from Midtrans');
      }

      return response;
    } catch (error) {
      this.logger.error(
        `Failed to verify payment for order ${midtransOrderId}: ${error.message}`,
        error.stack
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to verify payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}