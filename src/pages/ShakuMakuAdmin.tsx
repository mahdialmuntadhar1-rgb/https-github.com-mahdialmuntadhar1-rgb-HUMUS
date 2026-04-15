import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Building2,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { useShakuMakuPosts, ShakuMakuPost } from '@/hooks/useShakuMakuPosts';
import { useAuthStore } from '@/stores/authStore';

export default function ShakuMakuAdmin() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  
  const {
    posts,
    businesses,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    deleteDemoPosts,
    createDemoPosts
  } = useShakuMakuPosts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<ShakuMakuPost | null>(null);
  const [formData, setFormData] = useState({
    businessId: '',
    caption: '',
    imageUrl: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessId || !formData.caption || !formData.imageUrl) {
      alert('Please fill all fields');
      return;
    }

    const success = await createPost(formData.businessId, formData.caption, formData.imageUrl);
    if (success) {
      setShowCreateModal(false);
      setFormData({ businessId: '', caption: '', imageUrl: '' });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !formData.caption || !formData.imageUrl) {
      alert('Please fill all fields');
      return;
    }

    const success = await updatePost(editingPost.id, formData.caption, formData.imageUrl);
    if (success) {
      setShowEditModal(false);
      setEditingPost(null);
      setFormData({ businessId: '', caption: '', imageUrl: '' });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const success = await deletePost(postId);
    if (success) {
      console.log('[ShakuMaku Admin] Post deleted');
    }
  };

  const openEditModal = (post: ShakuMakuPost) => {
    setEditingPost(post);
    setFormData({
      businessId: post.businessId,
      caption: post.caption,
      imageUrl: post.image_url || post.imageUrl
    });
    setShowEditModal(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-[#2B2F33]">Admin access required</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2F33] poppins-bold">Shaku Maku Content Manager</h1>
          <p className="text-sm text-[#6B7280] mt-1">Create, edit, and manage Shaku Maku posts</p>
        </div>
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl hover:border-primary hover:text-primary transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-bold">Refresh</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Demo Content Tools */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#2B2F33]">Demo Content Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => createDemoPosts(10, false)}
            disabled={loading}
            className="px-4 py-3 bg-[#0F7B6C] hover:bg-[#0d6b5e] text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Create 10 Demo Posts
          </button>
          <button
            onClick={() => createDemoPosts(30, false)}
            disabled={loading}
            className="px-4 py-3 bg-[#0F7B6C] hover:bg-[#0d6b5e] text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Create 30 Demo Posts
          </button>
          <button
            onClick={() => createDemoPosts(20, true)}
            disabled={loading}
            className="px-4 py-3 bg-[#C8A96A] hover:bg-[#b49558] text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Mixed Category Demo
          </button>
          <button
            onClick={deleteDemoPosts}
            disabled={loading}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Delete Demo Posts
          </button>
        </div>
        <p className="text-xs text-[#6B7280]">
          Demo posts are marked with is_demo flag and can be safely deleted
        </p>
      </div>

      {/* Create New Post Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full px-4 py-3 bg-primary hover:bg-[#0d6b5e] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create New Post
      </button>

      {/* Posts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#2B2F33]">Posts ({posts.length})</h2>
        
        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-[#6B7280]">
            No posts found. Create your first post or generate demo content.
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-[#F5F7F9] rounded-xl overflow-hidden">
                    {post.image_url || post.imageUrl ? (
                      <img
                        src={post.image_url || post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#9CA3AF]" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2B2F33] truncate">
                          {post.business?.name || post.businessName || 'Unknown Business'}
                        </p>
                        {post.business && (
                          <p className="text-xs text-[#6B7280]">
                            {post.business.category} • {post.business.city}
                          </p>
                        )}
                      </div>
                      {post.is_demo && (
                        <span className="flex-shrink-0 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                          DEMO
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[#2B2F33] line-clamp-2">
                      {post.caption}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {post.business?.category || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEditModal(post)}
                      className="p-2 hover:bg-[#F5F7F9] rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-[#2B2F33]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#2B2F33]">Create New Post</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-[#F5F7F9] rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2B2F33] mb-2">
                    Select Business
                  </label>
                  <select
                    value={formData.businessId}
                    onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-primary rounded-xl focus:outline-none transition-all"
                    required
                  >
                    <option value="">Choose a business...</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name} ({business.category} - {business.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B2F33] mb-2">
                    Caption
                  </label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Enter caption for the post..."
                    className="w-full px-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-primary rounded-xl focus:outline-none transition-all resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B2F33] mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-primary rounded-xl focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-xl hover:border-primary hover:text-primary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-[#0d6b5e] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Publish'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-[#2B2F33]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#2B2F33]">Edit Post</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-[#F5F7F9] rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2B2F33] mb-2">
                    Business
                  </label>
                  <input
                    type="text"
                    value={editingPost.business?.name || editingPost.businessName || 'Unknown'}
                    disabled
                    className="w-full px-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] rounded-xl text-[#6B7280]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B2F33] mb-2">
                    Caption
                  </label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-primary rounded-xl focus:outline-none transition-all resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B2F33] mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-primary rounded-xl focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-xl hover:border-primary hover:text-primary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-[#0d6b5e] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
