import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const session = await getSession({ req });
      const { status, search, page = '1', limit = '10' } = req.query;

      // Convert page and limit to numbers
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where = {
        AND: [
          // Status filter
          status ? { status: status as Status } : {},
          // Search filter
          search ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { description: { contains: search as string, mode: 'insensitive' } },
            ],
          } : {},
        ],
      };

      // Get total count for pagination
      const total = await prisma.feature.count({ where });

      // Get features
      const features = await prisma.feature.findMany({
        where,
        orderBy: {
          votes: {
            _count: 'desc'
          }
        },
        include: {
          _count: {
            select: { votes: true }
          },
          votes: session?.user?.id ? {
            where: {
              userId: session.user.id
            },
            select: {
              userId: true
            }
          } : false
        },
        skip,
        take: limitNum,
      });

      return res.status(200).json({
        features,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          page: pageNum,
          limit: limitNum,
        },
      });
    } catch (error) {
      console.error('Feature fetch error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.method === 'POST') {
    try {
      const { title, description } = req.body;

      // Validate input
      if (!title || !description) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (title.length > 100) {
        return res.status(400).json({ message: 'Title must be less than 100 characters' });
      }

      if (description.length > 500) {
        return res.status(400).json({ message: 'Description must be less than 500 characters' });
      }

      // Create feature request
      const feature = await prisma.feature.create({
        data: {
          title,
          description,
          creatorId: session.user.id,
        },
      });

      return res.status(201).json(feature);
    } catch (error) {
      console.error('Feature creation error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 