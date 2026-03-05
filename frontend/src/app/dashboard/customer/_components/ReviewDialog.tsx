import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

export default function ReviewDialog({ bookingId, onReviewSubmitted }: { bookingId: string, onReviewSubmitted: () => void }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ title: "Error", description: "Please select a star rating.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/reviews', {
                bookingId,
                rating,
                comment,
            });

            if (res.data.success) {
                toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
                setOpen(false);
                onReviewSubmitted();
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to submit review",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="button-outline text-sm py-2 px-4 shadow-sm w-auto">
                    ✍️ WRITE REVIEW
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-extrabold text-slate-800 tracking-tight">Rate your mechanic</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mt-1">
                        How was your experience? Your feedback helps us maintain quality service.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star
                                    className={`h-10 w-10 transition-colors ${star <= (hoverRating || rating)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-200'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="w-full">
                        <label htmlFor="comment" className="text-sm font-bold text-slate-700 block mb-2">
                            Add a comment (Optional)
                        </label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about the service..."
                            className="resize-none h-24"
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-stretch">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || rating === 0}
                        className="w-full font-bold text-md py-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Submit Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
