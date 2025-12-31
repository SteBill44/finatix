import { useState } from "react";
import { Star, ThumbsUp, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseReviews, useCourseRating, useUserReview, useSubmitReview } from "@/hooks/useReviews";
import { toast } from "sonner";
import { format } from "date-fns";

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  interactive = false,
  size = "md"
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void; 
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => onRatingChange?.(star)}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const RatingBreakdown = ({ reviews }: { reviews: any[] }) => {
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  const total = reviews.length || 1;

  return (
    <div className="space-y-2">
      {ratingCounts.map(({ rating, count }) => (
        <div key={rating} className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-16">{rating} stars</span>
          <Progress value={(count / total) * 100} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground w-10">{count}</span>
        </div>
      ))}
    </div>
  );
};

const CourseReviews = ({ courseId, isEnrolled }: CourseReviewsProps) => {
  const { user } = useAuth();
  const { data: reviews, isLoading: reviewsLoading } = useCourseReviews(courseId);
  const { data: ratingData } = useCourseRating(courseId);
  const { data: userReview } = useUserReview(courseId);
  const submitReview = useSubmitReview();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [title, setTitle] = useState(userReview?.title || "");
  const [content, setContent] = useState(userReview?.content || "");

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await submitReview.mutateAsync({
        courseId,
        rating,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
      });
      toast.success(userReview ? "Review updated!" : "Review submitted!");
      setShowReviewForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  const canReview = user && isEnrolled;

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="text-5xl font-bold text-foreground">
                  {ratingData?.averageRating.toFixed(1) || "0.0"}
                </span>
                <div>
                  <StarRating rating={Math.round(ratingData?.averageRating || 0)} size="lg" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {ratingData?.totalReviews || 0} reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <RatingBreakdown reviews={reviews || []} />
          </div>

          {/* Write Review Button */}
          {canReview && !showReviewForm && (
            <div className="mt-6 pt-6 border-t border-border">
              <Button
                onClick={() => {
                  setRating(userReview?.rating || 0);
                  setTitle(userReview?.title || "");
                  setContent(userReview?.content || "");
                  setShowReviewForm(true);
                }}
                variant="outline"
                className="w-full"
              >
                {userReview ? "Edit Your Review" : "Write a Review"}
              </Button>
            </div>
          )}

          {!user && (
            <p className="mt-6 pt-6 border-t border-border text-center text-muted-foreground">
              Sign in to leave a review
            </p>
          )}

          {user && !isEnrolled && (
            <p className="mt-6 pt-6 border-t border-border text-center text-muted-foreground">
              Enroll in this course to leave a review
            </p>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{userReview ? "Edit Your Review" : "Write a Review"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Rating
              </label>
              <StarRating rating={rating} onRatingChange={setRating} interactive size="lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Review Title (optional)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Review (optional)
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitReview}
                disabled={submitReview.isPending}
                className="flex-1"
              >
                {submitReview.isPending ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">Student</span>
                      {review.is_verified_purchase && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="mt-1">
                      <StarRating rating={review.rating} size="sm" />
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-foreground mt-2">{review.title}</h4>
                    )}

                    {review.content && (
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                        {review.content}
                      </p>
                    )}

                    {review.helpful_count > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <ThumbsUp className="w-4 h-4" />
                        {review.helpful_count} found this helpful
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Be the first to review this course!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseReviews;
