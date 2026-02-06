const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');

// Multi-source Scraper (Legal RSS feeds only)
exports.scrapeJobs = async (resumeSkills = []) => {
    const feeds = [
        { name: 'WeWorkRemotely', url: 'https://weworkremotely.com/remote-jobs.rss' },
        { name: 'RemoteOK', url: 'https://remoteok.com/remote-jobs.rss' }
    ];

    let allScrapedJobs = [];

    for (const feed of feeds) {
        try {
            const { data } = await axios.get(feed.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' } // Needed for some RSS feeds
            });
            const $ = cheerio.load(data, { xmlMode: true });

            $('item').each((i, el) => {
                if (i > 25) return;

                const fullTitle = $(el).find('title').text() || '';
                let title = '', company = '';

                if (feed.name === 'WeWorkRemotely') {
                    [title, company] = fullTitle.split(' at ');
                } else if (feed.name === 'RemoteOK') {
                    // RemoteOK title format: "Job Title is hiring a Role at Company" or similar, need careful splitting
                    // Usually: "Title - Company"
                    [title, company] = fullTitle.split(' - ');
                }

                if (!title) title = fullTitle;
                if (!company) company = 'Confidential';

                const link = $(el).find('link').text()?.trim();
                const description = $(el).find('description').text()?.replace(/<[^>]*>?/gm, '').trim() || '';

                if (link && title) {
                    allScrapedJobs.push({
                        title: title.trim(),
                        company: company.trim(),
                        location: 'Remote',
                        applyUrl: link,
                        source: feed.name,
                        description: description.substring(0, 1500),
                        scrapedAt: new Date()
                    });
                }
            });
            console.log(`Scraped ${feed.name}: Found ${allScrapedJobs.length} total so far.`);
        } catch (error) {
            console.error(`Error scraping ${feed.name}:`, error.message);
        }
    }

    // Deduplicate by URL
    const uniqueJobs = Array.from(new Map(allScrapedJobs.map(item => [item['applyUrl'], item])).values());
    return uniqueJobs;
};
