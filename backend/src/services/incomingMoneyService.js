const { createIncomingMoney } = require('../models/incomingMoneyModel');
const { pool } = require('../models/databaseInit');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class IncomingMoneyService {
  async saveIncomingMoney(data) {
    try {
      console.log('Saving incoming money transaction:', data);
      const result = await createIncomingMoney(data);
      console.log('Incoming money transaction saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving incoming money transaction:', error);
      throw error;
    }
  }

  async getAllIncomingMoney() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM incoming_money ORDER BY date DESC, time DESC');
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching incoming money transactions:', error);
      throw error;
    }
  }

  async getIncomingMoneyById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM incoming_money WHERE id = ?', [id]);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching incoming money by ID:', error);
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
        await this.saveIncomingMoney(transactionData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  parseMessageContent(content) {
    // Pattern to capture incoming money transaction details
    const incomingMoneyRegex = /received\s*(\d+)\s*RWF\s*from\s*([\w\s]+)\s*\(.*?\)\s*on your mobile money account at\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}:\d{2}).*?Financial Transaction Id:\s*(\d+)/;

    const match = content.match(incomingMoneyRegex);
    if (match) {
      const amount = parseFloat(match[1]);
      return {
        transaction_id: `${match[5]}`,
        amount: amount,
        sender: match[2].trim(),
        date: match[3],
        time: match[4],
        message_content: content
      };
    }

    return null;
  }
}

module.exports = new IncomingMoneyService();