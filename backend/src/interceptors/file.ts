import { createUploadthing, type FileRouter } from 'uploadthing/express';

const f = createUploadthing();

export const uploadRouter = {
  bannerUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  }).onUploadComplete((data) => {
  }),

  coverUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  }).onUploadComplete((data) => {
  }),

  fileUploader: f({
    blob: { maxFileCount: 1, maxFileSize: '1GB' },
  }).onUploadComplete((data) => {
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
