import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';

function Photos({ user }) {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { fetchPhotos, addPhoto, updatePhoto, deletePhoto } = useContext(DataContext);

  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // New photo form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newThumb, setNewThumb] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Editing
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editThumb, setEditThumb] = useState('');

  // Full image viewer
  const [viewingPhoto, setViewingPhoto] = useState(null);

  useEffect(() => {
    const loadPhotos = async () => {
      setLoading(true);
      const result = await fetchPhotos(albumId);
      if (result.success) {
        setPhotos(result.data);
        setError('');
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    loadPhotos();
  }, [albumId, fetchPhotos]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim() || !newThumb.trim()) return;
    setError('');

    const result = await addPhoto(albumId, newTitle, newUrl, newThumb);
    if (result.success) {
      setPhotos((prev) => [...prev, result.data]);
      setNewTitle('');
      setNewUrl('');
      setNewThumb('');
      setShowForm(false);
    } else {
      setError(result.error);
    }
  };

  const startEditing = (photo) => {
    setEditingPhotoId(photo.id);
    setEditTitle(photo.title);
    setEditUrl(photo.url);
    setEditThumb(photo.thumbnail_url);
  };

  const cancelEditing = () => {
    setEditingPhotoId(null);
    setEditTitle('');
    setEditUrl('');
    setEditThumb('');
  };

  const handleSaveEdit = async (photoId) => {
    if (!editTitle.trim() || !editUrl.trim() || !editThumb.trim()) return;
    setError('');
    const result = await updatePhoto(photoId, { title: editTitle, url: editUrl, thumbnail_url: editThumb });
    if (result.success) {
      setPhotos((prev) => prev.map(p => p.id === photoId ? { ...p, title: editTitle, url: editUrl, thumbnail_url: editThumb } : p));
      setEditingPhotoId(null);
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) return;
    setError('');
    const result = await deletePhoto(photoId);
    if (result.success) {
      setPhotos((prev) => prev.filter(p => p.id !== photoId));
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-success mb-0">Photos in Album #{albumId}</h3>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm fw-bold" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'ביטול' : 'Add Photo'}
          </button>
          <button className="btn btn-outline-secondary btn-sm fw-bold" onClick={() => navigate(`/users/${user.username}/albums`)}>
            Back to Albums
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-light p-3 rounded mb-4 shadow-sm border border-primary border-opacity-25">
          <h5 className="mb-3 text-primary">הוספת תמונה חדשה</h5>
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="כותרת התמונה"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <input
              type="url"
              className="form-control"
              placeholder="כתובת URL של התמונה"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="url"
              className="form-control"
              placeholder="כתובת URL של תמונה ממוזערת (thumbnail)"
              value={newThumb}
              onChange={(e) => setNewThumb(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary fw-bold">הוסף תמונה</button>
        </form>
      )}

      {photos.length === 0 ? (
        <p className="text-center text-muted">אין תמונות באלבום זה עדיין.</p>
      ) : (
        <div className="row g-3">
          {photos.map(photo => {
            const isEditing = editingPhotoId === photo.id;
            return (
              <div className="col-6 col-md-4 col-lg-3" key={photo.id}>
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.title}
                    className="card-img-top"
                    style={{ height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setViewingPhoto(photo)}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                  />
                  <div className="card-body p-2 d-flex flex-column">
                    {isEditing ? (
                      <div>
                        <label className="form-label small fw-bold mb-0">שם</label>
                        <input
                          className="form-control form-control-sm mb-1"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                        />
                        <label className="form-label small fw-bold mb-0">תמונה</label>
                        <input
                          className="form-control form-control-sm mb-1"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                        />
                        <label className="form-label small fw-bold mb-0">תמונה מקדימה</label>
                        <input
                          className="form-control form-control-sm mb-1"
                          value={editThumb}
                          onChange={(e) => setEditThumb(e.target.value)}
                        />
                        <div className="d-flex gap-1">
                          <button className="btn btn-success btn-sm flex-grow-1" onClick={() => handleSaveEdit(photo.id)}>שמור</button>
                          <button className="btn btn-secondary btn-sm flex-grow-1" onClick={cancelEditing}>ביטול</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="card-text small text-truncate mb-1 fw-bold" title={photo.title}>{photo.title}</p>
                        <div className="d-flex justify-content-end gap-1 mt-auto">
                          <button className="btn btn-sm btn-link text-secondary p-0 text-decoration-none" title="Edit" onClick={() => startEditing(photo)}>Edit</button>
                          <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" title="Delete" onClick={() => handleDelete(photo.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full image modal */}
      {viewingPhoto && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, cursor: 'pointer' }}
          onClick={() => setViewingPhoto(null)}
        >
          <div className="text-center" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={viewingPhoto.url}
              alt={viewingPhoto.title}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=Image+Not+Found'; }}
            />
            <p className="text-white mt-2 fw-bold">{viewingPhoto.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Photos;
