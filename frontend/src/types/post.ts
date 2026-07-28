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
