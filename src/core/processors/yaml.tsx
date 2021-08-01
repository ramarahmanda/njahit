import { Block, Page, Processor, ProcessorEvaluator } from '@/interfaces'
import { Box, FormControl } from "@chakra-ui/react";
import Editor from '@monaco-editor/react';
import React from "react";
import { compile } from 'handlebars'
import jsyaml from 'js-yaml'
import { JSONSchema7Object } from 'json-schema';

export const yamlProcessor: Processor<{
  function: string
}> = {
  id: "yaml",
  data: {
    function: `example: 123
    `,
  },
  schema: {
    type: "object",
    required: ["function"],
    properties: { function: { type: "string" } },
  }
}


export const yamlNode: React.ComponentType<{
  instance: Block<typeof yamlProcessor['data']>;
  modify: (
    modifier: (draft: typeof yamlProcessor['data']) => void
  ) => void;
}> = (props) => {
  const handleChange = React.useCallback(
    (val?: string) => {
      if (!val) return;
      props.modify((draft) => {
        draft.function = val;
      });
    },
    [props.modify]
  );
  return (
    <Box width="400px">
      <FormControl>
        <Editor
          height="200px"
          theme="vs-dark"
          defaultLanguage="yaml"
          defaultValue={props.instance.processor.data.function as string}
          onChange={handleChange}
          options={{ minimap: { enabled: false } }}
        />
      </FormControl>
    </Box>
  );
}

export const _yamlEvaluator = (ctx: Page['context'], data: typeof yamlProcessor['data']) => {
  const template = compile(data.function);
  const contents = template(ctx);
  return jsyaml.load(contents) as JSONSchema7Object;
}
export const yamlEvaluator: ProcessorEvaluator<typeof yamlProcessor['data']> = async (ctx, data) => {
  return _yamlEvaluator(ctx, data);
}
