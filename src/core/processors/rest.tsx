import { Block, Page, Processor, ProcessorEvaluator } from '@/interfaces'
import {
  FormControl,
  FormLabel,
  Select,
  VStack,
} from "@chakra-ui/react";
import Editor from '@monaco-editor/react';
import { JSONSchema7Object } from 'json-schema';
import React, { ChangeEvent } from "react";
import { _javascriptEvaluator } from './javascript';
import { _yamlEvaluator } from './yaml'
import Axios, { Method } from "axios";

type RequestEvaluator = {
  evaluator: 'yaml' | 'javascript'
  data: string
}
type RequestData = {
  url: string
  method: string
  headers: JSONSchema7Object
  body: JSONSchema7Object
}
const evaluators: { [key in RequestEvaluator['evaluator']]: RequestEvaluator } = {
  javascript: {
    evaluator: 'javascript',
    data: `function request(ctx){
return {
  url: '',
  method: 'GET',
  headers: {},
  body: {}
}          
}`
  },
  yaml: {
    evaluator: 'yaml',
    data: `url:
method:
headers:
body:
    `
  }
}
export type RestProcessor = Processor<{
  request: RequestEvaluator
  resultMap: string
}>
export const restProcessor: RestProcessor = {
  id: "Rest API",
  data: {
    request: {
      ...evaluators.yaml
    },
    resultMap: `function resultMap(ctx, result){
return {
  ...ctx,
  result: result
}
}`
  },
  schema: {
    type: "object",
    required: ["request", "resultMap"],
    properties: {
      request: {
        type: "object",
        required: ['data', 'evaluator'],
        properties: {
          evaluator: { type: "string" },
          data: { type: "string" }
        }
      },
      resultMap: { type: "string" },
    },
  }
}


export const restNode: React.ComponentType<{
  instance: Block<typeof restProcessor["data"]>;
  modify: (
    modifier: (draft: typeof restProcessor["data"]) => void
  ) => void;
}> = (props) => {
  const handleRequestChange = React.useCallback(
    (val?: string) => {
      if (!val) return;
      props.modify((draft) => {
        draft.request.data = val;
      });
    },
    [props.modify]
  );
  const handleRequestEvalChange = React.useCallback(
    (val: ChangeEvent<HTMLSelectElement>) => {
      if (!val) return;
      props.modify((draft) => {
        const evaluatorId = val.currentTarget.value as RequestEvaluator['evaluator']
        const evaluator = evaluators[evaluatorId]
        if (!evaluator) return
        draft.request = evaluator
      });
    },
    [props.modify]
  );
  const handleResultMapChange = React.useCallback(
    (val?: string) => {
      if (!val) return;
      props.modify((draft) => {
        draft.resultMap = val;
      });
    },
    [props.modify]
  );
  return (
    <VStack>
      <FormControl>
        <FormLabel>Request
          <Select
            onChange={handleRequestEvalChange}
            value={props.instance.processor.data.request.evaluator}
          >
            <option key='javascript' value='javascript'>javascript</option>
            <option key='yaml' value='yaml'>yaml</option>
          </Select>
        </FormLabel>
        <Editor
          height="200px"
          theme="vs-dark"
          language={props.instance.processor.data.request.evaluator}
          value={props.instance.processor.data.request.data}
          onChange={handleRequestChange}
          options={{ minimap: { enabled: false } }}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Result Mapper</FormLabel>
        <Editor
          height="200px"
          theme="vs-dark"
          defaultLanguage="javascript"
          defaultValue={props.instance.processor.data.resultMap}
          onChange={handleResultMapChange}
          options={{ minimap: { enabled: false } }}
        />
      </FormControl>
    </VStack>
  );
}

const requestEval: { [key in RequestEvaluator['evaluator']]: (ctx: Page['context'], data: RestProcessor['data']['request']['data']) => RequestData } = {
  yaml: (ctx, data) => {
    return _yamlEvaluator(ctx, { function: data }) as RequestData;
  },
  javascript: (ctx, data) => {
    return _javascriptEvaluator(ctx, { function: data }) as RequestData
  }
}

export const restEvaluator: ProcessorEvaluator<typeof restProcessor["data"]> = async (ctx, data) => {
  const request = requestEval[data.request.evaluator](ctx, data.request.data)
  const result = await Axios.request({
    headers: request.headers || {},
    url: request.url,
    data: request.body,
    method: (request.method || 'GET') as Method
  })
  return _javascriptEvaluator(ctx, { function: data.resultMap }, { status: result.status, data: result.data })

}

