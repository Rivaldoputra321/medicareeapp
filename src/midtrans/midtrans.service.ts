import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';
import { PaymentStatus, Transaction } from '../entities/transactions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MidtransService {
  private readonly snap: midtransClient.Snap;
  private readonly core: midtransClient.CoreApi;
  private readonly logger = new Logger(MidtransService.name);

  constructor(private configService: ConfigService,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {
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
    this.testAuth();
  }

  private async testAuth() {
    try {
      const testTransaction = {
        transaction_details: {
          order_id: `test-${Date.now()}`,
          gross_amount: 10000
        }
      };
      
      const result = await this.snap.createTransaction(testTransaction);
      this.logger.log('Midtrans auth successful');
      return result;
    } catch (error) {
      this.logger.error('Midtrans auth failed:', error.message);
      throw error;
    }
  }

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
      transaction.payment_link = response.redirect_url; 
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
      if (!transaction || !transaction.midtransOrderId) {
        throw new HttpException(
          'Transaction or Order ID not found',
          HttpStatus.BAD_REQUEST
        );
      }
  
      this.logger.debug('Processing refund for transaction:', {
        transactionId: transaction.id,
        orderId: transaction.midtransOrderId
      });
  
      // Get transaction status from Midtrans using order ID
      const statusResponse = await this.core.transaction.status(transaction.midtransOrderId);
      
      if (!statusResponse || !statusResponse.transaction_id) {
        throw new HttpException(
          'Midtrans transaction not found',
          HttpStatus.NOT_FOUND
        );
      }
  
      const parameter = {
        refund_key: `refund-${transaction.id}-${Date.now()}`,
        amount: Math.round(Number(transaction.amount)),
        reason: 'Appointment cancelled or doctor no-show',
      };
  
      this.logger.debug('Refund parameters:', parameter);
  
      // Fixed: Use this.core.transaction.refund instead of this.core.refund
      const response = await this.core.transaction.refund(
        statusResponse.transaction_id,
        parameter
      );
  
      this.logger.debug('Refund response:', response);
  
      // Update transaction status after successful refund
      transaction.status = PaymentStatus.REFUND;
      await this.transactionRepository.save(transaction);
  
      return response;
    } catch (error) {
      this.logger.error('Failed to process refund:', {
        transactionId: transaction.id,
        error: error.message,
        stack: error.stack
      });
  
      if (error instanceof HttpException) {
        throw error;
      }
  
      throw new HttpException(
        'Failed to process refund',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyPayment(orderId: string) {
    try {
      if (!orderId) {
        throw new HttpException(
          'Order ID is required',
          HttpStatus.BAD_REQUEST
        );
      }

      this.logger.debug('Verifying payment for order:', orderId);

      const response = await this.core.transaction.status(orderId);
      
      if (!response || !response.transaction_status) {
        throw new HttpException(
          'Invalid response from Midtrans',
          HttpStatus.BAD_REQUEST
        );
      }

      this.logger.debug('Payment verification response:', response);

      // Find and update the transaction with Midtrans transaction ID
      if (response.transaction_id) {
        const transaction = await this.transactionRepository.findOne({
          where: { midtransOrderId: orderId }
        });

        if (transaction) {
          transaction.midtransTransactionId = response.transaction_id;
          
          // Update transaction status based on Midtrans response
          switch (response.transaction_status) {
            case 'capture':
            case 'settlement':
              transaction.status = PaymentStatus.SETTLEMENT;
              transaction.paidAt = new Date();
              break;
            case 'deny':
              transaction.status = PaymentStatus.DENY;
              break;
            case 'cancel':
              transaction.status = PaymentStatus.CANCEL;
              break;
            case 'expire':
              transaction.status = PaymentStatus.EXPIRE;
              break;
            case 'pending':
              transaction.status = PaymentStatus.PENDING;
              break;
            case 'refund':
              transaction.status = PaymentStatus.REFUND;
              break;
          }

          await this.transactionRepository.save(transaction);
        }
      }

      return response;
    } catch (error) {
      this.logger.error('Failed to verify payment:', {
        orderId,
        error: error.message,
        stack: error.stack
      });

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