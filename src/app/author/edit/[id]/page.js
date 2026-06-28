import { getSessionUser } from '@/lib/auth';
import { getPostById } from '@/lib/db';
import DashboardLoginPrompt from '@/components/DashboardLoginPrompt';
import EditPostClient from '@/components/EditPostClient';
import Button3D from '@/components/Button3D';

export default async function EditPost({ params }) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DashboardLoginPrompt />
      </div>
    );
  }

  const post = await getPostById(id);

  if (!post) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="soft-pop-card" style={{
          textAlign: 'center',
          backgroundColor: 'var(--color-white)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-red)', marginBottom: '12px' }}>
            Story Not Found
          </h2>
          <p style={{ color: 'var(--color-grey-dark)', marginBottom: '24px' }}>
            The article you are trying to edit does not exist or may have been deleted.
          </p>
          <Button3D href="/author" variant="orange">
            Back to Dashboard
          </Button3D>
        </div>
      </div>
    );
  }

  // Ensure author owns the post
  if (post.author_id !== user.id) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="soft-pop-card" style={{
          textAlign: 'center',
          backgroundColor: 'var(--color-white)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-red)', marginBottom: '12px' }}>
            Access Denied
          </h2>
          <p style={{ color: 'var(--color-grey-dark)', marginBottom: '24px' }}>
            You do not have permission to edit this story. Authors can only modify their own publications.
          </p>
          <Button3D href="/author" variant="orange">
            Back to Dashboard
          </Button3D>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <EditPostClient post={post} authorId={user.id} />
    </div>
  );
}
