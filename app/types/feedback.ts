/**
 * User information included in rating and comment responses
 */
export interface UserInfo {
  id: number;
  name: string;
  email: string;
}

/**
 * Represents a user's rating of a dish
 */
export interface Rating {
  id: number;
  /** Rating value (typically 1-5) */
  rating: number;
  /** ID of the user who created the rating */
  userId: number;
  /** ID of the dish being rated */
  dishId: number;
  /** When the rating was created */
  createdAt: string;
  /** User information */
  user: UserInfo;
}

/**
 * Represents a user's comment on a dish
 */
export interface Comment {
  id: number;
  /** The comment text */
  text: string;
  /** ID of the user who created the comment */
  userId: number;
  /** ID of the dish being commented on */
  dishId: number;
  /** When the comment was created */
  createdAt: string;
  /** User information */
  user: UserInfo;
}
