import { getProcessorEvaluator } from '@/entities/processor';
import { Block, Page } from '@/interfaces';
import { JSONSchema7Object } from 'json-schema';

type BlockRunner = {
  ctx: Page['context'];
  isEnd: boolean;
  result?: JSONSchema7Object;
  nextBlockIds: string[];
};

const blockResult: {
  [key in Block['processor']['type']]: (
    ctx: Page['context'],
    block: Block,
    result: JSONSchema7Object,
  ) => BlockRunner;
} = {
  responder: (ctx, _, result) => ({
    ctx,
    result,
    isEnd: true,
    nextBlockIds: [],
  }),
  mutator: (ctx, block, result) => {
    if (block.processor.type !== 'mutator')
      return { ctx, result, isEnd: true, nextBlockIds: [] };
    return {
      ctx: { ...ctx, ...result },
      nextBlockIds: block.processor.next.blockIds,
      isEnd: block.processor.next.blockIds.length === 0,
    };
  },
};

export async function blockRun(
  ctx: Page['context'],
  block: Block,
): Promise<BlockRunner> {
  const result = await getProcessorEvaluator(block.processor.id)(
    ctx,
    block.processor.data,
  );
  return blockResult[block.processor.type](ctx, block, result);
}
