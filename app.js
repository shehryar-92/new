(function () {
  const STORAGE_KEY = 'pollapp:poll';
  const VOTED_KEY = 'pollapp:votedOptionId';
  const THEME_KEY = 'pollapp:theme';

  const createView = document.getElementById('createView');
  const pollView = document.getElementById('pollView');
  const createForm = document.getElementById('createForm');
  const optionsList = document.getElementById('optionsList');
  const addOptionBtn = document.getElementById('addOptionBtn');
  const createError = document.getElementById('createError');
  const pollQuestion = document.getElementById('pollQuestion');
  const voteOptions = document.getElementById('voteOptions');
  const resultsChart = document.getElementById('resultsChart');
  const resultsLegend = document.getElementById('resultsLegend');
  const totalVotesEl = document.getElementById('totalVotes');
  const newPollBtn = document.getElementById('newPollBtn');
  const themeToggle = document.getElementById('themeToggle');

  const MAX_OPTIONS = 6;

  function loadPoll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function savePoll(poll) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(poll));
  }

  function loadVotedOptionId() {
    return localStorage.getItem(VOTED_KEY);
  }

  function saveVotedOptionId(optionId) {
    localStorage.setItem(VOTED_KEY, optionId);
  }

  function clearStoredPoll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VOTED_KEY);
  }

  function showCreateView() {
    createView.hidden = false;
    pollView.hidden = true;
    createError.hidden = true;
    optionsList.querySelectorAll('.option-input').forEach((input, i) => {
      input.value = '';
    });
    document.getElementById('questionInput').value = '';
  }

  function showPollView(poll, votedOptionId) {
    createView.hidden = true;
    pollView.hidden = false;
    pollQuestion.textContent = poll.question;
    renderVoteOptions(poll, votedOptionId);
    renderResults(poll);
  }

  function renderVoteOptions(poll, votedOptionId) {
    voteOptions.innerHTML = '';
    poll.options.forEach(option => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vote-option-btn';
      btn.disabled = Boolean(votedOptionId);
      if (option.id === votedOptionId) {
        btn.classList.add('voted-choice');
      }
      btn.innerHTML = `<span>${escapeHtml(option.text)}</span><span class="check">✓</span>`;
      btn.addEventListener('click', () => handleVote(option.id));
      voteOptions.appendChild(btn);
    });
  }

  function renderResults(poll) {
    const results = window.PollLogic.getResults(poll);
    const total = window.PollLogic.getTotalVotes(poll);

    window.ChartRenderer.drawDonutChart(resultsChart, results);

    resultsLegend.innerHTML = '';
    results.forEach((r, i) => {
      const li = document.createElement('li');
      const swatch = document.createElement('span');
      swatch.className = 'legend-swatch';
      swatch.style.background = window.ChartRenderer.CHART_COLORS[i % window.ChartRenderer.CHART_COLORS.length];
      const text = document.createElement('span');
      text.className = 'legend-text';
      text.textContent = r.text;
      const percent = document.createElement('span');
      percent.className = 'legend-percent';
      percent.textContent = `${r.percent}% (${r.votes})`;
      li.appendChild(swatch);
      li.appendChild(text);
      li.appendChild(percent);
      resultsLegend.appendChild(li);
    });

    totalVotesEl.textContent = total === 1 ? '1 vote' : `${total} votes`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function handleAddOption() {
    const currentCount = optionsList.querySelectorAll('.option-input').length;
    if (currentCount >= MAX_OPTIONS) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-input';
    input.maxLength = 60;
    input.placeholder = `Option ${currentCount + 1}`;
    optionsList.appendChild(input);
    if (optionsList.querySelectorAll('.option-input').length >= MAX_OPTIONS) {
      addOptionBtn.disabled = true;
    }
  }

  function handleCreateSubmit(event) {
    event.preventDefault();
    const question = document.getElementById('questionInput').value;
    const optionInputs = Array.from(optionsList.querySelectorAll('.option-input'));
    const options = optionInputs.map(input => input.value);

    try {
      const poll = window.PollLogic.createPoll(question, options);
      savePoll(poll);
      localStorage.removeItem(VOTED_KEY);
      createError.hidden = true;
      showPollView(poll, null);
    } catch (err) {
      createError.textContent = err.message;
      createError.hidden = false;
    }
  }

  function handleVote(optionId) {
    if (loadVotedOptionId()) return;
    let poll = loadPoll();
    poll = window.PollLogic.addVote(poll, optionId);
    savePoll(poll);
    saveVotedOptionId(optionId);
    showPollView(poll, optionId);
  }

  function handleNewPoll() {
    clearStoredPoll();
    showCreateView();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored || (prefersDark ? 'dark' : 'light'));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    initTheme();
    createForm.addEventListener('submit', handleCreateSubmit);
    addOptionBtn.addEventListener('click', handleAddOption);
    newPollBtn.addEventListener('click', handleNewPoll);
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });

    const existingPoll = loadPoll();
    if (existingPoll) {
      showPollView(existingPoll, loadVotedOptionId());
    } else {
      showCreateView();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

