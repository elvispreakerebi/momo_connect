const { createAirtime } = require('../models/airtimeModel');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class AirtimeService {
  async saveAirtime(data) {
    try {
      console.log('Saving airtime transaction:', data);
      const result = await createAirtime(data);
      console.log('Airtime transaction saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving airtime transaction:', error);
      throw error;
    }
  }

  async getAllAirtime() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM airtime ORDER BY date DESC, time DESC');
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching airtime transactions:', error);
      throw error;
    }
  }

  async getAirtimeById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM airtime WHERE id = ?', [id]);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching airtime transaction by ID:', error);
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
        await this.saveAirtime(transactionData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  parseMessageContent(content) {
    // Pattern to capture airtime transaction details
    const airtimeRegex = /\*162\*TxId:(\d+)\*S\*Your payment of\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*RWF to Airtime with token.*?at\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/i;
    const match = content.match(airtimeRegex);
    if (match) {
      const amount = parseFloat(match[2].replace(/,/g, ''));
      return {
        transaction_id: `${match[1]}`,
        amount: amount,
        date: match[3],
        time: match[4],
        message_content: content
      };
    }

    return null;
  }
}

module.exports = new AirtimeService();