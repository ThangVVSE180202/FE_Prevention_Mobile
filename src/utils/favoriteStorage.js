import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favorite_courses";

export const favoriteStorage = {
  // Lấy danh sách khóa học yêu thích
  getFavorites: async () => {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  },

  // Thêm khóa học vào danh sách yêu thích
  addFavorite: async (courseId) => {
    try {
      const favorites = await favoriteStorage.getFavorites();
      if (!favorites.includes(courseId)) {
        favorites.push(courseId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  },

  // Xóa khóa học khỏi danh sách yêu thích
  removeFavorite: async (courseId) => {
    try {
      const favorites = await favoriteStorage.getFavorites();
      const updatedFavorites = favorites.filter((id) => id !== courseId);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
      return updatedFavorites;
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  },

  // Kiểm tra khóa học có trong danh sách yêu thích không
  isFavorite: async (courseId) => {
    try {
      const favorites = await favoriteStorage.getFavorites();
      return favorites.includes(courseId);
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  },

  // Xóa tất cả khóa học yêu thích
  clearAllFavorites: async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      return [];
    } catch (error) {
      console.error("Error clearing favorites:", error);
      throw error;
    }
  },
};
