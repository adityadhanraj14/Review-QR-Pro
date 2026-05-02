import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Sparkles, PenLine } from 'lucide-react';
import { publicService } from '../../services/public.service.js';
import { brand } from '../../theme/brand.js';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { StarRatingRow } from '../../components/customer/StarRatingRow.jsx';

function getSessionId() {
  let s = sessionStorage.getItem('reviewqr_sid');
  if (!s) {
    s = crypto.randomUUID();
    sessionStorage.setItem('reviewqr_sid', s);
  }
  return s;
}

const CUSTOM_MIN_LEN = 20;

export default function CustomerReviewPage() {
  const { slug } = useParams();
  const [biz, setBiz] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [contact, setContact] = useState('');
  const [done, setDone] = useState(false);
  const [ownReviewText, setOwnReviewText] = useState('');

  const sessionId = getSessionId();

  const log = useCallback(
    async (type, extra = {}) => {
      try {
        await publicService.logAnalytics({ slug, type, sessionId, ...extra });
      } catch {
        /* ignore */
      }
    },
    [slug, sessionId]
  );

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await publicService.getBusiness(slug);
        if (cancelled) return;
        setBiz(data.data);
        await log('scan');
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
          toast.error('Invalid or inactive link');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, log]);

  const onPickStars = async (r) => {
    setRating(r);
    await log('rating_selected', { rating: r });
    if (r >= 4) {
      setLoadingAi(true);
      setOwnReviewText('');
      try {
        const { data } = await publicService.generateReviews(slug, r, sessionId);
        setReviews(data.data.reviews || []);
      } catch (e) {
        toast.error(e.message || 'Could not load suggestions');
      } finally {
        setLoadingAi(false);
      }
    }
  };

  const onPickReview = async (text, index) => {
    if (!biz?.placeId) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast.error('Could not copy — try typing your own review below.');
      return;
    }
    toast.success(
      'Copied to clipboard. Google will open in a moment — paste your review in the box there if needed.',
      { duration: 5000 }
    );
    await Promise.all([
      log('review_selected', { rating, reviewIndex: index, source: 'ai' }),
      log('google_redirect', { rating, reviewIndex: index, source: 'ai' }),
    ]);
    const url = `${brand.googleReviewBaseUrl}${encodeURIComponent(biz.placeId)}`;
    window.setTimeout(() => {
      window.location.href = url;
    }, brand.redirectDelayMs);
  };

  const onCopyOwnAndOpenGoogle = async () => {
    if (!biz?.placeId) return;
    const t = ownReviewText.trim();
    if (t.length < CUSTOM_MIN_LEN) {
      toast.error(`Please write at least ${CUSTOM_MIN_LEN} characters, or pick a suggestion above.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      toast.error('Could not copy from this browser.');
      return;
    }
    toast.success(
      'Copied to clipboard. Google will open in a moment — paste your review in the box there.',
      { duration: 5000 }
    );
    await Promise.all([
      log('review_selected', { rating, source: 'custom' }),
      log('google_redirect', { rating, source: 'custom' }),
    ]);
    const url = `${brand.googleReviewBaseUrl}${encodeURIComponent(biz.placeId)}`;
    window.setTimeout(() => {
      window.location.href = url;
    }, brand.redirectDelayMs);
  };

  const onSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please add a short note');
      return;
    }
    try {
      await publicService.submitFeedback({
        slug,
        rating,
        feedbackText,
        contact,
        sessionId,
      });
      setDone(true);
      toast.success('Thank you — we appreciate the honesty.');
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    }
  };

  if (loadFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center text-gray-600 dark:text-gray-400 dark:bg-slate-950">
        This review link is not valid.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/50 px-4 py-8 sm:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-xl mx-auto pb-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
            Quick review
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-gray-50 tracking-tight">
            {biz?.name || 'Loading…'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Tap the stars like on Google Maps. Loved it? We&apos;ll help you post on Google. Not quite? Tell us privately.
          </p>
        </div>

        <div className="space-y-10">
          {rating == null && (
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-4 py-8 sm:px-8 dark:bg-slate-900 dark:border-slate-700">
              <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-6">How was your visit?</p>
              <StarRatingRow onSelect={onPickStars} disabled={!biz} />
            </div>
          )}

          {rating != null && rating >= 4 && (
            <div className="space-y-8">
              {loadingAi && (
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm animate-pulse py-8">
                  Preparing suggestions…
                </p>
              )}
              {!loadingAi && reviews.length > 0 && (
                <>
                  <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                    You chose <span className="font-semibold text-slate-900 dark:text-white">{rating} stars</span>. Start with a
                    suggestion, or scroll down and write your own — both copy your text and open Google.
                  </p>

                  <div className="space-y-8">
                    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 dark:bg-slate-900 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-semibold text-sm mb-1">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        Suggestions
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Tap a card — we copy it and open Google.</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
                        {reviews.map((text, i) => (
                          <Card
                            key={i}
                            className="min-w-[88%] sm:min-w-[240px] snap-center cursor-pointer border-slate-200 hover:border-primary-300 hover:shadow-md transition-all dark:border-slate-600 dark:hover:border-primary-500 dark:bg-slate-800/50"
                            onClick={() => onPickReview(text, i)}
                          >
                            <CardContent className="text-left text-sm text-slate-800 dark:text-slate-200 leading-relaxed py-4">
                              {text}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="relative flex items-center gap-3" aria-hidden="true">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-600" />
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        or
                      </span>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-600" />
                    </div>

                    <div className="rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-sm p-5 sm:p-6 ring-1 ring-amber-100 dark:bg-amber-950/30 dark:border-amber-800/60 dark:ring-amber-900/40">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold text-sm mb-1">
                        <PenLine className="h-4 w-4 shrink-0" />
                        Your own words
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Nothing is saved on our servers — only you and Google see this. Write at least{' '}
                        {CUSTOM_MIN_LEN} characters.
                      </p>
                      <textarea
                        className="input min-h-[140px] text-sm"
                        placeholder="Write the review exactly as you want it to appear on Google…"
                        value={ownReviewText}
                        onChange={(e) => setOwnReviewText(e.target.value)}
                      />
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {ownReviewText.trim().length}/{CUSTOM_MIN_LEN}+ characters
                      </p>
                      <Button className="w-full mt-4" variant="cta" onClick={onCopyOwnAndOpenGoogle}>
                        Copy my text &amp; open Google
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-slate-600 dark:text-slate-400"
                    onClick={() => {
                      setRating(null);
                      setReviews([]);
                      setOwnReviewText('');
                    }}
                  >
                    Change rating
                  </Button>
                </>
              )}
            </div>
          )}

          {rating != null && rating <= 3 && !done && (
            <Card className="border-slate-200 shadow-sm dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">We&apos;re sorry it wasn&apos;t great</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You chose {rating}★ — this message stays{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">private</span>{' '}
                  (not posted to Google).
                </p>
                <textarea
                  className="input min-h-[120px]"
                  placeholder="What went wrong? What could we improve?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <Input
                  label="Contact (optional)"
                  placeholder="Phone or email (optional)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                <Button className="w-full" variant="cta" onClick={onSubmitFeedback}>
                  Send feedback
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setRating(null);
                    setFeedbackText('');
                  }}
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          )}

          {rating != null && rating <= 3 && done && (
            <Card className="border-slate-200 shadow-sm dark:border-slate-700">
              <CardContent className="py-12 text-center text-slate-700 dark:text-slate-300">
                Thanks — we read every note.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
