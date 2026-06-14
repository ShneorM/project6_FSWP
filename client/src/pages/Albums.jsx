import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';

function Albums({ user }) {
  const { albums, albumsError, fetchAlbums, addAlbum, updateAlbum, deleteAlbum } = useContext(DataContext);
  const [newTitle, setNewTitle] = useState('');
  const [localError, setLocalError] = useState('');
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  const error = localError || albumsError;

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLocalError('');

    const result = await addAlbum(newTitle);
    if (result.success) {
      setNewTitle('');
    } else {
      setLocalError(result.error);
    }
  };

  const startEditing = (album) => {
    setEditingAlbumId(album.id);
    setEditTitle(album.title);
  };

  const cancelEditing = () => {
    setEditingAlbumId(null);
    setEditTitle('');
  };

  const handleSaveEdit = async (albumId) => {
    if (!editTitle.trim()) return;
    setLocalError('');
    const result = await updateAlbum(albumId, editTitle);
    if (result.success) {
      setEditingAlbumId(null);
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (albumId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק אלבום זה?')) return;
    setLocalError('');
    const result = await deleteAlbum(albumId);
    if (!result.success) alert(result.error);
  };

  const handleOpenPhotos = (albumId) => {
    navigate(`/users/${user.username}/albums/${albumId}/photos`);
  };

  return (
    <div>
      <h3 className="text-center text-success mb-4">My Albums</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleCreate} className="d-flex mb-4 gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="שם האלבום החדש..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className="btn btn-success fw-bold">צור</button>
      </form>

      {albums.length === 0 ? (
        <p className="text-center text-muted">אין אלבומים עדיין. צור את האלבום הראשון שלך!</p>
      ) : (
        <div className="row g-3">
          {albums.map(album => {
            const isEditing = editingAlbumId === album.id;
            return (
              <div className="col-12 col-md-6 col-lg-4" key={album.id}>
                <div className="card h-100 shadow-sm border-primary border-2">
                  <div className="card-body d-flex flex-column">
                    {isEditing ? (
                      <div className="mb-2">
                        <input
                          className="form-control mb-2 fw-bold text-primary"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                        />
                        <div className="d-flex gap-2">
                          <button className="btn btn-success btn-sm flex-grow-1" onClick={() => handleSaveEdit(album.id)}>שמור</button>
                          <button className="btn btn-secondary btn-sm flex-grow-1" onClick={cancelEditing}>ביטול</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title text-primary mb-0">Album: {album.title}</h5>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-link text-secondary p-0 text-decoration-none" title="Edit" onClick={() => startEditing(album)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" title="Delete" onClick={() => handleDelete(album.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="card-text text-muted small mb-3">אלבום #{album.id}</p>
                      </>
                    )}

                    {!isEditing && (
                      <button
                        className="btn btn-outline-primary btn-sm mt-auto fw-bold"
                        onClick={() => handleOpenPhotos(album.id)}
                      >
                        View Photos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Albums;
