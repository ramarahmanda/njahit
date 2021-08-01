import React from "react";
import {
  Block,
  Processor
} from "@/interfaces";
import { JSONSchema7Object } from "json-schema";
import { usePageBuilder } from "@/providers/Page"
import { useClient } from "@/providers/Njahit"
import NodeWrapper from "./NodeWrapper"

const nodeTypes: Record<
  string,
  React.ComponentType<{
    data: {
      instance: Block<any>;
      isEntryBlock: boolean
    };
  }>
> = {};

export function getNodeTypes() {
  return nodeTypes;
}

export function registerNode<
  TSchemaObject extends JSONSchema7Object = JSONSchema7Object,
  >(
    definition: Processor<TSchemaObject>,
    Component: React.ComponentType<{
      instance: Block<TSchemaObject>;
      modify: (
        modifier: (draft: TSchemaObject) => void
      ) => void;
    }>
  ) {
  nodeTypes[definition.id] = ({
    data,
  }: {
    data: {
      instance: Block<TSchemaObject>;
      isEntryBlock: boolean;
    };
  }) => {
    const { build, state } = usePageBuilder();
    const modifyBlock = React.useCallback(
      (modifier: (draft: Block) => void) => {
        build((builder) => {
          builder.manager.modifyInstance(data.instance.id, (draft) => {
            modifier(draft);
          });
        });
      },
      [data.instance.id, build]
    );

    const modifyOptions = React.useCallback(
      (modifier: (draft: typeof data.instance.processor["data"]) => void) => {
        build((builder) => {
          builder.manager.modifyInstance(data.instance.id, (draft) => {
            // @ts-ignore
            modifier(draft.processor.data);
          });
        });
      },
      [data.instance.id, build]
    );
    const client = useClient();
    React.useEffect(() => {
      const timeout = setTimeout(async () => {
        const updated = state.blocks[data.instance.id];
        if (!updated) return;
        await client.updatePageBlock(
          state.id,
          updated as any
        );
      }, 300);
      return () => clearTimeout(timeout);
    }, [client, state.blocks[data.instance.id]]);
    return (
      <NodeWrapper instance={data.instance} modify={modifyBlock} isEntryBlock={data.isEntryBlock}>
        <Component instance={data.instance} modify={modifyOptions} />
      </NodeWrapper>
    );
  };
}