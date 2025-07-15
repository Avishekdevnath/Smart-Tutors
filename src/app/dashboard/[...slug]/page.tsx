import { NotFoundPage } from '@/components/ErrorPage';

interface CatchAllPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const attemptedPath = `/dashboard/${slug.join('/')}`;
  
  return (
    <NotFoundPage 
      title="Dashboard Page Not Found"
      message={`The dashboard page "${attemptedPath}" doesn't exist. Please check the URL or navigate using the sidebar.`}
    />
  );
} 