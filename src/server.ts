import '@/register';
import { Block, Page } from '@/interfaces';
import { v4 } from 'uuid';
import { buildBlock } from '@/entities/processor';
import { yamlProcessor } from '@/core/processors/yaml';
import { JSONSchema7Object } from 'json-schema';
import { pageRun } from '@/core/page';
import jfile from 'jsonfile';
import { resolve } from 'path';

const path = resolve('./src/db.json');

// function generatePage(): Page {
//   const block: Block = buildBlock(yamlProcessor, 'responder');
//   block.id = 'first';
//   block.metadata.x = 100;
//   block.metadata.y = 100;
//   block.metadata.name = 'Context';
//   return {
//     owners: [],
//     blocks: { [block.id]: block },
//     context: {},
//     id: 'test',
//     entryBlock: block.id,
//   };
// }

class MockAPI {
  async createPage(page: Page): Promise<Page> {
    const data = jfile.readFileSync(path);
    data.pages.push(page);
    jfile.writeFileSync(path, data);
    return page;
  }

  async createBlock(pageId: string, block: Block) {
    const data = jfile.readFileSync(path);
    const idx = data.pages.findIndex((v: Page) => v.id === pageId);
    if (idx < 0) return;
    data.pages[idx].blocks = { ...data.pages[idx].blocks, [block.id]: block };
    jfile.writeFileSync(path, data);
  }

  async updatePageBlock(pageId: string, block: Block) {
    const data = jfile.readFileSync(path);
    const idx = data.pages.findIndex((v: Page) => v.id === pageId);
    if (idx < 0) return;
    data.pages[idx].blocks = { ...data.pages[idx].blocks, [block.id]: block };
    jfile.writeFileSync(path, data);
  }

  async getPages(): Promise<{ data: Page[] }> {
    const data = jfile.readFileSync(path);
    return { data: data.pages };
  }
  async getPage(id: string): Promise<{ data?: Page }> {
    const data = jfile.readFileSync(path);
    return {
      data: data.pages.find((v: Page) => v.id === id),
    };
  }
  async deletePageBlock(pageId: string, blockId: string) {
    const data = jfile.readFileSync(path);
    const idx = data.pages.findIndex((v: Page) => v.id === pageId);
    if (idx < 0) return;
    delete data.pages[idx].blocks[blockId];
    jfile.writeFileSync(path, data);
  }
  async runPage(pageId: string, ctx: JSONSchema7Object) {
    const data = jfile.readFileSync(path);
    const page = data.pages.find((v: Page) => {
      return v.id === pageId.trim();
    });
    if (!page)
      return {
        status: 'error',
        errMessage: 'page cannot be found',
      };
    return pageRun(page, ctx || {});
  }
}

export const mockAPI = new MockAPI();
