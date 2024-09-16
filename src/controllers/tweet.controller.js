import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { userId } = req.params;

  // Validate user ID
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Create new tweet
  const tweet = await Tweet.create({
    userId,
    content,
    createdAt: new Date(),
  });

  res.status(201).json(new ApiResponse(201, "Tweet created successfully", tweet));
});

// Get all tweets of a user
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate user ID
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Fetch tweets
  const tweets = await Tweet.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, "Tweets fetched successfully", tweets));
});

// Update a tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  // Validate tweet ID
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Update tweet content
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true, runValidators: true }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  res.status(200).json(new ApiResponse(200, "Tweet updated successfully", updatedTweet));
});

// Delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Validate tweet ID
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  res.status(200).json(new ApiResponse(200, "Tweet deleted successfully"));
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
};
