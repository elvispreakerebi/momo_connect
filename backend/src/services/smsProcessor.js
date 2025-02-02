const fs = require('fs').promises;
const path = require('path');
const xml2js = require('xml2js');
const { pool } = require('../models/databaseInit');
const incomingMoneyService = require('./incomingMoneyService');

class SMSProcessor {
  constructor() {
    this.parser = new xml2js.Parser();
  }

  async processXMLFile(filePath) {
    try {
      const absolutePath = path.join(__dirname, '..', filePath);
      const xmlData = await fs.readFile(absolutePath, 'utf-8');
      const result = await this.parser.parseStringPromise(xmlData);
      const messages = result.smses.sms || [];

      for (const message of messages) {
        await this.processMessage(message.$);
      }
    } catch (error) {
      await this.logError('XML_PROCESSING_ERROR', error.message, '');
      throw error;
    }
  }

  async processMessage(message) {
    try {
      console.log('Processing message:', message);
      const transactionData = this.parseMessageContent(message.body);
      console.log('Parsed transaction data:', transactionData);
      if (transactionData) {
        await this.saveTransaction(transactionData);
      } else {
        console.log('No transaction data found in message:', message.body);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      await this.logError('MESSAGE_PROCESSING_ERROR', error.message, JSON.stringify(message));
    }
  }

  parseMessageContent(content) {
    // Common patterns for different transaction types
    const patterns = {
      incomingMoney: /You have received ([\d,]+) RWF from (.*?) \(\*+\d{3}\)/i,
      payment: /Your payment of ([\d,]+) RWF to (.*?) (?:with token|has been)/i,
      transfer: /\*(?:165|162)\*S\*([\d,]+) RWF transferred to (.*?) \((250\d{9})\)/i,
      cashPower: /Your payment of ([\d,]+) RWF to MTN Cash Power with token ([\d-]+)/i,
      merchantPayment: /TxId: \d+\. Your payment of ([\d,]+) RWF to (.*?) (?:has been completed|\d{6})/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        return this.extractTransactionData(type, match, content);
      }
    }

    return null;
  }

  async extractTransactionData(type, match, rawContent) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    
    const baseData = {
      transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transaction_type: type,
      amount,
      timestamp: new Date(),
      status: 'COMPLETED',
      description: rawContent
    };

    switch (type) {
      case 'incomingMoney':
        const data = {
          ...baseData,
          sender: match[2]
        };
        // Save to incoming_money table
        await this.saveIncomingMoney({
          transaction_id: data.transaction_id,
          amount: data.amount,
          sender: data.sender,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0],
          message_content: rawContent
        });
        return data;
      case 'payment':
        return {
          ...baseData,
          recipient: match[2]
        };
      case 'transfer':
        return {
          ...baseData,
          recipient: match[2],
          phone_number: match[3]
        };
      case 'cashPower':
        return {
          ...baseData,
          recipient: 'MTN Cash Power',
          token: match[2]
        };
      case 'merchantPayment':
        return {
          ...baseData,
          recipient: match[2]
        };
      default:
        return null;
    }
  }

  async saveTransaction(data) {
    try {
      console.log('Attempting to save transaction:', data);
      const connection = await pool.getConnection();
      
      // Ensure timestamp is in correct MySQL format
      if (data.timestamp instanceof Date) {
        data.timestamp = data.timestamp.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      // Ensure numeric fields are properly formatted
      if (typeof data.amount === 'number') {
        data.amount = data.amount.toFixed(2);
      }

      // Resolve the data if it's a Promise
      const resolvedData = data instanceof Promise ? await data : data;
      
      const [result] = await connection.query('INSERT INTO transactions SET ?', [resolvedData]);
      console.log('Transaction saved successfully:', result);
      connection.release();
      return result;
    } catch (error) {
      console.error('Error saving transaction:', error);
      console.error('Transaction data:', data);
      await this.logError('DATABASE_ERROR', error.message, JSON.stringify(data));
      throw error;
    }
  }

  async saveIncomingMoney(data) {
    try {
      return await incomingMoneyService.saveIncomingMoney(data);
    } catch (error) {
      await this.logError('DATABASE_ERROR', error.message, JSON.stringify(data));
      throw error;
    }
  }

  async logError(errorType, message, rawData) {
    try {
      const connection = await pool.getConnection();
      await connection.query('INSERT INTO error_logs SET ?', {
        error_type: errorType,
        message,
        raw_data: rawData
      });
      connection.release();
    } catch (error) {
      console.error('Error logging to database:', error);
    }
  }
}

module.exports = SMSProcessor;