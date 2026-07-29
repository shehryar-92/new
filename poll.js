function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function validatePollInput(question, options) {
  const errors = [];
  const trimmedQuestion = (question || '').trim();
  const trimmedOptions = (options || []).map(o => (o || '').trim());

  if (!trimmedQuestion) {
    errors.push('Question cannot be empty.');
  }

  const cleanOptions = trimmedOptions.filter(o => o.length > 0);

  if (cleanOptions.length < 2) {
    errors.push('Provide at least 2 options.');
  }
  if (cleanOptions.length > 6) {
    errors.push('Provide at most 6 options.');
  }

  const seen = new Set();
  for (const opt of cleanOptions) {
    const key = opt.toLowerCase();
    if (seen.has(key)) {
      errors.push(`Duplicate option: "${opt}"`);
    }
    seen.add(key);
  }

  return { valid: errors.length === 0, errors, cleanOptions };
}

function createPoll(question, options) {
  const { valid, errors, cleanOptions } = validatePollInput(question, options);
  if (!valid) {
    throw new Error(errors.join(' '));
  }
  return {
    id: generateId(),
    question: question.trim(),
    options: cleanOptions.map(text => ({ id: generateId(), text, votes: 0 })),
    createdAt: Date.now(),
  };
}

function addVote(poll, optionId) {
  const optionExists = poll.options.some(o => o.id === optionId);
  if (!optionExists) {
    throw new Error('Invalid option id.');
  }
  return {
    ...poll,
    options: poll.options.map(o =>
      o.id === optionId ? { ...o, votes: o.votes + 1 } : o
    ),
  };
}

function getTotalVotes(poll) {
  return poll.options.reduce((sum, o) => sum + o.votes, 0);
}

function getResults(poll) {
  const total = getTotalVotes(poll);
  return poll.options.map(o => ({
    id: o.id,
    text: o.text,
    votes: o.votes,
    percent: total === 0 ? 0 : Math.round((o.votes / total) * 1000) / 10,
  }));
}

const PollLogic = {
  generateId,
  validatePollInput,
  createPoll,
  addVote,
  getTotalVotes,
  getResults,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PollLogic;
}
if (typeof window !== 'undefined') {
  window.PollLogic = PollLogic;
}

