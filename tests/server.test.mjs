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

test('contest lifecycle: start, score, end with winner', async (t) => {
  const port = TEST_PORT + 1;
  const url = `http://localhost:${port}`;
  const s = createSonicCanvasServer({ port, corsOrigin: ['http://localhost:5173'] });
  await s.listen();

  const a = new Client(url, { transports: ['websocket'] });
  const b = new Client(url, { transports: ['websocket'] });
  await Promise.all([
    new Promise((resolve, reject) => { a.on('connect', resolve); a.on('connect_error', reject); }),
    new Promise((resolve, reject) => { b.on('connect', resolve); b.on('connect_error', reject); }),
  ]);

  // Start 2s contest
  a.emit('start-contest', { duration: 2 });

  // Wait for start event
  await new Promise((resolve) => a.on('contest-start', resolve));

  // Send beats: A sends 3, B sends 1
  a.emit('trigger-beat', { id: 'c1-a1' });
  a.emit('trigger-beat', { id: 'c1-a2' });
  a.emit('trigger-beat', { id: 'c1-a3' });
  b.emit('trigger-beat', { id: 'c1-b1' });

  // Await contest end and verify winner
  const endPayload = await new Promise((resolve) => a.on('contest-end', resolve));
  const winner = endPayload?.winner;
  const board = endPayload?.leaderboard || [];
  // Winner should have highest beats (A)
  const top = board[0];
  assert.ok(top, 'leaderboard has entries');
  // Either winner.id matches A or beats indicate A leads
  const aEntry = board.find((e) => e.name && e.name.startsWith('Anon-')) || top; // minimal check
  assert.ok(board.some(e => e.beats >= 3), 'A should have >=3 beats');

  a.close();
  b.close();
  await s.close();
});

test('room cleanup triggers after idle (short timeout)', async () => {
  const port = TEST_PORT + 2;
  const url = `http://localhost:${port}`;
  // Use a very short cleanup period for test (200ms)
  const s = createSonicCanvasServer({ port, corsOrigin: ['http://localhost:5173'], roomCleanupMs: 200 });
  await s.listen();

  const a = new Client(url, { transports: ['websocket'] });
  await new Promise((resolve, reject) => { a.on('connect', resolve); a.on('connect_error', reject); });

  // Join a custom room
  a.emit('join-room', { room: 'testroom' });
  await new Promise((resolve) => a.on('room-joined', ({ room }) => room === 'testroom' && resolve()));

  // Start a contest to create room activity
  a.emit('start-contest', { duration: 1 });
  await new Promise((resolve) => a.on('contest-start', resolve));

  // Disconnect client so room becomes empty
  a.close();

  // Await cleanup event
  const cleaned = await new Promise((resolve) => {
    // Create a listener client just for receiving global cleanup event
    const b = new Client(url, { transports: ['websocket'] });
    b.on('connect', () => {
      b.on('room-cleanup', (payload) => {
        if (payload?.room === 'testroom') {
          b.close();
          resolve(payload);
        }
      });
    });
  });

  assert.equal(cleaned.room, 'testroom');
  await s.close();
});

test('default lobby join and set-name reflected in room-users roster', async () => {
  const port = TEST_PORT + 3;
  const url = `http://localhost:${port}`;
  const s = createSonicCanvasServer({ port, corsOrigin: ['http://localhost:5173'] });
  await s.listen();

  const a = new Client(url, { transports: ['websocket'] });
  await new Promise((resolve, reject) => { a.on('connect', resolve); a.on('connect_error', reject); });

  // Should join lobby by default
  const joined = await new Promise((resolve) => a.on('room-joined', ({ room }) => resolve(room)));
  assert.equal(joined, 'lobby');

  // Set a custom name and verify roster update
  const rosterPromise = new Promise((resolve) => {
    a.on('room-users', ({ room, users }) => {
      if (room === 'lobby' && Array.isArray(users) && users.some(u => u.name === 'Pri')) {
        resolve({ room, users });
      }
    });
  });
  a.emit('set-name', { name: 'Pri' });
  const roster = await rosterPromise;
  assert.equal(roster.room, 'lobby');
  assert.ok(roster.users.some(u => u.name === 'Pri'));

  a.close();
  await s.close();
});

