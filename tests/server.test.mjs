import test from 'node:test';
import assert from 'node:assert/strict';
import { io as Client } from 'socket.io-client';
import { createSonicCanvasServer } from '../serverFactory.js';

const TEST_PORT = 3011;
const TEST_URL = `http://localhost:${TEST_PORT}`;

let server;

test('setup server', async () => {
  server = createSonicCanvasServer({ port: TEST_PORT, corsOrigin: ['http://localhost:5173', 'http://localhost:5174'] });
  await server.listen();
});

test('user-count increments on connect', async (t) => {
  const client = new Client(TEST_URL, { transports: ['websocket'] });

  await new Promise((resolve, reject) => {
    client.on('connect', resolve);
    client.on('connect_error', reject);
  });

  const countPromise = new Promise((resolve) => {
    client.on('user-count', (c) => resolve(c));
  });
  client.emit('get-user-count');
  const count = await countPromise;

  assert.ok(count >= 1, `expected user count >= 1, got ${count}`);
  client.close();
});

test('receive-beat is broadcast with userName', async () => {
  const clientA = new Client(TEST_URL, { transports: ['websocket'] });
  const clientB = new Client(TEST_URL, { transports: ['websocket'] });

  await Promise.all([
    new Promise((resolve, reject) => { clientA.on('connect', resolve); clientA.on('connect_error', reject); }),
    new Promise((resolve, reject) => { clientB.on('connect', resolve); clientB.on('connect_error', reject); }),
  ]);

  const payload = { id: 'beat-1', x: 0.2, y: 0.8, color: '#FF00FF', note: 'A4' };

  const receivedOnA = new Promise((resolve) => clientA.on('receive-beat', (p) => p.id === payload.id && resolve(p)));
  const receivedOnB = new Promise((resolve) => clientB.on('receive-beat', (p) => p.id === payload.id && resolve(p)));

  clientA.emit('trigger-beat', payload);

  const [pa, pb] = await Promise.all([receivedOnA, receivedOnB]);
  // Server enriches payload with userName
  assert.equal(pa.id, payload.id);
  assert.equal(pb.id, payload.id);
  assert.ok(typeof pa.userName === 'string' && pa.userName.length > 0);
  assert.ok(typeof pb.userName === 'string' && pb.userName.length > 0);

  clientA.close();
  clientB.close();
});

test('teardown server', async () => {
  await server.close();
});
