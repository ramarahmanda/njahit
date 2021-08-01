import { Block, Page, Processor, ProcessorEvaluator, ProcessorInstance } from '@/interfaces'
import { Box, FormControl } from "@chakra-ui/react";
import Editor from '@monaco-editor/react';
import { JSONSchema7Object } from 'json-schema';
import React from "react";
import vm from 'vm';

export const javascriptProcessor: Processor = {
  id: "JavaScript",
  data: {
    function: `function myFunction(ctx) {
  return ctx
}
    `,
  },
  schema: {
    type: "object",
    required: ["function"],
    properties: { function: { type: "string" } },
  }
}

export const javascriptNode: React.ComponentType<{
  instance: Block;
  modify: (
    modifier: (draft: Processor["data"]) => void
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
          defaultLanguage="javascript"
          defaultValue={props.instance.processor.data.function as string}
          onChange={handleChange}
          options={{ minimap: { enabled: false } }}
        />
      </FormControl>
    </Box>
  );
}

export const _javascriptEvaluator = (ctx: Page['context'], data: typeof javascriptProcessor['data'], ...args: any[]) => {
  const script = new vm.Script(`
        const compute = ${data.function};
        result = compute(input, ...args);
      `);
  const context = vm.createContext({ input: ctx, result: null, args });
  script.runInContext(context);

  return context.result as JSONSchema7Object;
}

export const javascriptEvaluator: ProcessorEvaluator<typeof javascriptProcessor['data']> = async (ctx, data) => {

  return _javascriptEvaluator(ctx, data)
}