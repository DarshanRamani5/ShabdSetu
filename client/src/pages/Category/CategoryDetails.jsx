import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import { RouteAddCategory, RouteEditCategory } from '@/helpers/RouteName';
import { useFetch } from '@/hooks/useFetch';
import { getEnv } from '@/helpers/getEnv';
import Loading from '@/components/Loading';
import { FiEdit } from 'react-icons/fi';
import { FaRegTrashAlt } from 'react-icons/fa';
import { deleteData } from '@/helpers/handleDelete';
import { showToast } from '@/helpers/showToast';
import { Sparkles, FolderKanban } from 'lucide-react';

const normalizeCategories = (raw) => (Array.isArray(raw) ? raw : []);

const getCategoryVisual = (name = '') => {
  if (!name) return { emoji: '📁', label: 'Untitled' };
  const emojiMatch = name.match(/^(\p{Extended_Pictographic})\s*(.*)$/u);
  if (emojiMatch) {
    return {
      emoji: emojiMatch[1],
      label: emojiMatch[2] ? emojiMatch[2].trim() : 'Untitled',
    };
  }
  return { emoji: '📁', label: name };
};

const getPostCount = (category, blogs = []) => {
  if (Array.isArray(category?.blogs)) {
    return category.blogs.length;
  }

  if (Array.isArray(blogs) && blogs.length > 0) {
    const id = category?._id;
    const name = (category?.name || '')?.toString().toLowerCase();

    let matched = 0;
    for (const blog of blogs) {
      if (Array.isArray(blog?.categories) && blog.categories.length) {
        for (const c of blog.categories) {
          if (!c) continue;
          if (typeof c === 'string') {
            if (name && c.toLowerCase() === name) {
              matched++;
              break;
            }
          } else if (typeof c === 'object') {
            if (id && (c._id === id || c.id === id)) {
              matched++;
              break;
            }
            if (c.name && name && c.name.toLowerCase() === name) {
              matched++;
              break;
            }
          }
        }
        continue;
      }

      const c = blog?.category;
      if (!c) continue;
      if (Array.isArray(c)) {
        for (const entry of c) {
          if (!entry) continue;
          if (typeof entry === 'string') {
            if (name && entry.toLowerCase() === name) {
              matched++;
              break;
            }
          } else if (typeof entry === 'object') {
            if (id && (entry._id === id || entry.id === id)) {
              matched++;
              break;
            }
            if (entry.name && name && entry.name.toLowerCase() === name) {
              matched++;
              break;
            }
          }
        }
        continue;
      }

      if (typeof c === 'string') {
        if (name && c.toLowerCase() === name) matched++;
      } else if (typeof c === 'object') {
        if (id && (c._id === id || c.id === id)) matched++;
        else if (c.name && name && c.name.toLowerCase() === name) matched++;
      }
    }

    return matched;
  }

  const count = category?.blogCount ?? category?.postCount ?? category?.postsCount ?? category?.count ?? 0;
  return Number.isFinite(count) ? count : 0;
};

const ACCENT_PILLS = [
  'from-[#6C5CE7] via-[#7C6BEE] to-[#8B5CF6]',
  'from-[#F97316] via-[#FB923C] to-[#FDBA74]',
  'from-[#10B981] via-[#34D399] to-[#6EE7B7]',
  'from-[#3B82F6] via-[#60A5FA] to-[#93C5FD]',
];

const CategoryDetails = () => {
  const [refreshData, setRefreshData] = useState(false);

  const categoriesEndpoint = `${getEnv('VITE_API_BASE_URL')}/category/all-category`;

  const { data: categoryData, loading, error } = useFetch(
    categoriesEndpoint,
    {
      method: 'get',
      credentials: 'include',
    },
    [refreshData, categoriesEndpoint],
  );

  const categories = useMemo(
    () => normalizeCategories(categoryData?.category),
    [categoryData],
  );

  const blogsEndpoint = `${getEnv('VITE_API_BASE_URL')}/blog/get-all`;
  const { data: blogData, loading: blogsLoading, error: blogsError } = useFetch(
    blogsEndpoint,
    { method: 'get', credentials: 'include' },
    [blogsEndpoint],
  );

  const blogs = Array.isArray(blogData?.blog) ? blogData.blog : [];

  const handleDelete = async (id) => {
    const deleted = await deleteData(`${getEnv('VITE_API_BASE_URL')}/category/delete/${id}`);
    if (deleted) {
      setRefreshData((prev) => !prev);
      showToast('success', 'Data deleted.');
    } else {
      showToast('error', 'Data not deleted.');
    }
  };

  if (loading || blogsLoading) return <Loading />;
  if (error || blogsError) {
    return (
      <div className="px-4 py-6 text-center text-sm text-red-500">
        Error loading data: {(error || blogsError)?.message}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 lg:px-12">
      <BackButton />
      <section className="relative mb-10 overflow-hidden rounded-[40px] bg-[#6C5CE7] px-6 py-12 text-white shadow-[0_35px_80px_-45px_rgba(15,23,42,0.9)] sm:px-10">
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-16 h-56 w-56 translate-y-1/2 rounded-full bg-purple-300/40 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">Manage Categories</h1>
            <p className="text-base text-white/80">
              Shape the reading journey by curating categories that feel personal, organized, and on-brand.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                <FolderKanban className="h-4 w-4" />
                {categories.length} active categories
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto">
            <Button
              asChild
              className="rounded-full bg-white px-8 py-4 font-semibold text-[#6C5CE7] shadow-lg shadow-purple-400/40 hover:bg-white/90"
            >
              <Link to={RouteAddCategory}>Create category</Link>
            </Button>
            <p className="text-xs text-white/60 md:text-right">
              Need inspiration? Try grouping by intent, not topic.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-10" />

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category, index) => {
            const { emoji, label } = getCategoryVisual(category?.name || '');
            const postsCount = getPostCount(category, blogs);
            const accent = ACCENT_PILLS[index % ACCENT_PILLS.length];

            return (
              <div
                key={category._id}
                className="rounded-[28px] border border-slate-100 bg-white/95 p-6 shadow-[0_25px_70px_-55px_rgba(15,23,42,0.7)] transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${accent} text-2xl text-white shadow-lg`}
                    >
                      {emoji}
                    </div>
                    <div className="relative ">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Category</p>
                      <h3 className="text-xl font-semibold text-slate-900">{label}</h3>
                    </div>
                  </div>
                  {category?.slug && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      {category.slug}
                    </span>
                  )}
                </div>

                <div className="my-5 border-t border-slate-100" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Posts</p>
                    <p className="text-3xl font-black text-slate-900">{postsCount}</p>
                    <p className="text-xs text-slate-500">Linked Blogs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="rounded-full border border-slate-200 hover:border-[#6C5CE7]/40"
                    >
                      <Link to={RouteEditCategory(category._id)} className="flex items-center gap-2">
                        <FiEdit className="h-4 w-4 text-slate-600" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category._id)}
                      className="rounded-full border border-red-100 text-red-500 hover:border-red-200"
                    >
                      <FaRegTrashAlt className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-4xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center text-slate-500">
          <p className="text-lg font-semibold">No categories yet.</p>
          <p className="mt-2 text-sm">Spark inspiration by creating your first collection.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryDetails;
