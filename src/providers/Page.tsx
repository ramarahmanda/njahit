import React from "react";
import createStateManager from "./common";
import { Block, Page } from "@/interfaces"
import { getProcessorDefinition } from "@/entities/processor"

const initial: Page = {
    id: '',
    blocks: {},
    context: {},
    owners: [],
    entryBlock: ''
};

const pageBuilder = createStateManager(initial, (Base) => {
    class PageManager extends Base {
        load(page: Page) {
            this.modify((draft) => {
                draft.id = page.id;
                draft.blocks = page.blocks;
                draft.context = page.context;
                draft.entryBlock = page.entryBlock;
                draft.owners = page.owners
            });
        }
        addProcessor(processor: Block) {
            this.modify((draft) => {
                draft.blocks[processor.id] = processor;
            });
        }
        removeProcessor(id: string) {
            this.modify((draft) => {
                delete draft.blocks[id];
                // clean any subscriptions to this instance
                for (const instance of Object.values(draft.blocks)) {
                    if (instance.processor.type === 'responder') continue
                    instance.processor.next.blockIds = instance.processor.next.blockIds.filter(
                        (sub) => sub !== id
                    );
                }
            });
        }
        subscribe(id: string, nextBlockId: string) {
            this.modify((draft) => {
                const block = draft.blocks[id];
                if (block.processor.type === 'responder') return
                block.processor.next.blockIds.push(nextBlockId);
            });
        }
        getInstance(id: string) {
            return this.select((state) => state.blocks[id]);
        }
        getInstanceProcessorDefinition(id: string) {
            const instance = this.getInstance(id);
            return getProcessorDefinition(instance.processor.id);
        }
        modifyInstance(id: string, modifier: (draft: Block) => void) {
            this.modify((draft) => {
                modifier(draft.blocks[id]);
            });
        }
    }
    return new PageManager(initial);
});


export const context = React.createContext({
    build: (build: (builder: typeof pageBuilder) => void) => { },
    state: pageBuilder.manager.state,
});

export const usePageBuilder = () => React.useContext(context);

export default function PageBuilderProvider(props: {
    children: React.ReactNode;
}) {
    const builderRef = React.useRef(pageBuilder);
    const [state, setState] = React.useState(builderRef.current.manager.state);
    const build = React.useCallback(
        (build: (build: typeof pageBuilder) => void) => {
            build(builderRef.current);
            setState(builderRef.current.manager.state);
        },
        []
    );
    return (
        <context.Provider value={{ state, build }}>
            {props.children}
        </context.Provider>
    );
}