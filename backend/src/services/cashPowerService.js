const { pool } = require('../models/databaseInit');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class CashPowerService {
  async saveCashPower(data) {
    try {
      console.log('Saving cash power transaction:', data);
      const connection = await pool.getConnection();
      const [result] = await connection.query('INSERT INTO cash_power SET ?', data);
      console.log('Cash power transaction saved successfully:', result);
      connection.release();
      return result;
    } catch (error) {
      console.error('Error saving cash power transaction:', error);
      throw error;
    }
  }

  async getAllCashPower() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM cash_power ORDER BY date DESC, time DESC');
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching cash power transactions:', error);
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
        await this.saveCashPower(transactionData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  parseMessageContent(content) {
    // Pattern to capture cash power transaction details
    const cashPowerRegex = /TxId:([\w-]+).*?payment\s+of\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*RWF.*?Token:\s*([\d-]+).*?at\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/i;
    const match = content.match(cashPowerRegex);
    
    if (match) {
      const amount = parseFloat(match[2].replace(/,/g, ''));
      return {
        transaction_id: `TXN-${match[1]}`,
        amount: amount,
        token: match[3],
        date: match[4],
        time: match[5],
        message_content: content
      };
    }

    return null;
  }
}

module.exports = new CashPowerService();