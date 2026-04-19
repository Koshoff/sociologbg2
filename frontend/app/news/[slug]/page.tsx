import { Metadata } from 'next';
import ArticleClient from './ArticleClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sources: string | null;
  category: string | null;
  status: string;
  surveyId: string | null;
  surveyTitle: string | null;
  surveyClosesAt: string | null;
  createdAt: string;
  publishedAt: string | null;
  imageUrl: string | null;
}

async function getArticle(slug: string): Promise<Article> {
  const res = await fetch(`${API_URL}/api/articles/${slug}`, {
    cache: 'no-store'
  });
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.summary,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.summary,
      type: 'article',
      publishedTime: article.publishedAt || article.createdAt,
      ...(article.imageUrl ? { images: [{ url: article.imageUrl }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return <ArticleClient article={article} />;
}
