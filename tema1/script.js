const async = require('async');
const axios = require('axios');

const url = 'http://localhost:3000';

const task = () => { axios.get(url) };
const parallelRequestsCnt = 3;
const batchesCnt = 3;
const tasks = Array(parallelRequestsCnt).fill(task);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function runRequests() {
    for( let i = 1; i <= batchesCnt; ++i ){
        async.parallel(tasks);
        await sleep(2000);
    }
}

runRequests()