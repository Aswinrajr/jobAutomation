const cron = require('node-cron');
const User = require('../models/User');
const { processAutomationForUser } = require('./automationService');

const initCron = () => {
    // Schedule for 10:00 AM every day
    // Pattern: minute hour day-of-month month day-of-week
    cron.schedule('0 10 * * *', async () => {
        console.log('--- STARTING SCHEDULED DAILY AUTOMATION (10:00 AM) ---');

        try {
            const users = await User.find({});
            console.log(`Found ${users.length} users to process.`);

            for (const user of users) {
                console.log(`Processing automation for: ${user.name}`);
                const result = await processAutomationForUser(user._id, user.name);

                if (result.error) {
                    console.log(`Skipped ${user.name}: ${result.error}`);
                } else {
                    console.log(`Completed for ${user.name}: Applied to ${result.applied} jobs.`);
                }
            }

            console.log('--- DAILY AUTOMATION CYCLE COMPLETE ---');
        } catch (error) {
            console.error('CRON ERROR:', error);
        }
    });

    console.log('Cron Scheduler Initialized: Daily Automation at 10:00 AM.');
};

module.exports = { initCron };
