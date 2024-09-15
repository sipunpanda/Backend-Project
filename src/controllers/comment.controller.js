import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all comments for a video with pagination
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.find({ videoId })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }); // Sort by most recent

  const totalComments = await Comment.countDocuments({ videoId });

  res.status(200).json(new ApiResponse(200, "Comments fetched successfully", {
    comments,
    totalPages: Math.ceil(totalComments / limit),
    currentPage: page,
  }));
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { text, userId } = req.body;

  if (!text) throw new ApiError(400, "Comment text is required");

  const newComment = await Comment.create({ videoId, text, userId });

  res.status(201).json(new ApiResponse(201, "Comment added successfully", newComment));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { text },
    { new: true, runValidators: true }
  );

  if (!updatedComment) throw new ApiError(404, "Comment not found");

  res.status(200).json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) throw new ApiError(404, "Comment not found");

  res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};
