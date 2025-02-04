const { pool } = require('../models/databaseInit');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class TransferToMobileNumberService {
  async saveTransfer(data) {
    try {
      console.log('Saving transfer to mobile number transaction:', data);
      const connection = await pool.getConnection();
      const [result] = await connection.query('INSERT INTO transfer_to_mobile_number SET ?', data);
      console.log('Transfer to mobile number transaction saved successfully:', result);
      connection.release();
      return result;
    } catch (error) {
      console.error('Error saving transfer to mobile number transaction:', error);
      throw error;
    }
  }

  async getAllTransfers() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM transfer_to_mobile_number ORDER BY date DESC, time DESC');
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
      const transactionData = this.parseMessageContent(message.body);
      if (transactionData) {
        await this.saveTransfer(transactionData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  parseMessageContent(content) {
    // Pattern to capture transfer details to mobile number
    const mobileNumberTransferRegex = /(\d{1,})\s*RWF\s*transferred\s*to\s*([\w\s]+)\s*\((\d+)\)\s*from\s*\d+\s*at\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}:\d{2})/;


    const match = content.match(mobileNumberTransferRegex);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
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
}

module.exports = new TransferToMobileNumberService();