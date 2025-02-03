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
    // Detailed pattern to capture all transaction details for payments
    const paymentDetailsRegex = /(?:You have paid|paid|transferred).*?(\d+(?:,\d{3})*(?:\.\d{2})?).*?(?:to\s+([\w\s]+).*?)?at\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}).*?(?:Transaction Id:\s*(\d+))?/i;
    // Simpler pattern to capture just the amount
    const paymentRegex = /(?:You have paid|paid|transferred).*?(\d+(?:,\d{3})*(?:\.\d{2})?)/i;

    // Try the detailed pattern first
    const detailedMatch = content.match(paymentDetailsRegex);
    if (detailedMatch) {
    const amount = parseFloat(detailedMatch[1].replace(/,/g, ''));
    return {
        transaction_id: detailedMatch[5] ? `TXN-${detailedMatch[5]}` : `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        recipient_name: detailedMatch[2] ? detailedMatch[2].trim() : 'Unknown',
        date: detailedMatch[3],
        time: detailedMatch[4],
        message_content: content
    };
    }

    // Fallback to the simpler pattern
    const simpleMatch = content.match(paymentRegex);
    if (simpleMatch) {
    const amount = parseFloat(simpleMatch[1].replace(/,/g, ''));
    const now = new Date();
    return {
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        recipient_name: 'Unknown',
        recipient_code: 'Unknown',
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        message_content: content
    };
    }

    return null;
}
}

module.exports = new PaymentToCodeHoldersService();
