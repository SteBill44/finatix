import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Gift, Users, CheckCircle, Clock, Share2, Trophy, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralCode, useReferralStats, useMyReferrals, useApplyReferralCode } from '@/hooks/useReferrals';
import { Navigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { format } from 'date-fns';

export default function Referrals() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [referralCodeInput, setReferralCodeInput] = useState('');
  
  const { data: referralCode, isLoading: codeLoading } = useReferralCode();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const { data: referrals, isLoading: referralsLoading } = useMyReferrals();
  const applyCode = useApplyReferralCode();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const copyToClipboard = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = async () => {
    if (!referralCode) return;
    
    const shareUrl = `${window.location.origin}/auth?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Finatix - CIMA Learning Platform',
          text: `Use my referral code ${referralCode} to get started!`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link with your friends",
      });
    }
  };

  const handleApplyCode = async () => {
    if (!referralCodeInput.trim()) return;
    
    try {
      await applyCode.mutateAsync(referralCodeInput);
      toast({
        title: "Success!",
        description: "Referral code applied successfully",
      });
      setReferralCodeInput('');
    } catch (error: any) {
      toast({
        title: "Failed to apply code",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isLoading = codeLoading || statsLoading;

  return (
    <>
      <SEOHead
        title="Referrals | Finatix"
        description="Invite friends to Finatix and earn rewards. Share your unique referral code and track your referral progress."
      />
      
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Invite Friends, Earn Rewards</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Share your unique referral code with friends. When they sign up and complete their first lesson, you both earn rewards!
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-3xl font-bold">{stats?.pendingReferrals || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-3xl font-bold">{stats?.completedReferrals || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <p className="text-3xl font-bold">{stats?.totalCredits || 0}</p>
                <p className="text-sm text-muted-foreground">Credits Earned</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Referral Code
                </CardTitle>
                <CardDescription>
                  Share this code with friends to invite them to Finatix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-2xl font-bold tracking-wider text-center">
                    {isLoading ? (
                      <div className="h-8 bg-muted-foreground/20 rounded animate-pulse" />
                    ) : (
                      referralCode || 'Loading...'
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copyToClipboard}
                    disabled={!referralCode}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={shareReferralLink}
                  disabled={!referralCode}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Invite Link
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Apply Referral Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Have a Referral Code?</CardTitle>
                <CardDescription>
                  Enter a friend's referral code to connect your accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter referral code"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    className="font-mono tracking-wider uppercase"
                    maxLength={12}
                  />
                  <Button 
                    onClick={handleApplyCode}
                    disabled={!referralCodeInput.trim() || applyCode.isPending}
                  >
                    {applyCode.isPending ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>
                  Track the status of friends you've invited
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referralsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : referrals && referrals.length > 0 ? (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div 
                        key={referral.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={referral.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {referral.profiles?.full_name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {referral.profiles?.full_name || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {format(new Date(referral.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                          {referral.status === 'completed' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No referrals yet</p>
                    <p className="text-sm">Share your code to start earning rewards!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="font-semibold mb-1">Share Your Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Copy your unique referral code and share it with friends
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="font-semibold mb-1">Friend Signs Up</h3>
                    <p className="text-sm text-muted-foreground">
                      Your friend creates an account using your referral code
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="font-semibold mb-1">Both Earn Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      When they complete their first lesson, you both earn credits!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
