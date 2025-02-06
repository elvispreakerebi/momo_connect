const { pool } = require('../models/databaseInit');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class PaymentToCodeHoldersService {
async savePayment(data) {
    try {
    console.log('Saving payment to code holders transaction:', data);
    const connection = await pool.getConnection();
    const [result] = await connection.query('INSERT INTO payment_to_code_holders SET ?', data);
    console.log('Payment to code holders transaction saved successfully:', result);
    connection.release();
    return result;
    } catch (error) {
    console.error('Error saving payment to code holders transaction:', error);
    throw error;
    }
}

async getAllPayments() {
    try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM payment_to_code_holders ORDER BY date DESC, time DESC');
    connection.release();
    return rows;
    } catch (error) {
    console.error('Error fetching payment to code holders transactions:', error);
    throw error;
    }
}

async getPaymentById(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM payment_to_code_holders WHERE id = ?', [id]);
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
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
        await this.savePayment(transactionData);
    }
    } catch (error) {
    console.error('Error processing message:', error);
    throw error;
    }
}

parseMessageContent(content) {
    // Pattern to capture payment details for code holders
    const codeHolderPaymentRegex = /TxId:\s*(\d+).*?Your payment of\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*RWF to\s*([\w\s]+)\s+(\d+).*?at\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2}:\d{2})/i;

    const match = content.match(codeHolderPaymentRegex);
    if (match) {
        const amount = parseFloat(match[2].replace(/,/g, ''));
        return {
            transaction_id: `TXN-${match[1]}`,
            amount: amount,
            recipient_name: match[3].trim(),
            recipient_code: match[4],
            date: match[5],
            time: match[6],
            message_content: content
        };
    }

    return null;
}
}

module.exports = new PaymentToCodeHoldersService();
