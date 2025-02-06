const { pool } = require('../models/databaseInit');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class WithdrawalFromAgentService {
  async saveWithdrawal(data) {
    try {
      console.log('Saving withdrawal transaction:', data);
      const connection = await pool.getConnection();
      const [result] = await connection.query('INSERT INTO withdrawal_from_agent SET ?', data);
      console.log('Withdrawal transaction saved successfully:', result);
      connection.release();
      return result;
    } catch (error) {
      console.error('Error saving withdrawal transaction:', error);
      throw error;
    }
  }

  async getAllWithdrawals() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM withdrawal_from_agent ORDER BY date DESC, time DESC');
      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching withdrawal transactions:', error);
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
        await this.saveWithdrawal(transactionData);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  parseMessageContent(content) {
    // Pattern to capture withdrawal transaction details
    const withdrawalRegex = /via agent:\s+Agent\s+([\w\s]+)\s+\((\d{10,12})\),\s+withdrawn\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*RWF from your mobile money account.*?at\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/i;
    const match = content.match(withdrawalRegex);
    if (match) {
      const amount = parseFloat(match[3].replace(/,/g, ''));
      return {
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        agent_name: match[1],
        agent_number: match[2],
        date: match[4],
        time: match[5],
        message_content: content
      };
    }
    return null;
  }

  async getWithdrawalById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM withdrawal_from_agent WHERE id = ?', [id]);
      connection.release();
      return rows[0];
    } catch (error) {
      console.error('Error fetching withdrawal transaction by ID:', error);
      throw error;
    }
  }
}

module.exports = new WithdrawalFromAgentService();