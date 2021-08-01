import { Block, Page } from "@/interfaces";
import React from "react";
import axios from 'axios'
import { JSONSchema7Object } from "json-schema";

const mockClient = {
    async createPage(page: Page): Promise<Page> {
        return axios.post('/api/pages', page)
    },
    async createBlock(pageId: string, block: Block) {
        await axios.post(`/api/pages/${pageId}/blocks`, block)
    },

    async updatePageBlock(pageId: string, block: Block) {
        await axios.patch(`/api/pages/${pageId}/blocks/${block.id}`, block)
    },
    async getPages(): Promise<{ data: Page[] }> {
        const result = await axios.get('/api/pages')
        return result.data
    },
    async getPage(id: string): Promise<{ data?: Page }> {
        const result = await axios.get(`/api/pages/${id}`)
        return result.data
    },
    async deletePageBlock(pageId: string, blockId: string) {
        await axios.delete(`/api/pages/${pageId}/blocks/${blockId}`)
    },
    async runPage(pageId: string, ctx: JSONSchema7Object) {
        const result = await axios.post(`/api/pages/${pageId}`, ctx)
        return result.data
    }
}
export const context = React.createContext(mockClient);

export const Provider = (props: { children: React.ReactNode }) => {
    const client = React.useRef(
        mockClient
    );
    return (
        <context.Provider value={client.current}>{props.children}</context.Provider>
    );
};

export const useClient = () => React.useContext(context);

