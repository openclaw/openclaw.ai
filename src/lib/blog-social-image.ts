export type BlogSocialImage = {
  src: string;
  width: number;
  height: number;
  type: 'image/png' | 'image/jpeg' | 'image/webp';
};

export function resolveBlogSocialImage(
  postId: string,
  image?: BlogSocialImage,
): BlogSocialImage {
  return image ?? {
    src: `/og/blog/${postId}.png`,
    width: 1200,
    height: 630,
    type: 'image/png',
  };
}
