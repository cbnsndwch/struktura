/**
 * Test script for Telegram bot notifications
 * Usage: tsx scripts/test-telegram-bot.ts
 *
 * Requires environment variables:
 * - TELEGRAM_BOT_TOKEN: Your Telegram bot token from @BotFather
 * - TELEGRAM_CHAT_ID: The chat ID where messages should be sent
 */
import { config } from 'dotenv';

config({ path: './scripts/.env' });

interface TelegramResponse {
    ok: boolean;
    result?: {
        message_id: number;
        date: number;
    };
    error_code?: number;
    description?: string;
}

interface TelegramMessage {
    chat_id: string;
    text: string;
    parse_mode: 'Markdown';
    disable_web_page_preview: boolean;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('   TELEGRAM_BOT_TOKEN - Get from @BotFather');
    console.error('   TELEGRAM_CHAT_ID - Your chat or group ID');
    console.error('');
    console.error('Example usage:');
    console.error(
        '   TELEGRAM_BOT_TOKEN=your_token TELEGRAM_CHAT_ID=your_chat_id tsx scripts/test-telegram-bot.ts'
    );
    process.exit(1);
}

// Test message content with better formatting
const testMessage = `🧪 **Test Notification**

📦 **Repository:** \`Struktura\`
🌿 **Branch:** \`main\`
👤 **Author:** Test User
📝 **Message:** Testing Telegram bot integration

✅ This is a test message from your Telegram bot!

🕐 **Time:** ${new Date().toISOString()}`;

const messageData: TelegramMessage = {
    chat_id: CHAT_ID,
    text: testMessage,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
};

console.log('🚀 Sending test message to Telegram...');
console.log(`📡 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
console.log(`💬 Chat ID: ${CHAT_ID}`);
console.log('');

async function sendTelegramMessage() {
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            }
        );

        const data: TelegramResponse = await response.json();

        if (data.ok && data.result) {
            console.log('✅ Test message sent successfully!');
            console.log(`📱 Message ID: ${data.result.message_id}`);
            console.log(
                `📅 Sent at: ${new Date(data.result.date * 1000).toISOString()}`
            );
        } else {
            console.error('❌ Failed to send message:');
            console.error(`   Error Code: ${data.error_code || 'unknown'}`);
            console.error(
                `   Description: ${data.description || 'Unknown error'}`
            );

            if (data.error_code === 400) {
                console.error('');
                console.error('💡 Common fixes for error 400:');
                console.error(
                    '   - Check if CHAT_ID is correct (should be a number or @username)'
                );
                console.error(
                    '   - Make sure the bot is added to the group/channel'
                );
                console.error(
                    '   - Verify the bot has permission to send messages'
                );
            } else if (data.error_code === 401) {
                console.error('');
                console.error('💡 Error 401 means invalid bot token');
                console.error('   - Check your TELEGRAM_BOT_TOKEN is correct');
                console.error('   - Get a new token from @BotFather if needed');
            }
            process.exit(1);
        }
    } catch (error) {
        console.error(
            '❌ Network error:',
            error instanceof Error ? error.message : 'Unknown error'
        );
        process.exit(1);
    }
}

sendTelegramMessage();
