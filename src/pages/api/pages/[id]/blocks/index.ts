import { mockAPI } from '@/server';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const pageId = _req.query['id'] as string;
  const block = _req.body as any;
  await mockAPI.createBlock(pageId, block);
  return res.status(200).json({ status: 'success' });
};

export default handler;
