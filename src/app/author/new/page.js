import { getSessionUser } from '@/lib/auth';
import DashboardLoginPrompt from '@/components/DashboardLoginPrompt';
import CreatePostClient from '@/components/CreatePostClient';

export default async function NewPost() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DashboardLoginPrompt />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <CreatePostClient authorId={user.id} />
    </div>
  );
}
