import axios from 'axios';
import CONFIG from '@src/constants/config';

const HEADERS = {'Content-Type': 'application/json'};
const TIMEOUT = 1000;

export default axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: TIMEOUT,
  headers: HEADERS
});

/**
 * Document: https://github.com/axios/axios#instance-methodsaxios#request(config)
    axios#get(url[, config])
    axios#delete(url[, config])
    axios#head(url[, config])
    axios#options(url[, config])
    axios#post(url[, data[, config]])
    axios#put(url[, data[, config]])
    axios#patch(url[, data[, config]])
    axios#getUri([config])
 */

