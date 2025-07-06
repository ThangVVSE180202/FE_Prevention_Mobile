// 📰 Blog Service
// Handles all blog and content-related API calls

import { BASE_URL, ENDPOINTS, HTTP_METHODS } from "../../constants/api";

class BlogService {
  // Helper method for making API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get list of blogs (Public)
  async getBlogs(params = {}) {
    const queryParams = new URLSearchParams();

    // Add query parameters if provided
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.category) queryParams.append("category", params.category);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.BLOGS.LIST}?${queryString}`
      : ENDPOINTS.BLOGS.LIST;

    return this.makeRequest(endpoint, {
      method: HTTP_METHODS.GET,
    });
  }

  // Get blog details (Public)
  async getBlogById(blogId) {
    return this.makeRequest(ENDPOINTS.BLOGS.DETAIL(blogId), {
      method: HTTP_METHODS.GET,
    });
  }

  // Get featured blogs
  async getFeaturedBlogs(limit = 5) {
    return this.getBlogs({
      sort: "-createdAt",
      limit,
      featured: true,
    });
  }

  // Get recent blogs
  async getRecentBlogs(limit = 10) {
    return this.getBlogs({
      sort: "-createdAt",
      limit,
    });
  }

  // Search blogs
  async searchBlogs(searchTerm, params = {}) {
    return this.getBlogs({
      ...params,
      search: searchTerm,
    });
  }

  // Get blogs by category
  async getBlogsByCategory(category, params = {}) {
    return this.getBlogs({
      ...params,
      category,
    });
  }

  // Format blog content for display
  formatBlogContent(blog) {
    return {
      ...blog,
      formattedDate: new Date(blog.createdAt).toLocaleDateString("vi-VN"),
      readingTime: this.calculateReadingTime(blog.content),
      excerpt: this.generateExcerpt(blog.content),
    };
  }

  // Calculate estimated reading time
  calculateReadingTime(content) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(" ").length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    return readingTime === 1 ? "1 phút đọc" : `${readingTime} phút đọc`;
  }

  // Generate excerpt from content
  generateExcerpt(content, maxLength = 150) {
    if (content.length <= maxLength) {
      return content;
    }

    const excerpt = content.substring(0, maxLength);
    const lastSpaceIndex = excerpt.lastIndexOf(" ");

    return lastSpaceIndex > 0
      ? excerpt.substring(0, lastSpaceIndex) + "..."
      : excerpt + "...";
  }

  // Get blog categories (if endpoint exists)
  async getBlogCategories() {
    return this.makeRequest("/blogs/categories", {
      method: HTTP_METHODS.GET,
    });
  }

  // Share blog functionality
  generateShareData(blog) {
    return {
      title: blog.title,
      message: `Đọc bài viết: ${blog.title}`,
      url: `${BASE_URL}/blogs/${blog._id}`, // Adjust based on your web URL structure
    };
  }

  // Format blog list for display
  formatBlogList(blogs) {
    return blogs.map((blog) => this.formatBlogContent(blog));
  }
}

export default new BlogService();
