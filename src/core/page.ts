import { Block, Page } from '@/interfaces';
import { JSONSchema7Object } from 'json-schema';
import { blockRun } from './block';

function buildQueue(page: Page): Block[] {
  const entryBlock = page.blocks[page.entryBlock];
  if (!entryBlock) return [];
  return [entryBlock];
}
export async function pageRun(
  page: Page,
  context: Page['context'],
): Promise<{ data: JSONSchema7Object }> {
  const queue = buildQueue(page);
  let ctx = { ...context };
  let result = {};
  while (queue.length > 0) {
    const block = queue[0];
    const next = await blockRun(ctx, block);
    ctx = next.ctx;
    if (next.isEnd)
      return {
        data: next.result || {},
      };
    const nextBlocks = next.nextBlockIds
      .map((id) => page.blocks[id])
      .filter((v) => v);
    queue.push(...nextBlocks);
    queue.shift();
  }
  return { data: result };
}
