 export interface PostPageVo {
   id: string;
   title: string;
   content: string;
   summary: string;
   authorName: string;
   categoryName: string;
   viewCount: number;
   likeCount: number;
   commentCount: number;
   isPinned: boolean;
   status: number;
   userId?: string;
   createTime: string;
   aiReviewed: number;
   aiReviewScore: number;
   postType?: string;
   promptMetadata?: string;
   forkedFromId?: string;
   versionCount?: number;
 }

 export interface PromptVersion {
   id: string;
   postId: string;
   version: number;
   branch: string;
   title: string;
   content: string;
   promptMetadata?: string;
   changeNote?: string;
   createdBy: string;
   authorName: string;
   createTime: string;
 }

 export interface Channel {
   id: number;
   slug: string;
   name: string;
   description: string;
   icon?: string;
 }

 export interface Comment {
   id: string;
   postId: string;
   authorName: string;
   content: string;
   userId: string;
   createTime: string;
 }

 export interface PageResponse<T> {
   list: T[];
   total: string;
   page: number;
   size: number;
   pages: number;
 }

 export interface AiLog {
   id: string;
   postId: string;
   postTitle: string;
   reviewer: string;
   severity: string;
   isApproved: number;
   createdAt: string;
 }

 export interface AiLogStats {
   totalReviews: number;
   approved: number;
   flagged: number;
   critical: number;
   high: number;
   medium: number;
   low: number;
   unknown: number;
 }
