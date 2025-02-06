const { createBankDeposit } = require('../models/bankDepositModel');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class BankDepositService {
  async saveBankDeposit(data) {
    try {
      console.log('Saving bank deposit transaction:', data);
      const result = await createBankDeposit(data);
      console.log('Bank deposit transaction saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving bank deposit transaction:', error);
      throw error;
    }
  }

  async getAllBankDeposits() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM bank_deposit ORDER BY date DESC, time DESC');
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching bank deposit transactions:', error);
      throw error;
    }
  }

  async getBankDepositById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM bank_deposit WHERE id = ?', [id]);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching bank deposit by ID:', error);
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
        await this.saveBankDeposit(transactionData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  parseMessageContent(content) {
    // Pattern to capture bank deposit transaction details
    const bankDepositRegex = /A bank deposit of\s*(\d+)\s*RWF.*?at\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}:\d{2})/;

    const match = content.match(bankDepositRegex);
    if (match) {
      const amount = parseFloat(match[1]);
      return {
        amount: amount,
        date: match[2],
        time: match[3],
        message_content: content
      };
    }

    return null;
  }
}

module.exports = new BankDepositService();