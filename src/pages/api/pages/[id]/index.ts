import { mockAPI } from '@/server';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const pageId = _req.query['id'] as string;
  if (!pageId)
    return res
      .status(404)
      .json({ status: 'error', errorMessage: 'Cannot find pageId' });
  if (_req.method === 'GET') {
    return res.status(200).json(await mockAPI.getPage(pageId));
  }
  const result = await mockAPI.runPage(pageId, _req.body);
  return res.status(200).json(result);
};

export default handler;