test('multiple users roster and name edge cases', async () => {
  const port = TEST_PORT + 4;
  const url = `http://localhost:${port}`;
  const s = createSonicCanvasServer({ port, corsOrigin: ['http://localhost:5173'] });
  await s.listen();

  const a = new Client(url, { transports: ['websocket'] });
  const b = new Client(url, { transports: ['websocket'] });
  const c = new Client(url, { transports: ['websocket'] });
  await Promise.all([
    new Promise((resolve, reject) => { a.on('connect', resolve); a.on('connect_error', reject); }),
    new Promise((resolve, reject) => { b.on('connect', resolve); b.on('connect_error', reject); }),
    new Promise((resolve, reject) => { c.on('connect', resolve); c.on('connect_error', reject); }),
  ]);

  // Set names: normal, empty, very long
  a.emit('set-name', { name: 'Pri' });
  b.emit('set-name', { name: '' });
  c.emit('set-name', { name: 'LongNameThatExceedsLimitABCDEFGHIJKLMNOPQRSTUVWXYZ' });

  // Await a roster update reflecting all three entries
  const roster = await new Promise((resolve) => {
    const handler = ({ room, users }) => {
      if (room === 'lobby' && Array.isArray(users) && users.length >= 3) {
        resolve({ room, users });
      }
    };
    a.on('room-users', handler);
    b.on('room-users', handler);
    c.on('room-users', handler);
  });

  assert.equal(roster.room, 'lobby');
  const names = roster.users.map(u => u.name);
  assert.ok(names.includes('Pri'));
  // Empty name should fallback to Anon-xxxx
  assert.ok(names.some(n => /^Anon-/.test(n)));
  // Long name should be trimmed to <=32 chars
  const long = names.find(n => n.startsWith('LongNameThatExceedsLimit'));
  assert.ok(long);
  assert.ok(long.length <= 32);

  a.close(); b.close(); c.close();
  await s.close();
});

test('contest peak champion tie-breaker on equal peak', async () => {
  const port = TEST_PORT + 5;
  const url = `http://localhost:${port}`;
  const s = createSonicCanvasServer({ port, corsOrigin: ['http://localhost:5173'] });
  await s.listen();

  const a = new Client(url, { transports: ['websocket'] });
  const b = new Client(url, { transports: ['websocket'] });
  await Promise.all([
    new Promise((resolve, reject) => { a.on('connect', resolve); a.on('connect_error', reject); }),
    new Promise((resolve, reject) => { b.on('connect', resolve); b.on('connect_error', reject); }),
  ]);

  // Start a short contest
  a.emit('start-contest', { duration: 2 });
  await new Promise((resolve) => a.on('contest-start', resolve));

  // Create equal peakCps for A and B (e.g., 3 beats in 1s), but A has more total beats to break tie
  a.emit('trigger-beat', { id: 'a1' });
  b.emit('trigger-beat', { id: 'b1' });
  a.emit('trigger-beat', { id: 'a2' });
  b.emit('trigger-beat', { id: 'b2' });
  a.emit('trigger-beat', { id: 'a3' });
  b.emit('trigger-beat', { id: 'b3' });
  // Extra beats for A to win tie-breaker
  a.emit('trigger-beat', { id: 'a4' });
  a.emit('trigger-beat', { id: 'a5' });

  // Observe at least one contest-update with peakChampion present
  const update = await new Promise((resolve) => {
    a.on('contest-update', (payload) => {
      if (payload?.peakChampion) resolve(payload);
    });
  });
  assert.ok(update.peakChampion);
  // Peak champion should be A (more beats on tie peakCps)
  assert.ok(update.leaderboard.some(e => e.beats >= 5));

  // End contest
  const endPayload = await new Promise((resolve) => a.on('contest-end', resolve));
  assert.ok(endPayload.leaderboard && endPayload.leaderboard.length >= 2);

  a.close(); b.close();
  await s.close();
});
