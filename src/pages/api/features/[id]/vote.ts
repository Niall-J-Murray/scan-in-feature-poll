import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const featureId = req.query.id as string;

  if (req.method === 'POST') {
    try {
      // Check if vote exists
      const existingVote = await prisma.vote.findUnique({
        where: {
          userId_featureId: {
            userId: session.user.id,
            featureId,
          },
        },
      });

      if (existingVote) {
        // Remove vote if it exists
        await prisma.vote.delete({
          where: {
            userId_featureId: {
              userId: session.user.id,
              featureId,
            },
          },
        });
      } else {
        // Create vote if it doesn't exist
        await prisma.vote.create({
          data: {
            userId: session.user.id,
            featureId,
          },
        });
      }

      return res.status(200).json({ message: 'Vote updated successfully' });
    } catch (error) {
      console.error('Vote error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 