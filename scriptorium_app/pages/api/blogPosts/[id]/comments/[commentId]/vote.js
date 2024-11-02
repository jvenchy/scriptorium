// /comments/[commentId]/vote.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract token from Authorization header
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authorization header is missing or invalid" });
  }

  // Verify the token
  const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const email = decodedToken.email;

  // Fetch user ID from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true
    },
  });

  const userId = account.id;

  // Get comment ID from URL parameter
  const { commentId } = req.query;
  const { voteType } = req.body;

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "Comment ID must be a number" });
  }

  if (!voteType || typeof voteType !== 'string' || !['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ error: "Valid voteType (upvote or downvote) is required" });
  }

  

  try {
    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      select: { id: true, upvotes: true, downvotes: true }
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the user has already voted on this comment
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        commentId_accountId: {
          commentId: parseInt(commentId),
          accountId: userId
        }
      }
    });

    await prisma.$transaction(async (tx) => {
      // If the user has voted before, update the vote type if it's different
      if (existingVote) {
        if (existingVote.voteType !== voteType.toUpperCase()) {
          await tx.commentVote.update({
            where: {
              commentId_accountId: {
                commentId: parseInt(commentId),
                accountId: userId
              }
            },
            data: { voteType: voteType.toUpperCase() }
          });

          // Update the upvote or downvote counts accordingly
          if (voteType === 'upvote') {
            await tx.comment.update({
              where: { id: parseInt(commentId) },
              data: {
                upvotes: { increment: 1 },
                downvotes: { decrement: 1 }
              }
            });
          } else {
            await tx.comment.update({
              where: { id: parseInt(commentId) },
              data: {
                upvotes: { decrement: 1 },
                downvotes: { increment: 1 }
              }
            });
          }
        }
      } else {
        // If the user has not voted before, create a new vote
        await tx.commentVote.create({
          data: {
            comment: { connect: { id: parseInt(commentId) } },
            account: { connect: { id: userId } },
            voteType: voteType.toUpperCase()
          }
        });

        // Update the upvote or downvote counts accordingly
        if (voteType === 'upvote') {
          await tx.comment.update({
            where: { id: parseInt(commentId) },
            data: {
              upvotes: { increment: 1 }
            }
          });
        } else {
          await tx.comment.update({
            where: { id: parseInt(commentId) },
            data: {
              downvotes: { increment: 1 }
            }
          });
        }
      }
    });

    // Get updated vote counts
    const [upvoteCount, downvoteCount] = await Promise.all([
      prisma.commentVote.count({ where: { commentId: parseInt(commentId), voteType: 'UPVOTE' } }),
      prisma.commentVote.count({ where: { commentId: parseInt(commentId), voteType: 'DOWNVOTE' } })
    ]);

    return res.status(200).json({
      message: "Vote processed successfully",
      commentId: commentId,
      stats: {
        upvotes: upvoteCount,
        downvotes: downvoteCount,
        score: upvoteCount - downvoteCount
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
