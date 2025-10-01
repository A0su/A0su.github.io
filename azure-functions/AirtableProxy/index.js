module.exports = async function (context, req) {
    const fetch = require('node-fetch');
    const AIRTABLE_ACCESS_TOKEN = process.env.AIRTABLE_ACCESS_TOKEN;
    const BASE_ID = req.query.baseId || req.body.baseId;
    const TABLE_NAME = req.query.tableName || req.body.tableName;
    const method = req.method;
    const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

    if (!AIRTABLE_ACCESS_TOKEN || !BASE_ID || !TABLE_NAME) {
        context.res = {
            status: 400,
            body: 'Missing required parameters or access token.'
        };
        return;
    }

    let options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    if (method === 'POST' || method === 'PATCH') {
        options.body = JSON.stringify(req.body.data);
    }

    let url = airtableUrl;
    if (method === 'GET' && req.query.queryString) {
        url += `?${req.query.queryString}`;
    }
    if (method === 'PATCH' && req.query.recordId) {
        url += `/${req.query.recordId}`;
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        context.res = {
            status: response.status,
            body: data
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: 'Error connecting to Airtable.'
        };
    }
};
