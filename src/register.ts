import {
  javascriptProcessor,
  javascriptNode,
  javascriptEvaluator,
} from '@/core/processors/javascript';
import { restProcessor, restNode, restEvaluator } from '@/core/processors/rest';
import { yamlProcessor, yamlNode, yamlEvaluator } from '@/core/processors/yaml';
import {
  registerProcessorDefinition,
  registerEvaluator,
} from '@/entities/processor';
import { registerNode } from '@/components/ProcessorNodes';
import { Block, Processor, ProcessorEvaluator } from './interfaces';
import { JSONSchema7Object } from 'json-schema';

registerProcessor(javascriptProcessor, javascriptNode, javascriptEvaluator);
registerProcessor(restProcessor, restNode, restEvaluator);
registerProcessor(yamlProcessor, yamlNode, yamlEvaluator);
function registerProcessor<T extends JSONSchema7Object = JSONSchema7Object>(
  processor: Processor<T>,
  processorNode: React.ComponentType<{
    instance: Block<T>;
    modify: (modifier: (draft: T) => void) => void;
  }>,
  processorEvaluator: ProcessorEvaluator<T>,
) {
  registerProcessorDefinition(processor);
  registerNode<T>(processor, processorNode);
  registerEvaluator<T>(processor, processorEvaluator);
}
