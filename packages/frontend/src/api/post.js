import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

dayjs.locale('ja');

const VERSION = 'v1';
const API_ROOT = `/api/${VERSION}`;

export default {
  normalize(posts) {
    return posts.map(post => {
      post.sourceUrl = `https://twitter.com/${post.postedBy.screenName}/status/${post.idStr}`;
      post.createdAt = dayjs(post.createdAt).format('YYYY-MM-DD');
      post.updatedAt = dayjs(post.updatedAt).format('YYYY-MM-DD');
      return post;
    });
  },
  async fetch(params) {
    if (params.from) params.from = dayjs(params.from).format('YYYY-MM-DD');
    if (params.to) params.to = dayjs(params.to).format('YYYY-MM-DD');
    const { data, request } = await axios.get(`${API_ROOT}/posts`, {
      params,
    });
    return { url: request.responseURL, data: this.normalize(data) };
  },
  async fetchCount(params) {
    if (params.from) params.from = dayjs(params.from).format('YYYY-MM-DD');
    if (params.to) params.to = dayjs(params.to).format('YYYY-MM-DD');
    const { data, request } = await axios.get(`${API_ROOT}/posts/count`, {
      params,
    });
    return { url: request.responseURL, count: data.count };
  },
};
