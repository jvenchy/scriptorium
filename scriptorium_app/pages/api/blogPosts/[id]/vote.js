import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // extract token from Authorization header
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authorization header is missing or invalid" });
  }

  // verify the token
  const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const email = decodedToken.email;

  // fetch user id from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true
    },
  });

  const userId = account.id;

  // get blog post ID from URL parameter
  const { id } = req.query;
  const { voteType } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }

  if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ error: "Valid voteType (upvote or downvote) is required" });
  }

  try {
    // Check if blog post exists
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      select: { id: true }
    });

    if (!blogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Check if the user has already voted on this post
    const existingVote = await prisma.blogPostVote.findUnique({
      where: {
        blogPostId_accountId: {
          blogPostId: parseInt(id),
          accountId: userId
        }
      }
    });

    await prisma.$transaction(async (tx) => {
      // If the user has voted before, update the vote type if it's different
      if (existingVote) {
        if (existingVote.voteType !== voteType.toUpperCase()) {
          await tx.blogPostVote.update({
            where: {
              blogPostId_accountId: {
                blogPostId: parseInt(id),
                accountId: userId
              }
            },
            data: { voteType: voteType.toUpperCase() }
          });

          // Update the upvote or downvote counts accordingly
          if (voteType === 'upvote') {
            await tx.blogPost.update({
              where: { id: parseInt(id) },
              data: {
                upvotes: { increment: 1 },
                downvotes: { decrement: 1 }
              }
            });
          } else {
            await tx.blogPost.update({
              where: { id: parseInt(id) },
              data: {
                upvotes: { decrement: 1 },
                downvotes: { increment: 1 }
              }
            });
          }
        }
      } else {
        // If the user has not voted before, create a new vote
        await tx.blogPostVote.create({
          data: {
            blogPost: { connect: { id: parseInt(id) } },
            account: { connect: { id: userId } },
            voteType: voteType.toUpperCase()
          }
        });

        // Update the upvote or downvote counts accordingly
        if (voteType === 'upvote') {
          await tx.blogPost.update({
            where: { id: parseInt(id) },
            data: {
              upvotes: { increment: 1 }
            }
          });
        } else {
          await tx.blogPost.update({
            where: { id: parseInt(id) },
            data: {
              downvotes: { increment: 1 }
            }
          });
        }
      }
    });

    // Get updated vote counts
    const [upvoteCount, downvoteCount] = await Promise.all([
      prisma.blogPostVote.count({ where: { blogPostId: parseInt(id), voteType: 'UPVOTE' } }),
      prisma.blogPostVote.count({ where: { blogPostId: parseInt(id), voteType: 'DOWNVOTE' } })
    ]);

    return res.status(200).json({
      message: "Vote processed successfully",
      blogPostId: id,
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
