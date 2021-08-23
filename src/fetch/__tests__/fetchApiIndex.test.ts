jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

import fetchApiIndex from '../fetchApiIndex';

test('POC fetch mock test', async () => {
  fetchMock.mock('https://live-contentacms.pantheonsite.io/api', {
    status: 200,
    body: {
      data: [],
      links: {
        blocks: 'https://live-contentacms.pantheonsite.io/api//blocks',
      },
    },
  });
  expect(
    await fetchApiIndex('https://live-contentacms.pantheonsite.io/api')
  ).toEqual({
    blocks: 'https://live-contentacms.pantheonsite.io/api//blocks',
  });
});
