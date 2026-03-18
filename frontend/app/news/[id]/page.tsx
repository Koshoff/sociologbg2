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
  status: string;
  surveyId: string | null;
  surveyTitle: string | null;
  createdAt: string;
  publishedAt: string | null;
}

async function getArticle(id: string): Promise<Article> {
  const res = await fetch(`${API_URL}/api/articles/${id}`, {
    cache: 'no-store'
  });
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.summary,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.summary,
      type: 'article',
      publishedTime: article.publishedAt || article.createdAt,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  return <ArticleClient article={article} />;
}