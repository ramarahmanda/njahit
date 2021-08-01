import {
  Processor,
  Block,
  ProcessorInstance,
  ProcessorEvaluator,
} from '@/interfaces';
import { JSONSchema7Object } from 'json-schema';
import { v4 } from 'uuid';

const definitions: Record<string, Processor> = {};
const evaluators: Record<string, ProcessorEvaluator> = {};

export const processorTypes: ProcessorInstance['type'][] = [
  'mutator',
  'responder',
];
export function getProcessorDefinition(id: string) {
  return definitions[id];
}

export function getProcessorEvaluator(id: string) {
  return evaluators[id];
}

export const getEvaluators = () => evaluators;

export const getDefinitions = () => definitions;

export function buildBlock<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
>(
  definition: Processor<TSchemaObject>,
  type: ProcessorInstance<TSchemaObject>['type'],
): Block {
  return {
    processor: {
      data: definition.data,
      id: definition.id,
      type: type,
      next: {
        options: {},
        blockIds: [],
      },
    },
    id: v4(),
    metadata: {
      createdAt: new Date().toISOString(),
      description: '',
      name: `New ${definition.id}`,
      x: 150,
      y: 150,
    },
  };
}
export function registerProcessorDefinition<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
>(definition: Processor<TSchemaObject>) {
  // @ts-ignore
  definitions[definition.id] = definition;
  return definition;
}

export function registerEvaluator<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
>(
  definition: Processor<TSchemaObject>,
  evaluator: ProcessorEvaluator<TSchemaObject>,
) {
  // @ts-ignore
  evaluators[definition.id] = evaluator;
  return evaluators;
}
