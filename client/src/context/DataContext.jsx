import { createContext, useState, useCallback } from 'react';
import api from '../services/api';

export const DataContext = createContext(null);

export function DataProvider({ user, children }) {
  // Todos state
  const [todos, setTodos] = useState([]);
  const [isTodosLoaded, setIsTodosLoaded] = useState(false);
  const [todosError, setTodosError] = useState('');

  // Posts state
  const [posts, setPosts] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [isPostsLoaded, setIsPostsLoaded] = useState(false);
  const [postsError, setPostsError] = useState('');

  // Albums state
  const [albums, setAlbums] = useState([]);
  const [isAlbumsLoaded, setIsAlbumsLoaded] = useState(false);
  const [albumsError, setAlbumsError] = useState('');

  // ========================
  // Todos Actions
  // ========================
  const fetchTodos = useCallback(async () => {
    if (isTodosLoaded || !user) return; // Cache hit or no user
    try {
      const response = await api.get(`/todos?userId=${user.id}`);
      setTodos(response.data);
      setIsTodosLoaded(true);
      setTodosError('');
    } catch (err) {
      setTodosError('שגיאה בטעינת משימות');
    }
  }, [user, isTodosLoaded]);

  const addTodo = async (title) => {
    try {
      const response = await api.post('/todos', { user_id: user.id, title });
      setTodos((prev) => [...prev, response.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה ביצירת משימה' };
    }
  };

  const updateTodo = async (todoId, updatedFields) => {
    try {
      await api.put(`/todos/${todoId}`, { ...updatedFields, user_id: user.id });
      setTodos((prev) => prev.map(t => t.id === todoId ? { ...t, ...updatedFields } : t));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה בעדכון משימה' };
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      await api.delete(`/todos/${todoId}`, { data: { user_id: user.id } });
      setTodos((prev) => prev.filter(t => t.id !== todoId));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה במחיקת משימה' };
    }
  };

  // ========================
  // Posts Actions
  // ========================
  const fetchPosts = useCallback(async () => {
    if (isPostsLoaded) return; // Cache hit
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get('/posts'),
        api.get('/users')
      ]);
      
      const uMap = {};
      usersRes.data.forEach(u => { uMap[u.id] = u.username; });
      setUsersMap(uMap);
      setPosts(postsRes.data);
      setIsPostsLoaded(true);
      setPostsError('');
    } catch (err) {
      setPostsError('שגיאה בטעינת נתונים');
    }
  }, [isPostsLoaded]);

  const addPost = async (title, body) => {
    try {
      const response = await api.post('/posts', { user_id: user.id, title, body });
      setPosts((prev) => [...prev, response.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה ביצירת פוסט' };
    }
  };

  const updatePost = async (postId, title, body) => {
    try {
      await api.put(`/posts/${postId}`, { user_id: user.id, title, body });
      setPosts((prev) => prev.map(p => p.id === postId ? { ...p, title, body } : p));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה בעדכון הפוסט' };
    }
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`, { data: { user_id: user.id } });
      setPosts((prev) => prev.filter(p => p.id !== postId));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה במחיקת הפוסט' };
    }
  };

  // ========================
  // Albums Actions
  // ========================
  const fetchAlbums = useCallback(async () => {
    if (isAlbumsLoaded || !user) return;
    try {
      const response = await api.get(`/albums?userId=${user.id}`);
      setAlbums(response.data);
      setIsAlbumsLoaded(true);
      setAlbumsError('');
    } catch (err) {
      setAlbumsError('שגיאה בטעינת אלבומים');
    }
  }, [user, isAlbumsLoaded]);

  const addAlbum = async (title) => {
    try {
      const response = await api.post('/albums', { user_id: user.id, title });
      setAlbums((prev) => [...prev, response.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה ביצירת אלבום' };
    }
  };

  const updateAlbum = async (albumId, title) => {
    try {
      await api.put(`/albums/${albumId}`, { user_id: user.id, title });
      setAlbums((prev) => prev.map(a => a.id === albumId ? { ...a, title } : a));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה בעדכון אלבום' };
    }
  };

  const deleteAlbum = async (albumId) => {
    try {
      await api.delete(`/albums/${albumId}`, { data: { user_id: user.id } });
      setAlbums((prev) => prev.filter(a => a.id !== albumId));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה במחיקת אלבום' };
    }
  };

  // ========================
  // Photos Actions
  // ========================
  const fetchPhotos = async (albumId) => {
    try {
      const response = await api.get(`/photos?albumId=${albumId}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: 'שגיאה בטעינת תמונות' };
    }
  };

  const addPhoto = async (album_id, title, url, thumbnail_url) => {
    try {
      const response = await api.post('/photos', { album_id, title, url, thumbnail_url, user_id: user.id });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: 'שגיאה בהוספת תמונה' };
    }
  };

  const updatePhoto = async (photoId, updatedFields) => {
    try {
      await api.put(`/photos/${photoId}`, { ...updatedFields, user_id: user.id });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה בעדכון תמונה' };
    }
  };

  const deletePhoto = async (photoId) => {
    try {
      await api.delete(`/photos/${photoId}`, { data: { user_id: user.id } });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'שגיאה במחיקת תמונה' };
    }
  };

  return (
    <DataContext.Provider value={{
      todos, todosError, fetchTodos, addTodo, updateTodo, deleteTodo,
      posts, usersMap, postsError, fetchPosts, addPost, updatePost, deletePost,
      albums, albumsError, fetchAlbums, addAlbum, updateAlbum, deleteAlbum,
      fetchPhotos, addPhoto, updatePhoto, deletePhoto
    }}>
      {children}
    </DataContext.Provider>
  );
}
