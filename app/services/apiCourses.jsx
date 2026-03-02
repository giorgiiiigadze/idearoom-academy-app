import supabase from "./supabase";

/**
 * In-memory cache with TTL support
 * Best practice: Shorter TTL (5 minutes) for faster updates after admin changes
 */
const cache = {
  data: {},
  timeouts: {},

  // Cache duration in milliseconds (5 minutes - reduced from 30 minutes for faster updates)
  DEFAULT_TTL: 300000, // 5 minutes instead of 30 minutes

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {*} The cached value
   */
  set(key, value, ttl = this.DEFAULT_TTL) {
    // Don't cache null/undefined values
    if (value === null || value === undefined) {
      return value;
    }

    this.data[key] = value;

    // Clear any existing timeout
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
    }

    // Set expiration timeout
    this.timeouts[key] = setTimeout(() => {
      delete this.data[key];
      delete this.timeouts[key];
    }, ttl);

    return value;
  },

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    return this.data[key];
  },

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return key in this.data;
  },

  /**
   * Invalidate a specific cache key
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    delete this.data[key];
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
      delete this.timeouts[key];
    }
  },

  /**
   * Invalidate all cache entries
   */
  invalidateAll() {
    Object.keys(this.timeouts).forEach((key) => {
      clearTimeout(this.timeouts[key]);
    });
    this.data = {};
    this.timeouts = {};
  },
};

/**
 * Get all courses
 * @returns {Promise<Array>} Array of courses
 */
export async function getCourses() {
  const cacheKey = "all_courses";

  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    // Ensure we return an array even if cached value is somehow invalid
    return Array.isArray(cached) ? cached : [];
  }

  try {
    const { data, error } = await supabase.from("courses").select("*");

    if (error) {
      console.error("Error in getCourses:", error);
      return [];
    }

    // Store in cache and return (only cache valid arrays)
    const courses = Array.isArray(data) ? data : [];
    return cache.set(cacheKey, courses);
  } catch (err) {
    console.error("Unexpected error in getCourses:", err);
    return [];
  }
}

/**
 * Get a single course by ID
 * @param {number} id - Course ID
 * @returns {Promise<Object|null>} Course data or null if not found
 */
export async function getCourseById(id) {
  const cacheKey = `course_${id}`;

  // Check cache first
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    // If not in cache, fetch from Supabase
    const { data, error } = await supabase
      .from("courses")
      .select("*, syllabus_title, syllabus_content")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching course ${id}:`, error);
      // Don't cache errors - return null
      return null;
    }

    // Only cache valid data
    if (!data) {
      return null;
    }

    // Store in cache and return
    return cache.set(cacheKey, data);
  } catch (err) {
    console.error(`Unexpected error in getCourseById for course ${id}:`, err);
    return null;
  }
}

/**
 * Get limited courses (latest 4)
 * @returns {Promise<Array>} Array of latest 4 courses
 */
export async function getLimitedCourse() {
  const cacheKey = "limited_courses";

  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    return Array.isArray(cached) ? cached : [];
  }

  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id", { ascending: false })
      .limit(4);

    if (error) {
      console.error("Error in getLimitedCourse:", error);
      return [];
    }

    // Store in cache and return (only cache valid arrays)
    const courses = Array.isArray(data) ? data : [];
    return cache.set(cacheKey, courses);
  } catch (err) {
    console.error("Unexpected error in getLimitedCourse:", err);
    return [];
  }
}

/**
 * Invalidate cache for courses
 * Best practice: Invalidate both specific course and collection caches
 * @param {number|null} id - Optional course ID to invalidate specific course
 */
export function invalidateCache(id = null) {
  if (id) {
    // Invalidate specific course
    cache.invalidate(`course_${id}`);
  }

  // Always invalidate ALL collection caches to ensure complete refresh
  cache.invalidate("all_courses");
  cache.invalidate("limited_courses");

  // Force invalidate all course-related cache entries
  // This ensures related courses sections are also updated
  Object.keys(cache.data).forEach((key) => {
    if (key.startsWith("course_") || key.includes("courses")) {
      cache.invalidate(key);
    }
  });

  console.log(
    id
      ? `Cache invalidated for course ${id} and all collections`
      : "All course caches invalidated"
  );
}

/**
 * Force clear all cache
 * Best practice: Use this when you need to ensure fresh data
 */
export function clearAllCache() {
  console.log("Clearing all course cache...");
  cache.invalidateAll();
}

/**
 * Delete a course and invalidate all related cache
 * Note: This is a server-side function - browser cache clearing should be handled by the client
 * @param {number} id - Course ID to delete
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteCourse(id) {
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting course:", error);
      throw error;
    }

    // Aggressively invalidate cache for deleted course
    console.log(`Deleting course ${id} and clearing relevant cache...`);

    // Invalidate specific course cache
    invalidateCache(id);

    // Force clear all course-related cache entries
    Object.keys(cache.data).forEach((key) => {
      if (
        key.includes("course") ||
        key.includes("all_") ||
        key.includes("limited_")
      ) {
        cache.invalidate(key);
      }
    });

    // Note: Browser cache clearing should be handled by the client-side code
    // Server-side functions should not reference 'window' or browser APIs

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in deleteCourse:", err);
    throw err;
  }
}

/**
 * Add a new course and invalidate cache
 * @param {Object} courseData - Course data to insert
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function addCourse(courseData) {
  try {
    const { data, error } = await supabase
      .from("courses")
      .insert([courseData])
      .select()
      .single();

    if (error) {
      console.error("Error adding course:", error);
      throw error;
    }

    if (!data) {
      throw new Error("Course was not created - no data returned");
    }

    // Invalidate all course-related cache to ensure new course appears everywhere
    console.log(
      `Adding new course (ID: ${data.id}) and invalidating relevant cache...`
    );

    // Invalidate all course caches so new course appears in all lists
    invalidateCache();

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error in addCourse:", err);
    throw err;
  }
}

/**
 * Update a course and invalidate cache
 * @param {number} id - Course ID to update
 * @param {Object} courseData - Course data to update
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function updateCourse(id, courseData) {
  try {
    const { data, error } = await supabase
      .from("courses")
      .update(courseData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating course:", error);
      throw error;
    }

    if (!data) {
      throw new Error(`Course ${id} was not found or not updated`);
    }

    // Invalidate cache for this specific course and all collections
    // This ensures updated course appears correctly everywhere
    console.log(`Updating course ${id} and invalidating relevant cache...`);
    invalidateCache(id);

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error in updateCourse:", err);
    throw err;
  }
}
