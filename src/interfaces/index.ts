import { JSONSchema7Object } from 'json-schema';
import { JSONSchemaType } from 'ajv';

export type User = {};

export type Page = {
  id: string;
  owners: User[];
  context: JSONSchema7Object;
  blocks: Record<string, Block>;
  entryBlock: string;
};

export type InstanceData = {
  type: 'block';
  instance: Block;
  isEntryBlock: boolean;
};

export type NextBlockData = {
  type: 'next';
  blockId: string;
};

export type Block<T extends JSONSchema7Object = JSONSchema7Object> = {
  id: string;
  processor: ProcessorInstance<T>;
  metadata: {
    createdAt: string;
    updatedAt?: string;
    name: string;
    description: string;
    x: number;
    y: number;
  };
};

export type ProcessorInstance<T extends JSONSchema7Object = JSONSchema7Object> =
  ResponderInstance<T> | MutatorInstance<T>;
export type ResponderInstance<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
> = {
  id: string;
  type: 'responder';
  data: TSchemaObject;
};

export type MutatorInstance<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
> = {
  id: string;
  type: 'mutator';
  data: TSchemaObject;
  next: {
    options: {};
    blockIds: string[];
  };
};

export type Processor<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
> = {
  id: string;
  data: TSchemaObject;
  schema: JSONSchemaType<TSchemaObject>;
};

export type ProcessorEvaluator<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
> = (
  ctx: Page['context'],
  data: Processor<TSchemaObject>['data'],
) => Promise<JSONSchema7Object>;
