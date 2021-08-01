import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Divider, Spacer } from "@chakra-ui/layout";
import React from "react";
import { Handle, Position, useStoreState } from "react-flow-renderer";
import { Block, ProcessorInstance } from "@/interfaces";
import { getDefinitions, getProcessorDefinition, processorTypes } from "@/entities/processor";
import { HStack, VStack, Select, Tag, useToast, Kbd } from "@chakra-ui/react";
import { BiGridVertical, BiX } from "react-icons/bi";
import { Icon } from "@chakra-ui/icon";

export default function NodeWrapper(props: {
  children: React.ReactNode;
  modify: (modifier: (draft: Block) => void) => void;
  instance: Block;
  isEntryBlock: boolean;
}) {
  const definitions = React.useMemo(() => getDefinitions(), [])
  const toast = useToast()
  const selectedElements = useStoreState((state) => state.selectedElements);
  const isSelected = React.useMemo(
    () => !!selectedElements?.find((el) => el.id.endsWith(props.instance.id)),
    [selectedElements, props.instance.id]
  );
  const handleNameChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.currentTarget.value;
      props.modify((draft) => {
        draft.metadata.name = name;
      });
    },
    [props.modify]
  );
  const handleProcessorTypeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.modify((draft) => {
        draft.processor.type = e.currentTarget.value as ProcessorInstance['type'];
      });
    },
    [props.modify]
  );
  const handleProcessorIdChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.modify((draft) => {
        const newProcessor = getProcessorDefinition(e.currentTarget.value)
        if (!newProcessor) return
        draft.processor.id = newProcessor.id
        draft.processor.data = newProcessor.data
      });
    },
    [props.modify]
  );
  const processorDefinition = React.useMemo(() => {
    return getProcessorDefinition(props.instance.processor.id);
  }, [props.instance.processor.id]);
  return (
    <Box>
      <HStack>
        <Handle
          position={Position.Top}
          type="target"
          style={{
            position: "relative",
            borderRadius: "5px 5px 0 0",
            border: "none",
            width: "auto",
            height: "auto",
            padding: "2px 6px",
            background: "#525252",
            top: 0,
            transform: "translate(10px)",
          }}
        >
          input
        </Handle>
      </HStack>
      <Box bg={isSelected ? "#525252" : "#414141"} borderRadius="5px">
        <HStack padding="6px 12px">
          <Icon color="white" as={BiGridVertical} />
          <Select width='100' size='sm' value={props.instance.processor.id} onChange={handleProcessorIdChange}>
            {Object.keys(definitions).map((k) => <option value={k}>{k}</option>)}
          </Select>
          <Select width='100' size='sm' value={props.instance.processor.type} onChange={handleProcessorTypeChange}>
            {processorTypes.map(v => <option value={v}>{v}</option>)}
          </Select>
          <Spacer />
          {props.isEntryBlock ? <Tag colorScheme='green'>Entry point</Tag> : <Icon onClick={() =>
            toast({
              title: <>Press <Kbd color='red' >ctrl/cmd</Kbd>+<Kbd color='red'>delete</Kbd> to delete</>,
              position: 'top',
              status: 'warning',
              duration: 3000,
              isClosable: true,
            })
          } color="white" as={BiX} />}
        </HStack>
        <Divider />
        <Box padding="6px 12px">
          <VStack>
            <FormControl paddingBottom="6px">
              <FormLabel>Name</FormLabel>
              <Input
                size="sm"
                defaultValue={props.instance.metadata.name}
                onChange={handleNameChange}
              />
            </FormControl>
            {props.children ? (
              <Box paddingBottom="6px" width="100%">
                {props.children}
              </Box>
            ) : null}
          </VStack>
        </Box>
      </Box>
      <HStack>
        {props.instance.processor.type === 'mutator' && <Handle
          key="next"
          id="next"
          position={Position.Bottom}
          type="source"
          style={{
            position: "relative",
            borderRadius: "0 0 5px 5px",
            border: "none",
            width: "auto",
            height: "auto",
            padding: "2px 6px",
            background: "#525252",
            bottom: 0,
            transform: "translate(10px)",
          }}
        >
          next
        </Handle>}
      </HStack>
    </Box>
  );
}
