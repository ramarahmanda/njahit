import { Page } from '@/interfaces';
import { mockAPI } from '@/server';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (_req.method === 'POST') {
    return res.status(200).json(await mockAPI.createPage(_req.body as Page));
  }
  return res.status(200).json(await mockAPI.getPages());
};

export default handler;
