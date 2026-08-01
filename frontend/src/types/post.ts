 export interface PostPageVo {
   id: number;
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
   createTime: string;
   aiReviewed: number;
   aiReviewScore: number;
   postType?: string;
   promptMetadata?: string;
   forkedFromId?: number;
   versionCount?: number;
 }

 export interface PromptVersion {
   id: number;
   postId: number;
   version: number;
   branch: string;
   title: string;
   content: string;
   promptMetadata?: string;
   changeNote?: string;
   createdBy: number;
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
   id: number;
   postId: number;
   authorName: string;
   content: string;
   userId: number;
   createTime: string;
}
 
 export interface PageResponse<T> {
   list: T[];
   total: number;
   page: number;
   size: number;
   pages: number;
 }

 export interface AiLog {
   id: number;
   postId: number;
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
