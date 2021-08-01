import { mockAPI } from '@/server';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const pageId = _req.query['id'] as string;
  const blockId = _req.query['blockId'] as string;
  const block = _req.body as any;
  if (_req.method === 'PATCH') {
    await mockAPI.updatePageBlock(pageId, block);
  }
  if (_req.method === 'DELETE') {
    await mockAPI.deletePageBlock(pageId, blockId);
  }
  return res.status(200).json({ status: 'success' });
};

export default handler;
