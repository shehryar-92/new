const test = require('node:test');
const assert = require('node:assert');
const {
  validatePollInput,
  createPoll,
  addVote,
  getTotalVotes,
  getResults,
} = require('./poll.js');

test('validatePollInput rejects empty question', () => {
  const result = validatePollInput('', ['A', 'B']);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('Question')));
});

test('validatePollInput rejects fewer than 2 options', () => {
  const result = validatePollInput('Q?', ['A']);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('at least 2')));
});

test('validatePollInput rejects more than 6 options', () => {
  const result = validatePollInput('Q?', ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('at most 6')));
});

test('validatePollInput ignores blank options when counting', () => {
  const result = validatePollInput('Q?', ['A', '', 'B', '  ']);
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.cleanOptions, ['A', 'B']);
});

test('validatePollInput rejects duplicate options (case-insensitive)', () => {
  const result = validatePollInput('Q?', ['Red', 'red', 'Blue']);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('Duplicate')));
});

test('createPoll builds a poll with zero votes on each option', () => {
  const poll = createPoll('Favorite color?', ['Red', 'Blue', 'Green']);
  assert.strictEqual(poll.question, 'Favorite color?');
  assert.strictEqual(poll.options.length, 3);
  assert.ok(poll.options.every(o => o.votes === 0));
  assert.ok(poll.id);
  assert.ok(poll.options.every(o => o.id));
});

test('createPoll throws on invalid input', () => {
  assert.throws(() => createPoll('', ['A', 'B']));
  assert.throws(() => createPoll('Q?', ['A']));
});

test('addVote increments only the targeted option', () => {
  const poll = createPoll('Q?', ['A', 'B']);
  const optionId = poll.options[0].id;
  const updated = addVote(poll, optionId);
  assert.strictEqual(updated.options[0].votes, 1);
  assert.strictEqual(updated.options[1].votes, 0);
});

test('addVote does not mutate the original poll', () => {
  const poll = createPoll('Q?', ['A', 'B']);
  const optionId = poll.options[0].id;
  addVote(poll, optionId);
  assert.strictEqual(poll.options[0].votes, 0);
});

test('addVote throws on unknown option id', () => {
  const poll = createPoll('Q?', ['A', 'B']);
  assert.throws(() => addVote(poll, 'not-a-real-id'));
});

test('getTotalVotes sums votes across options', () => {
  let poll = createPoll('Q?', ['A', 'B', 'C']);
  poll = addVote(poll, poll.options[0].id);
  poll = addVote(poll, poll.options[0].id);
  poll = addVote(poll, poll.options[1].id);
  assert.strictEqual(getTotalVotes(poll), 3);
});

test('getResults computes correct percentages', () => {
  let poll = createPoll('Q?', ['A', 'B']);
  poll = addVote(poll, poll.options[0].id);
  poll = addVote(poll, poll.options[0].id);
  poll = addVote(poll, poll.options[1].id);
  const results = getResults(poll);
  assert.strictEqual(results[0].votes, 2);
  assert.strictEqual(results[0].percent, 66.7);
  assert.strictEqual(results[1].votes, 1);
  assert.strictEqual(results[1].percent, 33.3);
});

test('getResults returns 0 percent for all options when no votes cast', () => {
  const poll = createPoll('Q?', ['A', 'B']);
  const results = getResults(poll);
  assert.ok(results.every(r => r.percent === 0));
});

