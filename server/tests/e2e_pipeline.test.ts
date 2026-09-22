import assert from 'node:assert/strict';

const baseUrl = process.env.TEST_BASE_URL ?? 'http://localhost:5000';
const apiUrl = `${baseUrl.replace(/\/$/u, '')}/api`;

type TranslationResponse = {
  cached: boolean;
  status: string;
  translationId: string;
  videoUrl: string;
  signSequence: string[];
};

async function request(path: string, init?: RequestInit): Promise<{ status: number; body: any; elapsedMs: number }> {
  const started = Date.now();
  const response = await fetch(`${apiUrl}${path}`, { headers: { 'content-type': 'application/json' }, ...init });
  const body = await response.json().catch(() => null);
  return { status: response.status, body, elapsedMs: Date.now() - started };
}

function post(text: string, language = 'en') {
  return request('/translate', { method: 'POST', body: JSON.stringify({ text, language }) });
}

function pass(name: string, detail: string): void { console.log(`PASS  ${name}: ${detail}`); }

async function main(): Promise<void> {
  const first = await post('Good morning');
  assert.equal(first.status, 200);
  assert.equal(first.body.cached, false);
  assert.equal(first.body.status, 'completed');
  assert.equal(typeof first.body.videoUrl, 'string');
  assert.ok(first.body.videoUrl.length > 0);
  assert.deepEqual(first.body.signSequence, ['GOOD', 'MORNING']);
  pass('initial generation', first.body.translationId);

  const exact = await post('Good morning');
  assert.equal(exact.status, 200);
  assert.equal(exact.body.cached, true);
  assert.ok(exact.elapsedMs < 150, `cache took ${exact.elapsedMs}ms`);
  assert.equal(exact.body.translationId, first.body.translationId);
  pass('exact cache hit', `${exact.elapsedMs}ms`);

  const punctuation = await post('  Good Morning!  ');
  assert.equal(punctuation.status, 200);
  assert.equal(punctuation.body.cached, true);
  assert.equal(punctuation.body.translationId, first.body.translationId);
  pass('punctuation normalization', punctuation.body.translationId);

  const distinct = await post('Thank you');
  assert.equal(distinct.status, 200);
  assert.equal(distinct.body.cached, false);
  assert.notEqual(distinct.body.translationId, first.body.translationId);
  pass('distinct phrase', distinct.body.translationId);

  const concurrentPhrase = `Where is the library ${Date.now()}?`;
  const [concurrentA, concurrentB] = await Promise.all([post(concurrentPhrase), post(concurrentPhrase)]);
  assert.equal(concurrentA.status, 200);
  assert.equal(concurrentB.status, 200);
  assert.equal(concurrentA.body.translationId, concurrentB.body.translationId);
  pass('concurrency deduplication', concurrentA.body.translationId);

  const empty = await post('');
  assert.equal(empty.status, 400);
  assert.match(String(empty.body.error?.message ?? empty.body.error), /enter text/i);
  pass('empty input validation', 'HTTP 400');

  const tooLong = await post('x'.repeat(501));
  assert.equal(tooLong.status, 400);
  assert.match(String(tooLong.body.error?.message ?? tooLong.body.error), /500/);
  pass('length validation', 'HTTP 400');

  console.log('All pipeline checks passed.');
}

main().catch((error: unknown) => {
  console.error('Pipeline checks failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
