import React from "react";
import {
    Box,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalHeader,
    ModalCloseButton,
    Grid,
    GridItem,
    Text,
    HStack,
    Select,
    VStack,
    ModalFooter,
} from "@chakra-ui/react";
import ReactFlow, {
    Controls,
    Background,
    Edge,
    Connection,
    Elements,
    Node,
} from "react-flow-renderer";
import {
    ProcessorInstance,
    Processor,
    InstanceData,
    NextBlockData,
} from "@/interfaces";
import {
    buildBlock,
    getDefinitions,
    getProcessorDefinition
} from "@/entities/processor";
// import QonduitConverter, { ElementData } from "../utils/QonduitConverter";
import { usePageBuilder } from "@/providers/Page";
import { BiAddToQueue, BiMinus, BiPlus } from "react-icons/bi";
// import { getNodeTypes } from "../server/ReactNodes";
import { useClient } from "@/providers/Njahit";
import useSWR from "swr";
import { Page } from "@/interfaces";
import { useRouter } from "next/dist/client/router";
import Cookies from "js-cookie";
import { v4 } from "uuid";
import { getNodeTypes } from "./ProcessorNodes";
import Editor from '@monaco-editor/react';
import { JSONSchema7Object } from "json-schema";
import axios from "axios";

const QonduitSettingPanel = (props: { page: Page }) => {
    const [result, setResult] = React.useState<JSONSchema7Object | null>(null)
    const [context, setContext] = React.useState('{}')
    const { isOpen, onOpen, onClose } = useDisclosure()
    const onTestAPI = async () => {
        const result = await axios.post('/api/pages/' + props.page.id, JSON.parse(context))
        setResult(result.data)
    }
    return (
        <Box position="absolute" left="12px" top="56px" zIndex={5}>
            <Button onClick={onOpen}>Test API</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Test API</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Editor
                            height="200px"
                            theme="vs-dark"
                            defaultLanguage="json"
                            onChange={(v) => v && setContext(v)}
                            options={{ minimap: { enabled: false } }}
                            value={context}
                        />
                        <Button isFullWidth onClick={onTestAPI}>Test</Button>
                    </ModalBody>
                    <ModalFooter>
                        {result && <Editor
                            height="250px"
                            theme="vs-dark"
                            defaultLanguage="json"
                            value={JSON.stringify(result, null, 2)}
                            options={{ minimap: { enabled: false }, readOnly: true }}
                        />}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const QonduitControls = () => {
    const [state, setState] = React.useState<{ selected?: string }>({});
    const client = useClient();
    const router = useRouter();
    const pages = useSWR([client], async () => {
        const resp = await client.getPages();
        return resp.data as Page[];
    });
    const { build } = usePageBuilder();
    useSWR([state.selected, client, build], async (selected) => {
        if (!state.selected) return;
        const resp = await client.getPage(selected);
        const page = resp.data as unknown as Page;
        if (!page) return;
        build((builder) => {
            builder.manager.load(page);
        });
    });
    const addProcessorDisclosure = useDisclosure();
    const handleAddProcessor = React.useCallback(
        (processor: Processor, type: ProcessorInstance["type"]) => {
            build((builder) => {
                builder.manager.addProcessor(buildBlock(processor, type));
            });
            addProcessorDisclosure.onClose();
        },
        [build]
    );
    const handleLogout = React.useCallback(() => {

    }, []);
    const handleSelectPage = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setState({ selected: e.currentTarget.value });
        },
        []
    );
    const definitions = React.useMemo(() => Object.values(getDefinitions()), []);
    const handleAddPage = React.useCallback(async () => {
        const block = buildBlock(definitions[0], "responder");
        const page = await client.createPage({
            id: v4(),
            blocks: {
                [block.id]: block,
            },
            context: {},
            owners: [],
            entryBlock: block.id
        });
        await pages.revalidate();
        // @ts-ignore
        setState({ selected: page.data?.id as unknown as string });
    }, [client]);
    React.useEffect(() => {
        if (!state.selected) {
            setState({ selected: pages.data?.[0]?.id });
        }
    }, [pages.data, state.selected]);
    return (
        <Box position="absolute" left="12px" top="12px" zIndex={5}>
            <HStack>
                <Select
                    size="sm"
                    width="100px"
                    value={state.selected}
                    onChange={handleSelectPage}
                >
                    {pages.data?.map((page) => {
                        return (
                            <option key={page.id} value={page.id}>
                                {page.id}
                            </option>
                        );
                    })}
                </Select>
                <Button
                    size="sm"
                    bg="#414141"
                    onClick={handleAddPage}
                    leftIcon={<BiAddToQueue />}
                >
                    Page
                </Button>
                <Button
                    onClick={addProcessorDisclosure.onOpen}
                    size="sm"
                    bg="#414141"
                    leftIcon={<BiAddToQueue />}
                >
                    Block
                </Button>
                <Button size="sm" bg="#414141" onClick={handleLogout}>
                    Logout
                </Button>
            </HStack>

            <Modal
                isOpen={addProcessorDisclosure.isOpen}
                onClose={addProcessorDisclosure.onClose}
            >
                <ModalOverlay />
                <ModalContent pb={5}>
                    <ModalHeader>Add new block</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                            {definitions.map((definition) => (
                                <GridItem key={definition.id}>
                                    <Box
                                        onClick={() => handleAddProcessor(definition, "responder")}
                                        padding={4}
                                        bg="gray.800"
                                        borderRadius={4}
                                        cursor="pointer"
                                    >
                                        <Text>{definition.id}</Text>
                                    </Box>
                                </GridItem>
                            ))}
                        </Grid>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

function deflate(page: Page): Elements<InstanceData | NextBlockData> {
    const blocks: Node<InstanceData>[] = [];
    const subscriptions: Edge<NextBlockData>[] = [];
    for (const instance of Object.values(page.blocks)) {
        const processor = getProcessorDefinition(instance.processor.id);
        const nodeID = `${page.id}_${instance.id}`;
        const { x, y } = instance.metadata;
        if (instance.processor.type === 'mutator') {
            const edges: Edge<NextBlockData>[] = instance.processor.next.blockIds.map(
                (nextBlockId) => ({
                    id: `${instance.id}_${nextBlockId}`,
                    target: `${page.id}_${nextBlockId}`,
                    source: nodeID,
                    data: { blockId: nextBlockId, type: "next" },
                    type: "subscription",
                    sourceHandle: 'next',
                })
            );
            subscriptions.push(...edges);
        }
        blocks.push({
            id: nodeID,
            data: { instance, type: 'block', isEntryBlock: page.entryBlock === instance.id },
            position: { y, x },
            type: processor.id
        })
    }
    return [...blocks, ...subscriptions];
}

export default function PageMap() {
    const { state, build } = usePageBuilder();
    const elements = React.useMemo(() => {
        const els = deflate(state);
        return els;
    }, [state]);
    const handleConnect = React.useCallback(
        (connection: Edge<any> | Connection) => {
            build((builder) => {
                if (
                    !connection.target ||
                    !connection.source ||
                    !connection.sourceHandle
                )
                    return;
                const [pageId, sourceInstanceID] = connection.source.split("_");
                const [_, targetInstanceID] = connection.target.split("_");
                builder.manager.subscribe(sourceInstanceID, targetInstanceID);
            });
        },
        [build]
    );

    const client = useClient();

    const handleElementRemove = React.useCallback(
        async (elements: Elements<ProcessorInstance>) => {
            const elementsToRemove = elements.filter(el => {
                const [_, blockId] = el.id.split("_");
                return blockId !== state.entryBlock
            })
            build((builder) => {
                elementsToRemove.forEach((el) => {
                    const [_, blockId] = el.id.split("_");
                    builder.manager.removeProcessor(blockId);
                });
            });
            elementsToRemove.map(async (el) => {
                const [pageId, blockId] = el.id.split("_");
                await client.deletePageBlock(pageId, blockId);
            })
        },
        [client, state]
    );
    const handleNodeDragStop = React.useCallback(
        (event: React.MouseEvent<Element, MouseEvent>, node: Node) => {
            build((builder) => {
                const [_, instanceID] = node.id.split("_");
                builder.manager.modifyInstance(instanceID, (draft) => {
                    draft.metadata.x = node.position.x;
                    draft.metadata.y = node.position.y;
                });
            });
        },
        []
    );
    return (
        <ReactFlow
            onConnect={handleConnect}
            onElementsRemove={handleElementRemove}
            onNodeDragStop={handleNodeDragStop}
            elements={elements}
            nodeTypes={getNodeTypes()}
        >
            <QonduitControls />
            <QonduitSettingPanel page={state} />
            <Controls />
            <Background gap={16} />
        </ReactFlow>
    );
}
