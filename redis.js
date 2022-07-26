const { createClient } = require('redis');

const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();
async function get(key) {
    console.log(await redis.ttl(key));
}

get('8fd4e771-2678-4992-9fe2-cb55f51212d5-votes');

redis.set(
    '8fd4e771-2678-4992-9fe2-cb55f51212d5-votes',
    '["0","0","0"]',
    'EX',
    600,
    (err) => {
        //cache for 10mins
        if (err) {
            return res.status(500).send('Server error');
        }

        //other operations will go here
        //probably respond back to the request
    }
);
debugger;