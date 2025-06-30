import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  Globe, 
  Users, 
  Share2, 
  Calendar, 
  Phone, 
  Mail, 
  Building, 
  Link,
  Target,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Star,
  TrendingUp,
  Snowflake,
  Crown,
  Flame,
  UserX,
  BookX,
  CalendarCheck,
  Award,
  Zap,
  HelpCircle,
  Sparkles,
  Wifi,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MapPin,
  PhoneCall,
  Send,
  Megaphone,
  UserPlus,
  PartyPopper,
  ShoppingCart,
  ThumbsDown,
  Ban,
  AlertTriangle,
  Pause,
  Play,
  FastForward,
  Trophy,
  Gift,
  Heart,
  Handshake,
  Eye,
  EyeOff,
  Hourglass,
  Timer,
  Rocket,
  Diamond,
  Gem,
  Coins,
  DollarSign
} from "lucide-react"

const enhancedBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-xl border font-medium transition-all duration-200 hover:shadow-md hover:scale-105 cursor-default group",
  {
    variants: {
      variant: {
        // Source variants with unique colors
        website: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-700 shadow-blue-200",
        websiteform: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-700 shadow-cyan-200",
        referral: "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-700 shadow-green-200",
        social: "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-700 shadow-purple-200",
        instagram: "bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-700 shadow-pink-200",
        facebook: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-800 shadow-blue-200",
        twitter: "bg-gradient-to-r from-sky-400 to-sky-500 text-white border-sky-600 shadow-sky-200",
        linkedin: "bg-gradient-to-r from-blue-700 to-blue-800 text-white border-blue-900 shadow-blue-200",
        youtube: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700 shadow-red-200",
        event: "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-700 shadow-orange-200",
        coldcall: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-700 shadow-indigo-200",
        email: "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-700 shadow-teal-200",
        partner: "bg-gradient-to-r from-violet-500 to-violet-600 text-white border-violet-700 shadow-violet-200",
        advertisement: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-700 shadow-amber-200",
        walkin: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-700 shadow-emerald-200",
        other: "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-700 shadow-gray-200",
        
        // Status variants with unique colors for each status
        hot: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700 shadow-red-200",
        warm: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-700 shadow-amber-200",
        cold: "bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-600 shadow-blue-200",
        won: "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-700 shadow-green-200",
        converted: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-700 shadow-emerald-200",
        open: "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-700 shadow-orange-200",
        new: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-700 shadow-cyan-200",
        contacted: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-700 shadow-blue-200",
        qualified: "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-700 shadow-purple-200",
        nurturing: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-700 shadow-indigo-200",
        proposal: "bg-gradient-to-r from-violet-500 to-violet-600 text-white border-violet-700 shadow-violet-200",
        negotiation: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-700 shadow-yellow-200",
        // Red variants for negative statuses
        lost: "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-800 shadow-red-200",
        disqualified: "bg-gradient-to-r from-red-700 to-red-800 text-white border-red-900 shadow-red-200",
        unresponsive: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700 shadow-red-200",
        rejected: "bg-gradient-to-r from-red-800 to-red-900 text-white border-red-950 shadow-red-200",
        
        // Stage variants with unique colors
        newenquiry: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-700 shadow-cyan-200",
        initialcontact: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-700 shadow-blue-200",
        followup: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-700 shadow-indigo-200",
        demo: "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-700 shadow-purple-200",
        trialscheduled: "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-700 shadow-orange-200",
        trialcompleted: "bg-gradient-to-r from-orange-600 to-orange-700 text-white border-orange-800 shadow-orange-200",
        proposal: "bg-gradient-to-r from-violet-500 to-violet-600 text-white border-violet-700 shadow-violet-200",
        negotiation: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-700 shadow-yellow-200",
        membershipsold: "bg-gradient-to-r from-green-600 to-green-700 text-white border-green-800 shadow-green-200",
        closedwon: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-800 shadow-emerald-200",
        notinterested: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700 shadow-red-200",
        closedlost: "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-800 shadow-red-200",
        
        // Default variants
        default: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
        outline: "border-gray-300 text-gray-700 hover:bg-gray-50",
      },
      size: {
        sm: "px-1.5 py-1 text-xs h-6 min-w-[24px]",
        md: "px-2 py-1.5 text-xs h-7 min-w-[28px]",
        lg: "px-3 py-2 text-sm h-8 min-w-[32px]",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Premium icon mapping for different categories
const getSourceIcon = (source: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Website': <Globe className="h-3.5 w-3.5" />,
    'Website Form': <FileText className="h-3.5 w-3.5" />,
    'Referral': <UserPlus className="h-3.5 w-3.5" />,
    'Social Media': <Share2 className="h-3.5 w-3.5" />,
    'Instagram': <Instagram className="h-3.5 w-3.5" />,
    'Facebook': <Facebook className="h-3.5 w-3.5" />,
    'Twitter': <Twitter className="h-3.5 w-3.5" />,
    'LinkedIn': <Linkedin className="h-3.5 w-3.5" />,
    'YouTube': <Youtube className="h-3.5 w-3.5" />,
    'Event': <PartyPopper className="h-3.5 w-3.5" />,
    'Cold Call': <PhoneCall className="h-3.5 w-3.5" />,
    'Email Campaign': <Send className="h-3.5 w-3.5" />,
    'Partner': <Handshake className="h-3.5 w-3.5" />,
    'Advertisement': <Megaphone className="h-3.5 w-3.5" />,
    'Walk-in': <MapPin className="h-3.5 w-3.5" />,
    'Other': <HelpCircle className="h-3.5 w-3.5" />
  };
  return icons[source] || <Link className="h-3.5 w-3.5" />;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Hot': <Flame className="h-3.5 w-3.5" />,
    'Warm': <TrendingUp className="h-3.5 w-3.5" />,
    'Cold': <Snowflake className="h-3.5 w-3.5" />,
    'Won': <Trophy className="h-3.5 w-3.5" />,
    'Converted': <Crown className="h-3.5 w-3.5" />,
    'Open': <Eye className="h-3.5 w-3.5" />,
    'New': <Sparkles className="h-3.5 w-3.5" />,
    'Contacted': <Phone className="h-3.5 w-3.5" />,
    'Qualified': <CheckCircle className="h-3.5 w-3.5" />,
    'Nurturing': <Heart className="h-3.5 w-3.5" />,
    'Proposal': <FileText className="h-3.5 w-3.5" />,
    'Negotiation': <Handshake className="h-3.5 w-3.5" />,
    'Lost': <XCircle className="h-3.5 w-3.5" />,
    'Disqualified': <Ban className="h-3.5 w-3.5" />,
    'Unresponsive': <EyeOff className="h-3.5 w-3.5" />,
    'Rejected': <ThumbsDown className="h-3.5 w-3.5" />
  };
  return icons[status] || <HelpCircle className="h-3.5 w-3.5" />;
};

const getStageIcon = (stage: string) => {
  const icons: Record<string, React.ReactNode> = {
    'New Enquiry': <Zap className="h-3.5 w-3.5" />,
    'Initial Contact': <PhoneCall className="h-3.5 w-3.5" />,
    'Follow-up': <Timer className="h-3.5 w-3.5" />,
    'Demo': <Play className="h-3.5 w-3.5" />,
    'Trial Scheduled': <CalendarCheck className="h-3.5 w-3.5" />,
    'Trial Completed': <CheckCircle className="h-3.5 w-3.5" />,
    'Proposal': <FileText className="h-3.5 w-3.5" />,
    'Negotiation': <Handshake className="h-3.5 w-3.5" />,
    'Membership Sold': <Trophy className="h-3.5 w-3.5" />,
    'Closed Won': <Crown className="h-3.5 w-3.5" />,
    'Not Interested': <ThumbsDown className="h-3.5 w-3.5" />,
    'Closed Lost': <XCircle className="h-3.5 w-3.5" />
  };
  return icons[stage] || <Target className="h-3.5 w-3.5" />;
};

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedBadgeVariants> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  showTextOnHover?: boolean
  badgeType?: "source" | "status" | "stage"
  value?: string
}

