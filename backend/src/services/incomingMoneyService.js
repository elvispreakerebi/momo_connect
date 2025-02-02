const { pool } = require('../models/databaseInit');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class IncomingMoneyService {
  async saveIncomingMoney(data) {
    try {
      console.log('Saving incoming money transaction:', data);
      const connection = await pool.getConnection();
      const [result] = await connection.query('INSERT INTO incoming_money SET ?', data);
      console.log('Incoming money transaction saved successfully:', result);
      connection.release();
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
    // Updated pattern to be more flexible and catch more incoming money message formats
    const incomingMoneyPatterns = [
      // Pattern for messages with transaction ID and timestamp
      /You have received ([\d,]+) RWF from (.*?) \(\*+\d{3}\) on your mobile money account at (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*?Financial Transaction Id: (\d+)/i,
      // Pattern for simpler format messages
      /You have received ([\d,]+) RWF from (.*?) \(\*+\d{3}\)/i
    ];

    for (const pattern of incomingMoneyPatterns) {
      const match = content.match(pattern);
      if (match) {
        // For messages with full details (timestamp and transaction ID)
        if (match.length === 5) {
          const amount = parseFloat(match[1].replace(/,/g, ''));
          const sender = match[2];
          const dateTime = new Date(match[3]);
          const transactionId = match[4];

          return {
            transaction_id: transactionId,
            amount,
            sender,
            date: dateTime.toISOString().split('T')[0],
            time: dateTime.toTimeString().split(' ')[0],
            message_content: content
          };
        }
        // For simpler format messages
        else {
          const amount = parseFloat(match[1].replace(/,/g, ''));
          const sender = match[2];
          const now = new Date();

          return {
            transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            amount,
            sender,
            date: now.toISOString().split('T')[0],
            time: now.toTimeString().split(' ')[0],
            message_content: content
          };
        }
      }
    }

    return null;
  }
}

module.exports = new IncomingMoneyService();