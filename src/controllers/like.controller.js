import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js"; // Assume Like model handles likes for videos, comments, and tweets
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  // Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Check if the like already exists
  const existingLike = await Like.findOne({ videoId, userId });

  if (existingLike) {
    // Unlike the video (remove the like)
    await Like.deleteOne({ videoId, userId });
    res.status(200).json(new ApiResponse(200, "Video unliked successfully"));
  } else {
    // Like the video
    await Like.create({ videoId, userId, type: "video" });
    res.status(201).json(new ApiResponse(201, "Video liked successfully"));
  }
});

// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  // Validate commentId
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Check if the like already exists
  const existingLike = await Like.findOne({ commentId, userId });

  if (existingLike) {
    // Unlike the comment
    await Like.deleteOne({ commentId, userId });
    res.status(200).json(new ApiResponse(200, "Comment unliked successfully"));
  } else {
    // Like the comment
    await Like.create({ commentId, userId, type: "comment" });
    res.status(201).json(new ApiResponse(201, "Comment liked successfully"));
  }
});

// Toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { userId } = req.body;

  // Validate tweetId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Check if the like already exists
  const existingLike = await Like.findOne({ tweetId, userId });

  if (existingLike) {
    // Unlike the tweet
    await Like.deleteOne({ tweetId, userId });
    res.status(200).json(new ApiResponse(200, "Tweet unliked successfully"));
  } else {
    // Like the tweet
    await Like.create({ tweetId, userId, type: "tweet" });
    res.status(201).json(new ApiResponse(201, "Tweet liked successfully"));
  }
});

// Get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Find all likes of type "video" for the user
  const likedVideos = await Like.find({ userId, type: "video" }).populate("videoId");

  res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", likedVideos));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
};
