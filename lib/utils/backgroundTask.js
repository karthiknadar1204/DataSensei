export async function runInBackground(task) {
  // Fire and forget - don't await the promise
  task().catch(error => {
    console.error('Background task error:', error);
  });
} 