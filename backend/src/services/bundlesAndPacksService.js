const { pool } = require('../models/databaseInit');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const path = require('path');

class BundlesAndPacksService {
async saveBundlesAndPacks(data) {
    try {
    console.log('Saving bundles and packs transaction:', data);
    const connection = await pool.getConnection();
    const [result] = await connection.query('INSERT INTO bundles_and_packs SET ?', data);
    console.log('Bundles and packs transaction saved successfully:', result);
    connection.release();
    return result;
    } catch (error) {
    console.error('Error saving bundles and packs transaction:', error);
    throw error;
    }
}

async getAllBundlesAndPacks() {
    try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
        'SELECT *, CONCAT(date, " ", time) as transaction_datetime FROM bundles_and_packs ORDER BY date DESC, time DESC'
    );
    connection.release();
    return rows;
    } catch (error) {
    console.error('Error fetching bundles and packs transactions:', error);
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
        await this.saveBundlesAndPacks(transactionData);
    }
    } catch (error) {
    console.error('Error processing message:', error);
    throw error;
    }
}

parseMessageContent(content) {
    // Pattern to capture bundles and packs transaction details
    const bundlesRegex = /\*162\*TxId:(\d+)\*S\*Your payment of\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*RWF to Bundles and Packs with token.*?at\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/i;
    const match = content.match(bundlesRegex);
    if (match) {
    const amount = parseFloat(match[2].replace(/,/g, ''));
    return {
        transaction_id: `TXN-${match[1]}`,
        amount: amount,
        date: match[3],
        time: match[4],
        message_content: content
    };
    }
    return null;
}
}

module.exports = new BundlesAndPacksService();