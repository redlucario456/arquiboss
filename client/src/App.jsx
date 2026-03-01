import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './styles.css';
import Weather from './components/Weather';
import ContactForm from './components/ContactForm';
import ProjectCard from './components/ProjectCard';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [proyectos, setProyectos] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [yoshi, setYoshi] = useState(false);
    const [proyectoAEditar, setProyectoAEditar] = useState(null);

    // ✅ CORREGIDO PARA PRODUCCIÓN Y LOCAL
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        fetchContenido();

        let keys = [];
        const handleKeyDown = (e) => {
            keys.push(e.key);
            if (keys.length > 4) keys.shift();

            if (keys.join('') === "ArrowUpArrowUpArrowDownArrowDown") {
                setYoshi(true);
                Swal.fire({ title: '🦖 ¡Yoshi Mode!', timer: 1000, showConfirmButton: false });
            }

            if (e.key === 'Escape') {
                setYoshi(false);
                setProyectoAEditar(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [token]);

    const fetchContenido = async () => {
        try {
            const resProyectos = await fetch(`${API_BASE_URL}/api/proyectos?t=${Date.now()}`);
            if (resProyectos.ok) {
                const datosProyectos = await resProyectos.json();
                setProyectos(datosProyectos);
            }

            if (token) {
                const resMensajes = await fetch(`${API_BASE_URL}/api/mensajes?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resMensajes.ok) {
                    const datosMensajes = await resMensajes.json();
                    setMensajes(datosMensajes);
                }
            }

        } catch (error) {
            console.error("Error cargando contenido:", error);
        }
    };

    const borrarElemento = async (id, esMensaje = false) => {
        const result = await Swal.fire({
            title: esMensaje ? '¿Eliminar consulta?' : '¿Demoler proyecto?',
            text: "Esta acción eliminará el registro permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4757',
            cancelButtonColor: '#2f3542',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1e1e1e',
            color: '#fff'
        });

        if (result.isConfirmed) {
            const endpoint = esMensaje ? 'mensajes' : 'proyectos';

            try {
                const res = await fetch(`${API_BASE_URL}/api/${endpoint}/${id}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    await Swal.fire({
                        title: '¡Eliminado!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchContenido();
                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Error al eliminar");
                }

            } catch (error) {
                console.error("Error al borrar:", error);
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error'
                });
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        window.location.reload();
    };

    return (
        <div className="App">
            <header>
                <h1 style={{ color: yoshi ? '#44af35' : 'white' }}>ArquiBOSS</h1>

                {!token ? (
                    <Link to="/login" className="auth-link"> Acceso Admin </Link>
                ) : (
                    <button onClick={logout} className="auth-link logout-btn">
                        Cerrar Sesión
                    </button>
                )}
            </header>

            <Weather />

            {token && (
                <div>
                    <h2>Consultas de Clientes</h2>
                    <div>
                        {mensajes.length > 0 ? mensajes.map(m => (
                            <div key={m.id}>
                                <strong>{m.remitente}</strong>
                                <p>{m.contenido}</p>
                                <button onClick={() => borrarElemento(m.id, true)}>
                                    Eliminar
                                </button>
                            </div>
                        )) : <p>Sin mensajes</p>}
                    </div>
                </div>
            )}

            <section>
                <h2>Proyectos</h2>
                <div>
                    {proyectos.length > 0 ? proyectos.map(p => (
                        <ProjectCard 
                            key={p.id}
                            proyecto={p}
                            isAdmin={!!token}
                            onRefresh={fetchContenido}
                            onDelete={() => borrarElemento(p.id)}
                            onEdit={() => setProyectoAEditar(p)}
                        />
                    )) : <p>No hay proyectos</p>}
                </div>
            </section>

            <ContactForm 
                isAdmin={!!token}
                onRefresh={fetchContenido}
                editData={proyectoAEditar}
                setEditData={setProyectoAEditar}
                token={token}
            />

            {yoshi && (
                <img src="https://media.giphy.com/media/Z6f79Ewt6L_t6/giphy.gif" alt="yoshi" />
            )}

            <footer>
                <p>© 2026 ArquiBOSS</p>
            </footer>
        </div>
    );
}

export default App;