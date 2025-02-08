const pool = require('../config/database');
const { createTransferToMobileNumber } = require('../models/transferToMobileNumberModel');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class TransferToMobileNumberService {
  async saveTransfer(data) {
    try {
      console.log('Saving transfer to mobile number transaction:', data);
      const result = await createTransferToMobileNumber(data);
      console.log('Transfer to mobile number transaction saved successfully:', result);
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Transaction with this ID already exists');
      }
      console.error('Error saving transfer to mobile number transaction:', error);
      throw error;
    }
  }

  async getAllTransfers() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM transfer_to_mobile_number ORDER BY date DESC, time DESC');
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching transfer to mobile number transactions:', error);
      throw error;
    }
  }

  async processXMLFile(filePath) {
    try {
      const absolutePath = path.join(__dirname, '..', filePath);
      const xmlData = await fs.readFile(absolutePath, 'utf-8');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xmlData);
      const messages = result.smses.sms || [];

      for (const message of messages) {
        await this.processMessage(message.$);
      }
    } catch (error) {
      console.error('Error processing XML file:', error);
      throw error;
    }
  }

  async processMessage(message) {
    try {
      if (!message.body) {
        console.log('Skipping message - no body content');
        return null;
      }

      const messageContent = message.body;
      let transaction = null;

      // Try GNF format first
      const gnfTransaction = this.parseGNFMessage(messageContent, message.date);
      if (gnfTransaction) {
        transaction = gnfTransaction;
      } else {
        // Try RWF format if GNF format doesn't match
        const rwfTransaction = this.parseMessageContent(messageContent);
        if (rwfTransaction) {
          transaction = rwfTransaction;
        }
      }

      if (!transaction) {
        console.log('Skipping message - not a valid transfer transaction');
        return null;
      }

      return await this.saveTransfer(transaction);
    } catch (error) {
      console.error('Error processing transfer message:', error);
      throw error;
    }
  }

  parseGNFMessage(messageContent, dateTimestamp) {
    try {
      if (!messageContent.includes('Transfer to')) {
        return null;
      }

      const transactionMatch = messageContent.match(/ID:\s*(\w+)/);
      const amountMatch = messageContent.match(/([\d,]+\.?\d*)\s*GNF/);
      const recipientMatch = messageContent.match(/to\s+([^(]+)\s*\(/);
      const phoneMatch = messageContent.match(/\((\+?\d+)\)/);
      const dateTimeMatch = dateTimestamp && new Date(parseInt(dateTimestamp));

      if (!transactionMatch || !amountMatch || !recipientMatch || !phoneMatch || !dateTimeMatch) {
        return null;
      }

      return {
        amount: parseFloat(amountMatch[1].replace(',', '')),
        recipient_name: recipientMatch[1].trim(),
        phone_number: phoneMatch[1],
        date: dateTimeMatch.toISOString().split('T')[0],
        time: dateTimeMatch.toTimeString().split(' ')[0],
        message_content: messageContent
      };
    } catch (error) {
      console.error('Error parsing GNF message:', error);
      return null;
    }
  }

  parseMessageContent(content) {
    const mobileNumberTransferRegex = /(\d{1,})\s*RWF\s*transferred\s*to\s*([\w\s]+)\s*\((\d+)\)\s*from\s*\d+\s*at\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}:\d{2})/;

    const match = content.match(mobileNumberTransferRegex);
    if (match) {
      const amount = parseFloat(match[1]);
      
      return {
        amount: amount,
        recipient_name: match[2].trim(),
        phone_number: match[3],
        date: match[4],
        time: match[5],
        message_content: content
      };
    }

    return null;
  }

  async getTransferById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM transfer_to_mobile_number WHERE id = ?', [id]);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching transfer by ID:', error);
      throw error;
    }
  }
}

module.exports = new TransferToMobileNumberService();