function EnhancedBadge({ 
  className, 
  variant, 
  size, 
  icon, 
  iconPosition = "left",
  showTextOnHover = false,
  badgeType,
  value,
  children,
  ...props 
}: EnhancedBadgeProps) {
  // Auto-select icon based on badge type and value
  const autoIcon = React.useMemo(() => {
    if (icon) return icon;
    if (!badgeType || !value) return null;
    
    switch (badgeType) {
      case 'source':
        return getSourceIcon(value);
      case 'status':
        return getStatusIcon(value);
      case 'stage':
        return getStageIcon(value);
      default:
        return null;
    }
  }, [icon, badgeType, value]);

  if (showTextOnHover) {
    return (
      <div className={cn(enhancedBadgeVariants({ variant, size }), className)} {...props}>
        {/* Icon only by default */}
        <span className="group-hover:hidden">
          {autoIcon}
        </span>
        {/* Text on hover with expanded width */}
        <span className="hidden group-hover:inline-flex items-center gap-1 px-1 whitespace-nowrap text-xs">
          {autoIcon}
          {children || value}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(enhancedBadgeVariants({ variant, size }), className)} {...props}>
      {autoIcon && iconPosition === "left" && (
        <span className="flex-shrink-0">
          {autoIcon}
        </span>
      )}
      
      {(children || value) && (
        <span className="truncate ml-1">
          {children || value}
        </span>
      )}
      
      {autoIcon && iconPosition === "right" && (
        <span className="flex-shrink-0 ml-1">
          {autoIcon}
        </span>
      )}
    </div>
  )
}

export { EnhancedBadge, enhancedBadgeVariants, getSourceIcon, getStatusIcon, getStageIcon }